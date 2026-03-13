import { Step } from "~db/models/Step";

import { staticImplements, type StaticMethods } from "../types";
import fetchStepElements from "./instanceMethods/fetchStepElements";
import updateStepElements from "./instanceMethods/updateStepElements";
import create from "./staticMethods/create";
import destroyByNodeIds from "./staticMethods/destroyByNodeIds";
import findByFlowId from "./staticMethods/findByFlowId";
import findById from "./staticMethods/findById";
import findByNodeIds from "./staticMethods/findByNodeIds";
import syncBuilderSteps from "./staticMethods/syncBuilderSteps";
import validateSurvivingStepElementReferences from "./staticMethods/validateSurvivingStepElementReferences";

@staticImplements<StaticMethods<typeof StepEntity, StepEntity>>()
export default class StepEntity {
  dbModel: Step;

  constructor(Step: Step) {
    this.dbModel = Step;
  }

  // PARTITION: Static methods
  static create = create;
  static destroyByNodeIds = destroyByNodeIds;
  static findByFlowId = findByFlowId;
  static findById = findById;
  static findByNodeIds = findByNodeIds;
  static syncBuilderSteps = syncBuilderSteps;
  static validateSurvivingStepElementReferences =
    validateSurvivingStepElementReferences;

  // PARTITION: Instance methods
  fetchStepElements = fetchStepElements;
  updateStepElements = updateStepElements;
}
