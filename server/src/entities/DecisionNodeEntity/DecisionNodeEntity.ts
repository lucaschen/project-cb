import { DecisionNode } from "~db/models/DecisionNode";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<
  StaticMethods<typeof DecisionNodeEntity, DecisionNodeEntity>
>()
export default class DecisionNodeEntity {
  dbModel: DecisionNode;

  constructor(decisionNode: DecisionNode) {
    this.dbModel = decisionNode;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
