import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { Step } from "~db/models/Step";

import type StepEntity from "../StepEntity";

export default async function create(
  this: typeof StepEntity,
  params: Omit<InferCreationAttributes<Step>, "id"> & {
    id?: string;
  },
): Promise<StepEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await Step.create(payload);

  return new this(model);
}
