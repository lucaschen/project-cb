import type { InferCreationAttributes } from "sequelize";

import { Node } from "~db/models/Node";

import type NodeEntity from "../NodeEntity";

export default async function create(
  this: typeof NodeEntity,
  params: InferCreationAttributes<Node>,
): Promise<NodeEntity> {
  const model = await Node.create(params);

  return new this(model);
}
