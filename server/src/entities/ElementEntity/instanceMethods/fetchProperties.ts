import { ElementProperties } from "~db/models/ElementProperties";
import ElementPropertiesEntity from "~entities/ElementPropertiesEntity";

import type ElementEntity from "../ElementEntity";

export default async function fetchProperties(
  this: ElementEntity,
): Promise<ElementPropertiesEntity[]> {
  const properties = await ElementProperties.findAll({
    where: {
      elementId: this.dbModel.id,
    },
    order: [
      ["createdAt", "ASC"],
      ["id", "ASC"],
    ],
  });

  return properties.map((property) => new ElementPropertiesEntity(property));
}
