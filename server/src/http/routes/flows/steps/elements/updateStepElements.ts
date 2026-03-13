import {
  updateStepElementsInput,
  updateStepElementsOutput,
  updateStepElementsParams,
} from "@packages/shared/http/schemas/flows/steps/elements/updateStepElements";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import StepEntity from "~entities/StepEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const updateStepElements = enforceSchema({
  handler: async (req, res) => {
    const { flowId, stepId } = req.params;
    const payload = req.body;

    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();
    const flowEntity = await FlowEntity.findById(flowId);

    if (!flowEntity) {
      throw new NotFoundError(`Flow id: ${flowId} not found.`);
    }

    const canEditFlow = await userEntity.canEditFlow(flowId);
    if (!canEditFlow) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to edit this flow.",
      );
    }

    const stepEntity = await StepEntity.findById(stepId);

    if (!stepEntity) {
      throw new NotFoundError(`Step id: ${stepId} not found.`);
    }

    const response = await stepEntity.updateStepElements(flowId, payload);

    res.status(200).json(response);
  },
  inputSchema: updateStepElementsInput,
  outputSchema: updateStepElementsOutput,
  paramsSchema: updateStepElementsParams,
});

export default handleRouteError(updateStepElements);
