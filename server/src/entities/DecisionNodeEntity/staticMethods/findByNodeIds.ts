import { Op, type Transaction } from "sequelize";

import { DecisionNode } from "~db/models/DecisionNode";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function findByNodeIds(
  this: typeof DecisionNodeEntity,
  nodeIds: string[],
  transaction?: Transaction,
): Promise<DecisionNodeEntity[]> {
  const decisionNodes = await DecisionNode.findAll({
    transaction,
    where: {
      nodeId: { [Op.in]: nodeIds },
    },
  });

  return decisionNodes.map((decisionNode) => new this(decisionNode));
}
