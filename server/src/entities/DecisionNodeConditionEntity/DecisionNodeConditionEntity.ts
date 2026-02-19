import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<
  StaticMethods<typeof DecisionNodeConditionEntity, DecisionNodeConditionEntity>
>()
export default class DecisionNodeConditionEntity {
  dbModel: DecisionNodeCondition;

  constructor(decisionNodeCondition: DecisionNodeCondition) {
    this.dbModel = decisionNodeCondition;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
