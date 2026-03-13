import {
  createSessionInput,
  createSessionOutput,
} from "@packages/shared/http/schemas/sessions/createSession";

import SessionEntity from "~src/entities/SessionEntity/SessionEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import InvalidOperationError from "~src/utils/errors/InvalidOperationError";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

const createSession = enforceSchema({
  handler: async (req, res) => {
    const { password, email } = req.body;

    let sessionEntity;
    try {
      sessionEntity = await SessionEntity.createFromCredentials({
        password,
        email,
      });
    } catch (error) {
      if (
        error instanceof InvalidOperationError ||
        error instanceof InvalidRequestError
      ) {
        throw new InvalidCredentialsError("Login unsuccessful.");
      }

      throw error;
    }

    req.context.setSession(sessionEntity);

    res.status(201).json(sessionEntity.getPayload());
  },
  inputSchema: createSessionInput,
  outputSchema: createSessionOutput,
});

export default handleRouteError(createSession);
