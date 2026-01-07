import { sessionCookieName } from "~src/config/session";
import type SessionEntity from "~src/entities/SessionEntity/SessionEntity";

import type ExpressContextEntity from "../ExpressContextEntity";

export default function setSession(
  this: ExpressContextEntity,
  sessionEntity: SessionEntity
) {
  this.res.cookie(sessionCookieName, sessionEntity.token, { httpOnly: true });
}
