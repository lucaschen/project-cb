import { Flow } from "~db/models/Flow";

import { staticImplements, type StaticMethods } from "../types";
import fetchBuilderPayload from "./instanceMethods/fetchBuilderPayload";
import findStepSummaries from "./instanceMethods/findStepSummaries";
import getPayload from "./instanceMethods/getPayload";
import updateBuilder from "./instanceMethods/updateBuilder";
import updateMetadata from "./instanceMethods/updateMetadata";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";
import findByOrganizationId from "./staticMethods/findByOrganizationId";

@staticImplements<StaticMethods<typeof FlowEntity, FlowEntity>>()
export default class FlowEntity {
  dbModel: Flow;

  constructor(Flow: Flow) {
    this.dbModel = Flow;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
  static findByOrganizationId = findByOrganizationId;

  // PARTITION: Instance methods
  fetchBuilderPayload = fetchBuilderPayload;
  findStepSummaries = findStepSummaries;
  getPayload = getPayload;
  updateBuilder = updateBuilder;
  updateMetadata = updateMetadata;
}
