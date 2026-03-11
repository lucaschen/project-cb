import { StepElement } from "~db/models/StepElement";

import { staticImplements, type StaticMethods } from "../types";
import setProperties from "./instanceMethods/setProperties";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof StepElementEntity, StepElementEntity>>()
export default class StepElementEntity {
  dbModel: StepElement;

  constructor(StepElement: StepElement) {
    this.dbModel = StepElement;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;

  // Partition: Instance methods
  setProperties = setProperties;
}
