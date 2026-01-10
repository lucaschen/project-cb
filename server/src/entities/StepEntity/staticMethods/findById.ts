import { Step } from "~db/models/Step";

import type StepEntity from "../StepEntity";

export default async function findById(
  this: typeof StepEntity,
  id: string
): Promise<StepEntity | null> {
  const step = await Step.findByPk(id);

  if (!step) return null;

  return new this(step);
}
