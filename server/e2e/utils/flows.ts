import { ComparisonOperation, NodeType } from "@packages/shared/types/enums";
import { randomUUID } from "crypto";

import { DecisionNode } from "~db/models/DecisionNode";
import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";
import { Step } from "~db/models/Step";
import FlowEntity from "~entities/FlowEntity/FlowEntity";

export const seedFlow = async ({
  description = null,
  name = `Flow ${randomUUID()}`,
  organizationId,
  slug = `flow-${randomUUID()}`,
}: {
  description?: string | null;
  name?: string;
  organizationId: string;
  slug?: string;
}) => {
  return await FlowEntity.create({
    description,
    name,
    organizationId,
    slug,
  });
};

export const seedFlowWithGraph = async ({
  description = null,
  flowName = `Flow ${randomUUID()}`,
  organizationId,
  slug = `flow-${randomUUID()}`,
}: {
  description?: string | null;
  flowName?: string;
  organizationId: string;
  slug?: string;
}) => {
  const flowEntity = await seedFlow({
    description,
    name: flowName,
    organizationId,
    slug,
  });

  const stepNodeId = randomUUID();
  const decisionNodeId = randomUUID();
  const conditionId = randomUUID();

  await Node.create({
    flowId: flowEntity.dbModel.id,
    id: stepNodeId,
    name: "A step",
    type: NodeType.STEP,
  });
  await Step.create({
    nextNodeId: decisionNodeId,
    nodeId: stepNodeId,
    order: 0,
  });
  await NodeCoordinate.create({
    nodeId: stepNodeId,
    x: 10,
    y: 20,
  });

  await Node.create({
    flowId: flowEntity.dbModel.id,
    id: decisionNodeId,
    name: "B decision",
    type: NodeType.DECISION,
  });
  await DecisionNode.create({
    fallbackNextNodeId: stepNodeId,
    nodeId: decisionNodeId,
  });
  await DecisionNodeCondition.create({
    id: conditionId,
    nodeId: decisionNodeId,
    order: 0,
    statement: {
      leftValue: "left",
      operator: ComparisonOperation.EQ,
      rightValue: "right",
      type: "comparison",
    },
    toNodeId: stepNodeId,
  });

  return {
    conditionId,
    decisionNodeId,
    flowEntity,
    stepNodeId,
  };
};
