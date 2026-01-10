import type { InferCreationAttributes } from "sequelize";

import { Element } from "~db/models/Element";

import type ElementEntity from "../ElementEntity";

export default async function create(
  this: typeof ElementEntity,
  params: InferCreationAttributes<Element>
): Promise<ElementEntity> {
  const model = await Element.create(params);

  return new this(model);
}
