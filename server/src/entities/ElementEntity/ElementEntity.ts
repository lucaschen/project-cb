import { Element } from "~db/models/Element";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof ElementEntity, ElementEntity>>()
export default class ElementEntity {
  dbModel: Element;

  constructor(element: Element) {
    this.dbModel = element;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
