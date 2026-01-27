import { Node } from "~db/models/Node";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof NodeEntity, NodeEntity>>()
export default class NodeEntity {
  dbModel: Node;

  constructor(node: Node) {
    this.dbModel = node;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
