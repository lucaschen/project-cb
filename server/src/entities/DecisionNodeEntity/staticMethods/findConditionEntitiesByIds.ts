import { Op, type Transaction } from "sequelize";

import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import DecisionNodeConditionEntity from "~entities/DecisionNodeConditionEntity";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function findConditionEntitiesByIds(
  this: typeof DecisionNodeEntity,
  ids: string[],
  transaction?: Transaction,
): Promise<DecisionNodeConditionEntity[]> {
  const decisionNodeConditions = await DecisionNodeCondition.findAll({
    transaction,
    where: {
      id: {
        [Op.in]: ids,
      },
    },
  });

  return decisionNodeConditions.map(
    (decisionNodeCondition) => new DecisionNodeConditionEntity(decisionNodeCondition),
  );
}
