import { Step } from "~db/models/Step";

import { staticImplements, type StaticMethods } from "../types";
import getStepElementConditions from "./instanceMethods/getStepElementConditions";
import getStepElementProperties from "./instanceMethods/getStepElementProperties";
import getStepElements from "./instanceMethods/getStepElements";
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

  // PARTITION: Instance methods
  getStepElements = getStepElements;
  getStepElementProperties = getStepElementProperties;
  getStepElementConditions = getStepElementConditions;
}
