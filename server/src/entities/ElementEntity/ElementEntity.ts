import { Element } from "~db/models/Element";

import { staticImplements, type StaticMethods } from "../types";
import fetchProperties from "./instanceMethods/fetchProperties";
import create from "./staticMethods/create";
import findAll from "./staticMethods/findAll";
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
  static findAll = findAll;

  // PARTITION: Instance methods
  fetchProperties = fetchProperties;
}
