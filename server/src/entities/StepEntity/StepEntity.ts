import { Step } from "~db/models/Step";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof StepEntity, StepEntity>>()
export default class StepEntity {
  dbModel: Step;

  constructor(Step: Step) {
    this.dbModel = Step;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
