import { sessionCookieName } from "~src/config/session";
import InvalidOperationError from "~src/utils/errors/InvalidOperationError";

import type ExpressContextEntity from "../ExpressContextEntity";

export default function deleteSession(this: ExpressContextEntity) {
  if (!this.sessionEntity)
    throw new InvalidOperationError("Session not found.");

  this.res.clearCookie(sessionCookieName, { httpOnly: true });
}
