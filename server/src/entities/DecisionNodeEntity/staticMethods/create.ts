import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { DecisionNode } from "~db/models/DecisionNode";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function create(
  this: typeof DecisionNodeEntity,
  {
    nodeId,
    ...params
  }: Omit<InferCreationAttributes<DecisionNode>, "nodeId"> & {
    nodeId?: string;
  },
): Promise<DecisionNodeEntity> {
  const payload = { nodeId: nodeId ?? uuidV4(), ...params };

  const model = await DecisionNode.create(payload);

  return new this(model);
}
