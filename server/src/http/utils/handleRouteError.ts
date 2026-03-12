import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

const handleRouteError = <
  Params extends ParamsDictionary,
  RequestBody,
  ResponseBody,
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
) => {
  const thrownErrorHandler: RequestHandler<
    Params,
    unknown,
    RequestBody,
    Query,
    Locals
  > = async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  return thrownErrorHandler;
};

export default handleRouteError;
