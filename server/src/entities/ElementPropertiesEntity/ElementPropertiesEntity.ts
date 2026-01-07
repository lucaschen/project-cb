import { ElementProperties } from "~db/models/ElementProperties";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof ElementEntity, ElementEntity>>()
export default class ElementEntity {
  dbModel: ElementProperties;

  constructor(elementProperties: ElementProperties) {
    this.dbModel = elementProperties;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
