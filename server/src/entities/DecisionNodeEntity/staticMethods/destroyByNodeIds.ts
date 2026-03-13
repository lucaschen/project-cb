import { Op, type Transaction } from "sequelize";

import { DecisionNode } from "~db/models/DecisionNode";
import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function destroyByNodeIds(
  this: typeof DecisionNodeEntity,
  nodeIds: string[],
  transaction: Transaction,
): Promise<void> {
  await DecisionNodeCondition.destroy({
    transaction,
    where: {
      nodeId: {
        [Op.in]: nodeIds,
      },
    },
  });

  await DecisionNode.destroy({
    transaction,
    where: {
      nodeId: {
        [Op.in]: nodeIds,
      },
    },
  });

  await NodeCoordinate.destroy({
    transaction,
    where: {
      nodeId: {
        [Op.in]: nodeIds,
      },
    },
  });

  await Node.destroy({
    transaction,
    where: {
      id: {
        [Op.in]: nodeIds,
      },
    },
  });
}
