import { deleteCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/deleteCurrentSession";

import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidOperationError from "~src/utils/errors/InvalidOperationError";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";
import UnexpectedError from "~src/utils/errors/UnexpectedError";

const deleteCurrentSession = enforceSchema({
  handler: (req, res) => {
    try {
      req.context.deleteSession();
    } catch (error) {
      if (error instanceof InvalidOperationError) {
        throw new InvalidRequestError("Logout unsuccessful.");
      }

      throw new UnexpectedError("deleteSession failed.");
    }

    res.status(200).end();
  },
  outputSchema: deleteCurrentSessionOutput,
});

export default handleRouteError(deleteCurrentSession);
