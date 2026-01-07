import checkExists from "@packages/shared/utils/types/checkExists";
import bcrypt from "bcryptjs";

import { User } from "~src/db/models/User";

import type UserEntity from "../UserEntity";

export default async function validatePassword(
  this: UserEntity,
  comparePassword: string
) {
  const user = checkExists(await User.findByPk(this.dbModel.get("id")));

  return await bcrypt.compare(comparePassword, user.passwordHash);
}
