import { DecisionNode } from "~db/models/DecisionNode";

import { staticImplements, type StaticMethods } from "../types";
import createDecisionNodeConditionEntity from "./instanceMethods/createDecisionNodeConditionEntity";
import fetchDecisionNodeConditionEntities from "./instanceMethods/fetchDecisionNodeConditionEntities";
import getPayload from "./instanceMethods/getPayload";
import updateFromInput from "./instanceMethods/updateFromInput";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";
import findByNodeIds from "./staticMethods/findByNodeIds";

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
  static findByNodeIds = findByNodeIds;

  // PARTITION: Instance methods
  createDecisionNodeConditionEntity = createDecisionNodeConditionEntity;
  fetchDecisionNodeConditionEntities = fetchDecisionNodeConditionEntities;
  getPayload = getPayload;
  updateFromInput = updateFromInput;
}
