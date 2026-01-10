import type { ErrorRequestHandler } from "express";
import type { Express } from "express";

import { envs } from "~src/config/envs";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const handleErrors = (app: Express) => {
  const errorRequestHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next
  ) => {
    if (error instanceof InvalidCredentialsError) {
      res.status(401);
    } else if (error instanceof InvalidRequestError) {
      res.status(400);
    } else if (error instanceof NotFoundError) {
      res.status(404);
    } else {
      res.status(500);
    }

    if (envs.DEBUGGING) {
      console.error(error);
      // default error message is not serialised
      res.json({ ...error, message: error.message });
    } else {
      res.end();
    }
  };

  app.use(errorRequestHandler);
};

export default handleErrors;
