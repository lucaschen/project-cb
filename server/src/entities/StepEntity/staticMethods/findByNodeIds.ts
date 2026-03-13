import { Op, type Transaction } from "sequelize";

import { Step } from "~db/models/Step";

import type StepEntity from "../StepEntity";

export default async function findByNodeIds(
  this: typeof StepEntity,
  nodeIds: string[],
  transaction?: Transaction,
): Promise<StepEntity[]> {
  const stepModels = await Step.findAll({
    transaction,
    where: {
      nodeId: {
        [Op.in]: nodeIds,
      },
    },
  });

  return stepModels.map((stepModel) => new this(stepModel));
}
