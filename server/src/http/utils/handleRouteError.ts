import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

const handleRouteError = <Params extends ParamsDictionary, RequestBody, ResponseBody>(
  handler: RequestHandler<Params, ResponseBody, RequestBody>,
) => {
  const thrownErrorHandler: RequestHandler<Params, unknown, RequestBody> = async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  return thrownErrorHandler;
};

export default handleRouteError;
