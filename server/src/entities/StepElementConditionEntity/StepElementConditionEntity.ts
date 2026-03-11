import { StepElementCondition } from "~db/models/StepElementCondition";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof StepElementConditionEntity, StepElementConditionEntity>>()
export default class StepElementConditionEntity {
  dbModel: StepElementCondition;

  constructor(StepElementCondition: StepElementCondition) {
    this.dbModel = StepElementCondition;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}