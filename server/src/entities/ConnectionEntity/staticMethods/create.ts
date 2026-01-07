import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { Connection } from "~db/models/Connection";

import type ConnectionEntity from "../ConnectionEntity";

export default async function create(
  this: typeof ConnectionEntity,
  params: Omit<InferCreationAttributes<Connection>, "id"> & { id?: string }
): Promise<ConnectionEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await Connection.create(payload);

  return new this(model);
}
