import { Element } from "~db/models/Element";

import type ElementEntity from "../ElementEntity";

export default async function findAll(
  this: typeof ElementEntity,
): Promise<ElementEntity[]> {
  const elements = await Element.findAll({
    order: [
      ["createdAt", "ASC"],
      ["id", "ASC"],
    ],
  });

  return elements.map((element) => new this(element));
}
