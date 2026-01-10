import UserEntity from "~src/entities/UserEntity/UserEntity";

import type SessionEntity from "../SessionEntity";

export default function fetchUserEntity(this: SessionEntity) {
  return UserEntity.findByEmail(this.payload.email);
}
