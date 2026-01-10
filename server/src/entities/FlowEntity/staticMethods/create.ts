import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { Flow } from "~db/models/Flow";

import type FlowEntity from "../FlowEntity";

export default async function create(
  this: typeof FlowEntity,
  params: Omit<InferCreationAttributes<Flow>, "id"> & {
    id?: string;
  }
): Promise<FlowEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await Flow.create(payload);

  return new this(model);
}
