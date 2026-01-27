import { Node } from "~db/models/Node";

import type NodeEntity from "../NodeEntity";

export default async function findById(
  this: typeof NodeEntity,
  id: string,
): Promise<NodeEntity | null> {
  const node = await Node.findByPk(id);

  if (!node) return null;

  return new this(node);
}
