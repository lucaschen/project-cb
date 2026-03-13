import { fetchFlowOutput } from "@packages/shared/http/schemas/flows/fetchFlow";
import { updateFlowMetadataOutput } from "@packages/shared/http/schemas/flows/updateFlowMetadata";
import { OrganizationUserPermission } from "@packages/shared/types/enums";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import FlowEntity from "~entities/FlowEntity/FlowEntity";

import { createTestApp } from "../utils/app";
import {
  resetTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from "../utils/db";
import { seedFlow, seedFlowWithGraph } from "../utils/flows";
import { seedOrganizationForUser } from "../utils/organizations";
import { createAuthenticatedUser } from "../utils/users";

describe("flow read and update routes", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("GET /flows/:flowId", () => {
    it("returns an empty builder payload for an accessible empty flow", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "empty-flow-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        description: null,
        name: "Empty flow",
        organizationId: organization.dbModel.id,
        slug: "empty-flow",
      });

      const response = await agent.get(`/flows/${flowEntity.dbModel.id}`);

      expect(response.status).toBe(200);
      expect(fetchFlowOutput.parse(response.body)).toEqual({
        flow: {
          ...flowEntity.getPayload(),
          nodes: [],
        },
      });
    });

    it("returns a populated builder payload for an accessible flow", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "populated-flow-org",
        userId: userEntity.dbModel.id,
      });
      const { conditionId, decisionNodeId, flowEntity, stepNodeId } =
        await seedFlowWithGraph({
          organizationId: organization.dbModel.id,
          slug: "populated-flow",
        });

      const response = await agent.get(`/flows/${flowEntity.dbModel.id}`);

      expect(response.status).toBe(200);
      expect(fetchFlowOutput.parse(response.body)).toEqual({
        flow: {
          ...flowEntity.getPayload(),
          nodes: [
            {
              coordinates: { x: 10, y: 20 },
              elements: [],
              name: "A step",
              nextNodeId: decisionNodeId,
              nodeId: stepNodeId,
              order: 0,
              type: "STEP",
            },
            {
              conditions: [
                {
                  id: conditionId,
                  order: 0,
                  statement: {
                    leftValue: "left",
                    operator: "===",
                    rightValue: "right",
                    type: "comparison",
                  },
                  toNodeId: stepNodeId,
                },
              ],
              coordinates: null,
              fallbackNextNodeId: stepNodeId,
              name: "B decision",
              nodeId: decisionNodeId,
              type: "DECISION",
            },
          ],
        },
      });
    });

    it("rejects unauthenticated fetch requests", async () => {
      const { userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        slug: "unauth-fetch-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        name: "Unauth fetch flow",
        organizationId: organization.dbModel.id,
        slug: "unauth-fetch-flow",
      });

      const response = await request(createTestApp()).get(
        `/flows/${flowEntity.dbModel.id}`,
      );

      expect(response.status).toBe(401);
    });

    it("returns not found for an unknown flow", async () => {
      const { agent } = await createAuthenticatedUser();

      const response = await agent.get("/flows/missing-flow-id");

      expect(response.status).toBe(404);
    });

    it("rejects authenticated users without read access", async () => {
      const { agent } = await createAuthenticatedUser();
      const { userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        slug: "private-flow-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        name: "Private flow",
        organizationId: organization.dbModel.id,
        slug: "private-flow",
      });

      const response = await agent.get(`/flows/${flowEntity.dbModel.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /flows/:flowId", () => {
    it("updates the name while preserving description", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.EDITOR,
        slug: "edit-name-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        description: "Keep me",
        name: "Original name",
        organizationId: organization.dbModel.id,
        slug: "edit-name-flow",
      });

      const response = await agent.patch(`/flows/${flowEntity.dbModel.id}`).send({
        name: "Updated name",
      });

      expect(response.status).toBe(200);
      expect(updateFlowMetadataOutput.parse(response.body)).toMatchObject({
        description: "Keep me",
        id: flowEntity.dbModel.id,
        name: "Updated name",
      });

      const persistedFlow = await FlowEntity.findById(flowEntity.dbModel.id);
      expect(persistedFlow?.dbModel.name).toBe("Updated name");
      expect(persistedFlow?.dbModel.description).toBe("Keep me");
    });

    it("updates the description while preserving name", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "edit-description-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        description: "Original description",
        name: "Original name",
        organizationId: organization.dbModel.id,
        slug: "edit-description-flow",
      });

      const response = await agent.patch(`/flows/${flowEntity.dbModel.id}`).send({
        description: "Updated description",
      });

      expect(response.status).toBe(200);
      expect(updateFlowMetadataOutput.parse(response.body)).toMatchObject({
        description: "Updated description",
        id: flowEntity.dbModel.id,
        name: "Original name",
      });
    });

    it("clears the description to null", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "clear-description-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        description: "To be cleared",
        name: "Flow",
        organizationId: organization.dbModel.id,
        slug: "clear-description-flow",
      });

      const response = await agent.patch(`/flows/${flowEntity.dbModel.id}`).send({
        description: null,
      });

      expect(response.status).toBe(200);
      expect(updateFlowMetadataOutput.parse(response.body).description).toBeNull();

      const persistedFlow = await FlowEntity.findById(flowEntity.dbModel.id);
      expect(persistedFlow?.dbModel.description).toBeNull();
    });

    it("rejects unauthenticated update requests", async () => {
      const { userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        slug: "unauth-update-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        name: "Unauth update flow",
        organizationId: organization.dbModel.id,
        slug: "unauth-update-flow",
      });

      const response = await request(createTestApp())
        .patch(`/flows/${flowEntity.dbModel.id}`)
        .send({ name: "Updated" });

      expect(response.status).toBe(401);
    });

    it("returns not found for an unknown flow", async () => {
      const { agent } = await createAuthenticatedUser();

      const response = await agent.patch("/flows/missing-flow-id").send({
        name: "Updated",
      });

      expect(response.status).toBe(404);
    });

    it("rejects viewers from editing flows", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "viewer-update-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        name: "Viewer flow",
        organizationId: organization.dbModel.id,
        slug: "viewer-update-flow",
      });

      const response = await agent.patch(`/flows/${flowEntity.dbModel.id}`).send({
        name: "Updated",
      });

      expect(response.status).toBe(401);
    });

    it("rejects malformed update payloads", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "malformed-update-org",
        userId: userEntity.dbModel.id,
      });
      const flowEntity = await seedFlow({
        name: "Malformed flow",
        organizationId: organization.dbModel.id,
        slug: "malformed-update-flow",
      });

      const extraFieldResponse = await agent
        .patch(`/flows/${flowEntity.dbModel.id}`)
        .send({ name: "Updated", slug: "not-allowed" });
      const emptyBodyResponse = await agent
        .patch(`/flows/${flowEntity.dbModel.id}`)
        .send({});

      expect(extraFieldResponse.status).toBe(400);
      expect(emptyBodyResponse.status).toBe(400);
    });
  });
});
