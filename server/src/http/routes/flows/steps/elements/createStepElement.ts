import {
  createStepElementInput,
  createStepElementOutput,
} from "@packages/shared/http/schemas/flows/steps/elements/createStepElement";
import checkExists from "@packages/shared/utils/checkExists";
import { v4 as uuidv4 } from "uuid";

import StepElementEntity from "~entities/StepElementEntity";
import StepEntity from "~entities/StepEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const createStepElement = enforceSchema({
  handler: async (req, res) => {
    const { name, elementId, order } = req.body;

    const stepId = checkExists(req.params.stepId);

    const step = await StepEntity.findById(stepId);

    if (!step) {
      throw new NotFoundError(`Step id: ${stepId} not found.`);
    }

    const stepElement = await StepElementEntity.create({
      id: uuidv4(),
      name,
      elementId,
      stepId,
      order,
    });

    res.status(201).json({
      id: stepElement.dbModel.id,
      name: stepElement.dbModel.name,
      elementId: stepElement.dbModel.elementId,
      stepId: stepElement.dbModel.stepId,
      order: stepElement.dbModel.order,
    });
  },
  inputSchema: createStepElementInput,
  outputSchema: createStepElementOutput,
});

export default handleRouteError(createStepElement);