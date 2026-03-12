import { User } from "~db/models/User";

import { staticImplements, type StaticMethods } from "../types";
import canCreateFlowsInOrganization from "./instanceMethods/canCreateFlowsInOrganization";
import canEditFlow from "./instanceMethods/canEditFlow";
import canReadFlow from "./instanceMethods/canReadFlow";
import canReadFlowsInOrganization from "./instanceMethods/canReadFlowsInOrganization";
import findOrganizations from "./instanceMethods/findOrganizations";
import validatePassword from "./instanceMethods/validatePassword";
import create from "./staticMethods/create";
import findByEmail from "./staticMethods/findByEmail";
import findById from "./staticMethods/findById";

@staticImplements<StaticMethods<typeof UserEntity, UserEntity>>()
export default class UserEntity {
  dbModel: User;

  constructor(user: User) {
    this.dbModel = user;
  }

  // PARTITION: Static methods
  static create = create;
  static findByEmail = findByEmail;
  static findById = findById;

  // PARTITION: Instance methods
  canCreateFlowsInOrganization = canCreateFlowsInOrganization;
  canEditFlow = canEditFlow;
  canReadFlow = canReadFlow;
  canReadFlowsInOrganization = canReadFlowsInOrganization;
  findOrganizations = findOrganizations;
  validatePassword = validatePassword;
}
