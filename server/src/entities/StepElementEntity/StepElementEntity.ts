import { StepElement } from "~db/models/StepElement";

import { staticImplements, type StaticMethods } from "../types";
import fetchHydratedPayload from "./instanceMethods/fetchHydratedPayload";
import setProperties from "./instanceMethods/setProperties";
import updateFromInput from "./instanceMethods/updateFromInput";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";
import findByIds from "./staticMethods/findByIds";
import findByStepId from "./staticMethods/findByStepId";

@staticImplements<StaticMethods<typeof StepElementEntity, StepElementEntity>>()
export default class StepElementEntity {
  dbModel: StepElement;

  constructor(StepElement: StepElement) {
    this.dbModel = StepElement;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
  static findByIds = findByIds;
  static findByStepId = findByStepId;

  // Partition: Instance methods
  fetchHydratedPayload = fetchHydratedPayload;
  setProperties = setProperties;
  updateFromInput = updateFromInput;
}
