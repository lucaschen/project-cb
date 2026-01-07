import { User } from "~db/models/User";

import { staticImplements, type StaticMethods } from "../types";
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
  validatePassword = validatePassword;
}
