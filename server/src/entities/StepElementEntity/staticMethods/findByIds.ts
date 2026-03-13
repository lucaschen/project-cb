import { Op, type Transaction } from "sequelize";

import { StepElement } from "~db/models/StepElement";

import type StepElementEntity from "../StepElementEntity";

export default async function findByIds(
  this: typeof StepElementEntity,
  ids: string[],
  transaction?: Transaction,
): Promise<StepElementEntity[]> {
  const stepElements = await StepElement.findAll({
    transaction,
    where: {
      id: { [Op.in]: ids },
    },
  });

  return stepElements.map((stepElement) => new this(stepElement));
}
