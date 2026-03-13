import {
  findStepElementsOutput,
  findStepElementsParams,
} from "@packages/shared/http/schemas/flows/steps/elements/findStepElements";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import StepEntity from "~entities/StepEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const fetchStepElements = enforceSchema({
  handler: async (req, res) => {
    const { flowId, stepId } = req.params;

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

    const stepEntity = await StepEntity.findById(stepId);

    if (!stepEntity) {
      throw new NotFoundError(`Step id: ${stepId} not found.`);
    }

    const response = await stepEntity.fetchStepElements(flowId);

    res.status(200).json(response);
  },
  outputSchema: findStepElementsOutput,
  paramsSchema: findStepElementsParams,
});

export default handleRouteError(fetchStepElements);
