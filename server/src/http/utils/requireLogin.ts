import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";

const requireLogin =
  <
    Params extends ParamsDictionary,
    ResponseBody,
    RequestBody,
    Query,
    Locals extends Record<string, unknown>,
  >(
    handler: RequestHandler<
      Params,
      ResponseBody,
      RequestBody,
      Query,
      Locals
    >,
  ): RequestHandler<Params, ResponseBody, RequestBody, Query, Locals> =>
  async (req, res, next) => {
    if (!req.context.sessionEntity) {
      throw new InvalidCredentialsError("Login required.");
    }

    await handler(req, res, next);
  };

export default requireLogin;
