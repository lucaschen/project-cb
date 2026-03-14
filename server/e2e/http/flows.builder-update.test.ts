import { updateBuilderOutput } from "@packages/shared/http/schemas/flows/builder/updateBuilder";
import { fetchFlowOutput } from "@packages/shared/http/schemas/flows/fetchFlow";
import {
  ComparisonOperation,
  NodeType,
  OrganizationUserPermission,
} from "@packages/shared/types/enums";
import { randomUUID } from "crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DecisionNode } from "~db/models/DecisionNode";
import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";
import { Step } from "~db/models/Step";
import { StepElement } from "~db/models/StepElement";

import { createTestApp } from "../utils/app";
import {
  resetTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from "../utils/db";
import { seedFlow, seedFlowWithGraph } from "../utils/flows";
import { seedOrganizationForUser } from "../utils/organizations";
import { createAuthenticatedUser } from "../utils/users";

const seedFlowWithDecisionReferencingStepElement = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const flowEntity = await seedFlow({
    name: "Reference flow",
    organizationId,
    slug: "reference-flow",
  });

  const removedStepNodeId = randomUUID();
  const survivingStepNodeId = randomUUID();
  const decisionNodeId = randomUUID();
  const decisionConditionId = randomUUID();
  const referencedStepElementId = "be05ReferencedStepElement";

  await Node.create({
    flowId: flowEntity.dbModel.id,
    id: removedStepNodeId,
    name: "A removable step",
    type: NodeType.STEP,
  });
  await Step.create({
    nextNodeId: decisionNodeId,
    nodeId: removedStepNodeId,
    order: 0,
  });
  await NodeCoordinate.create({
    nodeId: removedStepNodeId,
    x: 10,
    y: 20,
  });
  await StepElement.create({
    elementId: "textInput",
    id: referencedStepElementId,
    name: "Referenced input",
    order: 0,
    stepId: removedStepNodeId,
  });

  await Node.create({
    flowId: flowEntity.dbModel.id,
    id: survivingStepNodeId,
    name: "C surviving step",
    type: NodeType.STEP,
  });
  await Step.create({
    nextNodeId: null,
    nodeId: survivingStepNodeId,
    order: 1,
  });
  await NodeCoordinate.create({
    nodeId: survivingStepNodeId,
    x: 30,
    y: 40,
  });

  await Node.create({
    flowId: flowEntity.dbModel.id,
    id: decisionNodeId,
    name: "B decision",
    type: NodeType.DECISION,
  });
  await DecisionNode.create({
    fallbackNextNodeId: survivingStepNodeId,
    nodeId: decisionNodeId,
  });
  await NodeCoordinate.create({
    nodeId: decisionNodeId,
    x: 50,
    y: 60,
  });
  await DecisionNodeCondition.create({
    id: decisionConditionId,
    nodeId: decisionNodeId,
    order: 0,
    statement: {
      leftValue: {
        stepElementId: referencedStepElementId,
        type: "stepElementValue",
      },
      operator: ComparisonOperation.EQ,
      rightValue: "yes",
      type: "comparison",
    },
    toNodeId: survivingStepNodeId,
  });

  return {
    decisionConditionId,
    decisionNodeId,
    flowEntity,
    referencedStepElementId,
    removedStepNodeId,
    survivingStepNodeId,
  };
};

describe("flow builder update routes", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("PUT /flows/:flowId/builder", () => {
    it("creates a full builder graph in one request and returns the canonical fetch shape", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "builder-create-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        name: "Empty builder flow",
        organizationId: organization.dbModel.id,
        slug: "empty-builder-flow",
      });

      const introStepNodeId = randomUUID();
      const finishStepNodeId = randomUUID();
      const decisionNodeId = randomUUID();
      const conditionId = randomUUID();

      const payload = {
        decisionNodes: [
          {
            conditions: [
              {
                id: conditionId,
                statement: {
                  leftValue: "left",
                  operator: ComparisonOperation.EQ,
                  rightValue: "right",
                  type: "comparison",
                },
                toNodeId: finishStepNodeId,
              },
            ],
            coordinates: { x: 50, y: 60 },
            fallbackNextNodeId: finishStepNodeId,
            name: "B decision",
            nodeId: decisionNodeId,
          },
        ],
        steps: [
          {
            coordinates: { x: 10, y: 20 },
            name: "A intro step",
            nextNodeId: decisionNodeId,
            nodeId: introStepNodeId,
          },
          {
            coordinates: { x: 70, y: 80 },
            name: "C finish step",
            nextNodeId: null,
            nodeId: finishStepNodeId,
          },
        ],
      };

      const response = await agent
        .put(`/flows/${flowEntity.dbModel.id}/builder`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(updateBuilderOutput.parse(response.body)).toEqual({
        flow: {
          ...flowEntity.getPayload(),
          nodes: [
            {
              coordinates: { x: 10, y: 20 },
              elements: [],
              name: "A intro step",
              nextNodeId: decisionNodeId,
              nodeId: introStepNodeId,
              type: NodeType.STEP,
            },
            {
              conditions: [
                {
                  id: conditionId,
                  order: 0,
                  statement: {
                    leftValue: "left",
                    operator: ComparisonOperation.EQ,
                    rightValue: "right",
                    type: "comparison",
                  },
                  toNodeId: finishStepNodeId,
                },
              ],
              coordinates: { x: 50, y: 60 },
              fallbackNextNodeId: finishStepNodeId,
              name: "B decision",
              nodeId: decisionNodeId,
              type: NodeType.DECISION,
            },
            {
              coordinates: { x: 70, y: 80 },
              elements: [],
              name: "C finish step",
              nextNodeId: null,
              nodeId: finishStepNodeId,
              type: NodeType.STEP,
            },
          ],
        },
      });

      const fetchResponse = await agent.get(`/flows/${flowEntity.dbModel.id}`);
      expect(fetchResponse.status).toBe(200);
      expect(fetchFlowOutput.parse(fetchResponse.body)).toEqual(response.body);
    });

    it("rewrites the existing builder graph in one request, including decision routing", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.EDITOR,
        slug: "builder-rewrite-org",
        userId: userEntity.dbModel.id,
      });
      const { conditionId, decisionNodeId, flowEntity, stepNodeId } =
        await seedFlowWithGraph({
          organizationId: organization.dbModel.id,
          slug: "builder-rewrite-flow",
        });

      const introStepNodeId = randomUUID();

      const response = await agent
        .put(`/flows/${flowEntity.dbModel.id}/builder`)
        .send({
          decisionNodes: [
            {
              conditions: [
                {
                  id: conditionId,
                  statement: {
                    leftValue: "updated-left",
                    operator: ComparisonOperation.EQ,
                    rightValue: "updated-right",
                    type: "comparison",
                  },
                  toNodeId: stepNodeId,
                },
              ],
              coordinates: { x: 100, y: 200 },
              fallbackNextNodeId: stepNodeId,
              name: "B decision updated",
              nodeId: decisionNodeId,
            },
          ],
          steps: [
            {
              coordinates: { x: 1, y: 2 },
              name: "A intro step",
              nextNodeId: decisionNodeId,
              nodeId: introStepNodeId,
            },
            {
              coordinates: { x: 300, y: 400 },
              name: "C step updated",
              nextNodeId: null,
              nodeId: stepNodeId,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(updateBuilderOutput.parse(response.body)).toEqual({
        flow: {
          ...flowEntity.getPayload(),
          nodes: [
            {
              coordinates: { x: 1, y: 2 },
              elements: [],
              name: "A intro step",
              nextNodeId: decisionNodeId,
              nodeId: introStepNodeId,
              type: NodeType.STEP,
            },
            {
              conditions: [
                {
                  id: conditionId,
                  order: 0,
                  statement: {
                    leftValue: "updated-left",
                    operator: ComparisonOperation.EQ,
                    rightValue: "updated-right",
                    type: "comparison",
                  },
                  toNodeId: stepNodeId,
                },
              ],
              coordinates: { x: 100, y: 200 },
              fallbackNextNodeId: stepNodeId,
              name: "B decision updated",
              nodeId: decisionNodeId,
              type: NodeType.DECISION,
            },
            {
              coordinates: { x: 300, y: 400 },
              elements: [],
              name: "C step updated",
              nextNodeId: null,
              nodeId: stepNodeId,
              type: NodeType.STEP,
            },
          ],
        },
      });
    });

    it("rejects removing a step when a surviving decision condition still references one of that step's elements", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "builder-invalid-reference-org",
        userId: userEntity.dbModel.id,
      });
      const {
        decisionConditionId,
        decisionNodeId,
        flowEntity,
        removedStepNodeId,
        survivingStepNodeId,
      } = await seedFlowWithDecisionReferencingStepElement({
        organizationId: organization.dbModel.id,
      });

      const response = await agent
        .put(`/flows/${flowEntity.dbModel.id}/builder`)
        .send({
          decisionNodes: [
            {
              conditions: [
                {
                  id: decisionConditionId,
                  statement: {
                    leftValue: {
                      stepElementId: "be05ReferencedStepElement",
                      type: "stepElementValue",
                    },
                    operator: ComparisonOperation.EQ,
                    rightValue: "yes",
                    type: "comparison",
                  },
                  toNodeId: survivingStepNodeId,
                },
              ],
              coordinates: { x: 50, y: 60 },
              fallbackNextNodeId: survivingStepNodeId,
              name: "B decision",
              nodeId: decisionNodeId,
            },
          ],
          steps: [
            {
              coordinates: { x: 30, y: 40 },
              name: "C surviving step",
              nextNodeId: null,
              nodeId: survivingStepNodeId,
            },
          ],
        });

      expect(response.status).toBe(400);

      const removedStepStillExists = await Node.findByPk(removedStepNodeId);
      expect(removedStepStillExists).not.toBeNull();
    });

    it("rejects unauthenticated requests", async () => {
      const { userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        slug: "builder-unauth-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        name: "Unauth builder flow",
        organizationId: organization.dbModel.id,
        slug: "unauth-builder-flow",
      });

      const response = await request(createTestApp())
        .put(`/flows/${flowEntity.dbModel.id}/builder`)
        .send({
          decisionNodes: [],
          steps: [],
        });

      expect(response.status).toBe(401);
    });
  });
});
