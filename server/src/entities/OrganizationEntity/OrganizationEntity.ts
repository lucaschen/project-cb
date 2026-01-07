import { Organization } from "~db/models/Organization";

import { staticImplements, type StaticMethods } from "../types";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<
  StaticMethods<typeof OrganizationEntity, OrganizationEntity>
>()
export default class OrganizationEntity {
  dbModel: Organization;

  constructor(organization: Organization) {
    this.dbModel = organization;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;
}
