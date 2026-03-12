import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ZodType } from "zod";

import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

const enforceSchema = <
  Params extends ParamsDictionary,
  RequestBody,
  ResponseBody,
  Query,
  Locals extends Record<string, unknown> = Record<string, unknown>,
>({
  handler,
  inputSchema,
  paramsSchema,
  querySchema,
}: {
  handler: RequestHandler<
    Params,
    ResponseBody,
    RequestBody,
    Query,
    Locals
  >;
  inputSchema?: ZodType<RequestBody>;
  outputSchema: ZodType<ResponseBody>;
  paramsSchema?: ZodType<Params>;
  querySchema?: ZodType<Query>;
}) => {
  const schemaHandler: RequestHandler<
    Params,
    unknown,
    RequestBody,
    Query,
    Locals
  > = async (req, res, next) => {
    if (inputSchema) {
      const validationResult = inputSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new InvalidRequestError(
          "Body validation error.",
          validationResult,
        );
      }
    }

    if (paramsSchema) {
      const validationResult = paramsSchema.safeParse(req.params);

      if (!validationResult.success) {
        throw new InvalidRequestError(
          "Params validation error.",
          validationResult,
        );
      }
    }

    if (querySchema) {
      const validationResult = querySchema.safeParse(req.query);

      if (!validationResult.success) {
        throw new InvalidRequestError(
          "Query validation error.",
          validationResult,
        );
      }
    }

    await handler(req, res, next);
  };

  return schemaHandler;
};

export default enforceSchema;
