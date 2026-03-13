import {
  createStepElementInput,
  createStepElementOutput,
} from "@packages/shared/http/schemas/flows/steps/elements/createStepElement";
import checkExists from "@packages/shared/utils/checkExists";
import { v4 as uuidv4 } from "uuid";

import StepElementEntity from "~entities/StepElementEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";

const createStepElement = enforceSchema({
  handler: async (req, res) => {
    const { name, elementId, properties, order } = req.body;

    const flowId = checkExists(req.params.flowId);

    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();
    const canEditFlow = await userEntity.canEditFlow(flowId);

    if (!canEditFlow) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to create flow in this organization.",
      );
    }

    const stepId = checkExists(req.params.stepId);

    const stepElementEntity = await StepElementEntity.create({
      id: uuidv4(),
      name: name,
      elementId,
      stepId,
      order,
    });

    // Handle properties if provided - create corresponding StepElementProperties records
    if (properties) {
      await stepElementEntity.setProperties(properties);
    }

    const response = createStepElementOutput.parse({
      id: stepElementEntity.dbModel.id,
      name: stepElementEntity.dbModel.name,
      elementId: stepElementEntity.dbModel.elementId,
      stepId: stepElementEntity.dbModel.stepId,
      order: stepElementEntity.dbModel.order,
    });

    res.status(201).json(response);
  },
  inputSchema: createStepElementInput,
  outputSchema: createStepElementOutput,
});

export default handleRouteError(createStepElement);
