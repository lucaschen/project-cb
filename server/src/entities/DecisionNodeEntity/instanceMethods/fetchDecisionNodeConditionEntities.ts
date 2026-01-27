import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import DecisionNodeConditionEntity from "~entities/DecisionNodeConditionEntity";

import DecisionNodeEntity from "../DecisionNodeEntity";

export default async function fetchDecisionNodeConditionEntitiesw(
  this: DecisionNodeEntity
): Promise<DecisionNodeConditionEntity[] | null> {
  const decisionNodeConditions = await DecisionNodeCondition.findAll({
    where: { nodeId: this.dbModel.nodeId },
  });

  if (!decisionNodeConditions) return null;

  return decisionNodeConditions.map(
    (decisionNodeCondition) =>
      new DecisionNodeConditionEntity(decisionNodeCondition)
  );
}
