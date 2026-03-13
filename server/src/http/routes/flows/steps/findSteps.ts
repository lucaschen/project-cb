import {
  findStepsOutput,
  findStepsParams,
} from "@packages/shared/http/schemas/flows/steps/findSteps";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const findSteps = enforceSchema({
  handler: async (req, res) => {
    const { flowId } = req.params;

    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();
    const flowEntity = await FlowEntity.findById(flowId);

    if (!flowEntity) {
      throw new NotFoundError(`Flow id: ${flowId} not found.`);
    }

    const canReadFlow = await userEntity.canReadFlow(flowId);
    if (!canReadFlow) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to read this flow.",
      );
    }

    const response = await flowEntity.findStepSummaries();

    res.status(200).json(response);
  },
  outputSchema: findStepsOutput,
  paramsSchema: findStepsParams,
});

export default handleRouteError(findSteps);
