import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";

import type DecisionNodeConditionEntity from "../DecisionNodeConditionEntity";

export default async function create(
  this: typeof DecisionNodeConditionEntity,
  params: Omit<InferCreationAttributes<DecisionNodeCondition>, "id"> & {
    id?: string;
  }
): Promise<DecisionNodeConditionEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await DecisionNodeCondition.create(payload);

  return new this(model);
}
