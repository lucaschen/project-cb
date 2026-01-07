import { ElementProperties } from "~db/models/ElementProperties";

import type ElementPropertiesEntity from "../ElementPropertiesEntity";

export default async function findById(
  this: typeof ElementPropertiesEntity,
  id: string
): Promise<ElementPropertiesEntity | null> {
  const elementProperties = await ElementProperties.findByPk(id);

  if (!elementProperties) return null;

  return new this(elementProperties);
}
