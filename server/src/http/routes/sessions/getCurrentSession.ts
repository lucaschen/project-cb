import { getCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";

import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";

const getCurrentSession = enforceSchema({
  handler: async (req, res) => {
    if (!req.context.sessionEntity) {
      throw new InvalidCredentialsError("User does not have a session.");
    }

    res.json(req.context.sessionEntity.getPayload());
  },
  outputSchema: getCurrentSessionOutput,
});

export default handleRouteError(getCurrentSession);
