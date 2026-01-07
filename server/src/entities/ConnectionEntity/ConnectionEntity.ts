import { Connection } from "~db/models/Connection";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof ConnectionEntity, ConnectionEntity>>()
export default class ConnectionEntity {
  dbModel: Connection;

  constructor(connection: Connection) {
    this.dbModel = connection;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
