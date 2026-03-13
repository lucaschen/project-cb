import type { BuilderDecisionNodeInputType } from "@packages/shared/http/schemas/flows/builder/common";
import { NodeType } from "@packages/shared/types/enums";
import type { Transaction } from "sequelize";

import { DecisionNode } from "~db/models/DecisionNode";
import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function syncBuilderDecisionNodes(
  this: typeof DecisionNodeEntity,
  {
    decisionNodes,
    existingByNodeId,
    existingNodeIds,
    flowId,
    transaction,
  }: {
    decisionNodes: BuilderDecisionNodeInputType[];
    existingByNodeId: Map<string, DecisionNodeEntity>;
    existingNodeIds: Set<string>;
    flowId: string;
    transaction: Transaction;
  },
): Promise<void> {
  for (const decisionNode of decisionNodes) {
    if (existingNodeIds.has(decisionNode.nodeId)) {
      await Node.update(
        {
          name: decisionNode.name,
        },
        {
          transaction,
          where: {
            id: decisionNode.nodeId,
          },
        },
      );
    } else {
      await Node.create(
        {
          flowId,
          id: decisionNode.nodeId,
          name: decisionNode.name,
          type: NodeType.DECISION,
        },
        { transaction },
      );
    }

    await NodeCoordinate.upsert(
      {
        nodeId: decisionNode.nodeId,
        x: decisionNode.coordinates.x,
        y: decisionNode.coordinates.y,
      },
      { transaction },
    );

    const decisionNodeEntity =
      existingByNodeId.get(decisionNode.nodeId) ??
      new this(
        await DecisionNode.create(
          {
            fallbackNextNodeId: decisionNode.fallbackNextNodeId,
            nodeId: decisionNode.nodeId,
          },
          { transaction },
        ),
      );

    await decisionNodeEntity.updateFromInput(decisionNode, transaction);
  }
}
