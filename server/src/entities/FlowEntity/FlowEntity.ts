import { Flow } from "~db/models/Flow";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof FlowEntity, FlowEntity>>()
export default class FlowEntity {
  dbModel: Flow;

  constructor(Flow: Flow) {
    this.dbModel = Flow;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
