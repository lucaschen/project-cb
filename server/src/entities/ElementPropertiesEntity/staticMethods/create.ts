import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { ElementProperties } from "~db/models/ElementProperties";

import type ElementPropertiesEntity from "../ElementPropertiesEntity";

export default async function create(
  this: typeof ElementPropertiesEntity,
  params: Omit<InferCreationAttributes<ElementProperties>, "id"> & {
    id?: string;
  }
): Promise<ElementPropertiesEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await ElementProperties.create(payload);

  return new this(model);
}
