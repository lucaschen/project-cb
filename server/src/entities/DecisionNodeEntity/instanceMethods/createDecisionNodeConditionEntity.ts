import { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import DecisionNodeConditionEntity from "~entities/DecisionNodeConditionEntity";

import DecisionNodeEntity from "../DecisionNodeEntity";

export default async function createDecisionNodeConditionEntity(
  this: DecisionNodeEntity,
  payload: Omit<
    InferCreationAttributes<DecisionNodeCondition>,
    "nodeId" | "id"
  >,
): Promise<DecisionNodeConditionEntity> {
  const decisionNodeConditionEntity = await DecisionNodeConditionEntity.create({
    id: uuidV4(),
    nodeId: this.dbModel.nodeId,
    ...payload,
  });

  return decisionNodeConditionEntity;
}
