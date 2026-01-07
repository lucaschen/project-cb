import jwt from "jsonwebtoken";

import { envs } from "~src/config/envs";
import UserEntity from "~src/entities/UserEntity/UserEntity";
import InvalidOperationError from "~src/utils/errors/InvalidOperationError";

import type SessionEntity from "../SessionEntity";
import type { SessionPayload } from "../types";

export default async function createFromCredentials(
  this: typeof SessionEntity,
  { password, email }: { password: string; email: string }
) {
  const userEntity = await UserEntity.findByEmail(email);

  if (!userEntity) throw new InvalidOperationError("User not found.");

  const isPasswordValid = await userEntity.validatePassword(password);

  if (!isPasswordValid) throw new InvalidOperationError("Invalid password.");

  const sessionPayload: SessionPayload = {
    userId: userEntity.dbModel.id,
    email,
  };

  const token = jwt.sign(sessionPayload, envs.JWT_SECRET);

  return new this(token);
}
