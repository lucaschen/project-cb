import { Step } from "~db/models/Step";

import { staticImplements, type StaticMethods } from "../types";
import create, { createWithElements } from "./staticMethods/create";
import findById from "./staticMethods/findById";
import getStepElements from "./instanceMethods/getStepElements";
import getStepElementProperties from "./instanceMethods/getStepElementProperties";
import getStepElementConditions from "./instanceMethods/getStepElementConditions";

@staticImplements<StaticMethods<typeof StepEntity, StepEntity>>()
export default class StepEntity {
  dbModel: Step;

  constructor(Step: Step) {
    this.dbModel = Step;
  }

  // PARTITION: Static methods
  static create = create;
  static createWithElements = createWithElements;
  static findById = findById;

  // PARTITION: Instance methods
  getStepElements = getStepElements;
  getStepElementProperties = getStepElementProperties;
  getStepElementConditions = getStepElementConditions;
}
