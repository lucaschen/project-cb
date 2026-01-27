import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ZodSchema } from "zod";

import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

const enforceSchema = <
  Params extends ParamsDictionary,
  RequestBody,
  ResponseBody
>({
  handler,
  inputSchema,
  paramsSchema,
}: {
  handler: RequestHandler<Params, ResponseBody, RequestBody>;
  inputSchema?: ZodSchema<RequestBody>;
  outputSchema: ZodSchema<ResponseBody>;
  paramsSchema?: ZodSchema<Params>;
}) => {
  const schemaHandler: RequestHandler<Params, unknown, RequestBody> = async (
    req,
    res,
    next
  ) => {
    if (inputSchema) {
      const validationResult = inputSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new InvalidRequestError(
          "Body validation error.",
          validationResult
        );
      }
    }

    if (paramsSchema) {
      const validationResult = paramsSchema.safeParse(req.params);

      if (!validationResult.success) {
        throw new InvalidRequestError(
          "Params validation error.",
          validationResult
        );
      }
    }

    await handler(req, res, next);
  };

  return schemaHandler;
};

export default enforceSchema;
