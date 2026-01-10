import UserEntity from "~src/entities/UserEntity/UserEntity";
import InvalidOperationError from "~src/utils/errors/InvalidOperationError";

import type SessionEntity from "../SessionEntity";
import { decodeSessionToken } from "../utils";

export default async function createFromToken(
  this: typeof SessionEntity,
  token: string
) {
  let sessionPayload;
  try {
    sessionPayload = decodeSessionToken(token);
  } catch {
    throw new InvalidOperationError("Session token decoding failed.");
  }

  const { email } = sessionPayload;

  const userEntity = await UserEntity.findByEmail(email);

  if (!userEntity) throw new InvalidOperationError("User not found.");

  return new this(token);
}
