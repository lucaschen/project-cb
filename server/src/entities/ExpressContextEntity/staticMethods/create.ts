import type { Request, Response } from "express-serve-static-core";

import { sessionCookieName } from "~src/config/session";
import SessionEntity from "~src/entities/SessionEntity/SessionEntity";
import InvalidOperationError from "~src/utils/errors/InvalidOperationError";

import type ExpressContextEntity from "../ExpressContextEntity";

export default async function create(
  this: typeof ExpressContextEntity,
  { req, res }: { req: Request; res: Response }
) {
  const maybeSessionToken = req.cookies[sessionCookieName];

  let sessionEntity = null;
  try {
    sessionEntity = await SessionEntity.createFromToken(maybeSessionToken);
  } catch (error) {
    if (!(error instanceof InvalidOperationError)) {
      throw error;
    }
  }

  return new this({ res, sessionEntity });
}
