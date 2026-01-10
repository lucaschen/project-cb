import { DecisionNode } from "~db/models/DecisionNode";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function findById(
  this: typeof DecisionNodeEntity,
  id: string
): Promise<DecisionNodeEntity | null> {
  const node = await DecisionNode.findByPk(id);

  if (!node) return null;

  return new this(node);
}
