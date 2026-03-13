import type { BuilderDecisionNodeInputType } from "@packages/shared/http/schemas/flows/builder/common";
import { Op, type Transaction } from "sequelize";

import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function updateFromInput(
  this: DecisionNodeEntity,
  input: BuilderDecisionNodeInputType,
  transaction?: Transaction,
): Promise<DecisionNodeEntity> {
  this.dbModel.fallbackNextNodeId = input.fallbackNextNodeId;

  await this.dbModel.save({ transaction });

  await Promise.all(
    input.conditions.map((condition, index) =>
      DecisionNodeCondition.upsert(
        {
          id: condition.id,
          nodeId: this.dbModel.nodeId,
          order: index,
          statement: condition.statement,
          toNodeId: condition.toNodeId,
        },
        { transaction },
      ),
    ),
  );

  if (input.conditions.length === 0) {
    await DecisionNodeCondition.destroy({
      transaction,
      where: {
        nodeId: this.dbModel.nodeId,
      },
    });
  } else {
    await DecisionNodeCondition.destroy({
      transaction,
      where: {
        id: {
          [Op.notIn]: input.conditions.map((condition) => condition.id),
        },
        nodeId: this.dbModel.nodeId,
      },
    });
  }

  await this.dbModel.reload({ transaction });

  return this;
}
