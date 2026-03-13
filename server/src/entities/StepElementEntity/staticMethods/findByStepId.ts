import type { Transaction } from "sequelize";

import { StepElement } from "~db/models/StepElement";

import type StepElementEntity from "../StepElementEntity";

export default async function findByStepId(
  this: typeof StepElementEntity,
  stepId: string,
  transaction?: Transaction,
): Promise<StepElementEntity[]> {
  const stepElements = await StepElement.findAll({
    order: [
      ["order", "ASC"],
      ["id", "ASC"],
    ],
    transaction,
    where: {
      stepId,
    },
  });

  return stepElements.map((stepElement) => new this(stepElement));
}
