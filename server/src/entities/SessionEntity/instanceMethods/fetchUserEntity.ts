import checkExists from "@packages/shared/utils/checkExists";

import UserEntity from "~src/entities/UserEntity/UserEntity";

import type SessionEntity from "../SessionEntity";

export default async function fetchUserEntity(this: SessionEntity) {
  return checkExists(await UserEntity.findByEmail(this.payload.email));
}
