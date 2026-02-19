import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";

import type DecisionNodeConditionEntity from "../DecisionNodeConditionEntity";

export default async function findById(
  this: typeof DecisionNodeConditionEntity,
  id: string
): Promise<DecisionNodeConditionEntity | null> {
  const node = await DecisionNodeCondition.findByPk(id);

  if (!node) return null;

  return new this(node);
}
