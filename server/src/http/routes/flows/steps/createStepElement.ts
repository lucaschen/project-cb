import {
  createStepElementInput,
  createStepElementOutput,
} from "@packages/shared/http/schemas/flows/steps/elements/createStepElement";
import checkExists from "@packages/shared/utils/checkExists";
import { v4 as uuidv4 } from "uuid";

import StepElementEntity from "~entities/StepElementEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";

const createStepElement = enforceSchema({
  handler: async (req, res) => {
    // TODO: ensure user has permissions to flow
    const { name, elementId, properties, order } = createStepElementInput.parse(
      req.body,
    );

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
      stepElementEntity.setProperties(properties);
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
