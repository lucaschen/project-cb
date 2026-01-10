import { Element } from "~db/models/Element";

import type ElementEntity from "../ElementEntity";

export default async function findById(
  this: typeof ElementEntity,
  id: string
): Promise<ElementEntity | null> {
  const element = await Element.findByPk(id);

  if (!element) return null;

  return new this(element);
}
