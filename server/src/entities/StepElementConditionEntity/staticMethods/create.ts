import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { StepElementCondition } from "~db/models/StepElementCondition";

import type StepElementConditionEntity from "../StepElementConditionEntity";

export default async function create(
  this: typeof StepElementConditionEntity,
  params: Omit<InferCreationAttributes<StepElementCondition>, "id"> & {
    id?: string;
  },
): Promise<StepElementConditionEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await StepElementCondition.create(payload);

  return new this(model);
}
