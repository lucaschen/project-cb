import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { DecisionNode } from "~db/models/DecisionNode";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function create(
  this: typeof DecisionNodeEntity,
  params: Omit<InferCreationAttributes<DecisionNode>, "id"> & { id?: string }
): Promise<DecisionNodeEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await DecisionNode.create(payload);

  return new this(model);
}
