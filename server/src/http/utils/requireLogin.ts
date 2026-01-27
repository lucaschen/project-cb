import type { RequestHandler } from "express";

import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";

const requireLogin =
  <Params>(handler: RequestHandler<Params>): RequestHandler<Params> =>
  async (req, res, next) => {
    if (!req.context.sessionEntity) {
      throw new InvalidCredentialsError("Login required.");
    }

    await handler(req, res, next);
  };

export default requireLogin;
