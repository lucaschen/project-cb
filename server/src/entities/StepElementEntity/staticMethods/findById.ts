import { StepElement } from "~db/models/StepElement";

import type StepElementEntity from "../StepElementEntity";

export default async function findById(
  this: typeof StepElementEntity,
  id: string
): Promise<StepElementEntity | null> {
  const stepElement = await StepElement.findByPk(id);

  if (!stepElement) return null;

  return new this(stepElement);
}
