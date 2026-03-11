import { StepElementCondition } from "~db/models/StepElementCondition";

import type StepElementConditionEntity from "../StepElementConditionEntity";

export default async function findById(
  this: typeof StepElementConditionEntity,
  id: string
): Promise<StepElementConditionEntity | null> {
  const stepElementCondition = await StepElementCondition.findByPk(id);

  if (!stepElementCondition) return null;

  return new this(stepElementCondition);
}