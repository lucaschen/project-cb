import { NodeType } from "@packages/shared/types/enums";
import { Op, type Transaction } from "sequelize";

import { DecisionNode } from "~db/models/DecisionNode";
import { Node } from "~db/models/Node";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function findByFlowId(
  this: typeof DecisionNodeEntity,
  flowId: string,
  transaction?: Transaction,
): Promise<DecisionNodeEntity[]> {
  const decisionNodes = await Node.findAll({
    transaction,
    where: {
      flowId,
      type: NodeType.DECISION,
    },
  });

  const decisionModels = await DecisionNode.findAll({
    transaction,
    where: {
      nodeId: {
        [Op.in]: decisionNodes.map((decisionNode) => decisionNode.id),
      },
    },
  });

  return decisionModels.map((decisionModel) => new this(decisionModel));
}
