import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { StepElement } from "~db/models/StepElement";

import type StepElementEntity from "../StepElementEntity";

export default async function create(
  this: typeof StepElementEntity,
  params: Omit<InferCreationAttributes<StepElement>, "id"> & {
    id?: string;
  }
): Promise<StepElementEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await StepElement.create(payload);

  return new this(model);
}
