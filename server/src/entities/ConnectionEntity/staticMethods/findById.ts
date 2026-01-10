import { Connection } from "~db/models/Connection";

import type ConnectionEntity from "../ConnectionEntity";

export default async function findById(
  this: typeof ConnectionEntity,
  id: string
): Promise<ConnectionEntity | null> {
  const connection = await Connection.findByPk(id);

  if (!connection) return null;

  return new this(connection);
}
