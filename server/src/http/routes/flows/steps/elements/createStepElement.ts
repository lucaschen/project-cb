import {
  createStepElementInput,
  createStepElementOutput,
} from "@packages/shared/http/schemas/flows/steps/elements/createStepElement";
import checkExists from "@packages/shared/utils/checkExists";
import { v4 as uuidv4 } from "uuid";

import { StepElementProperties } from "~db/models/StepElementProperties";
import ElementEntity from "~entities/ElementEntity";
import StepElementEntity from "~entities/StepElementEntity";
import StepEntity from "~entities/StepEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const createStepElement = enforceSchema({
  handler: async (req, res) => {
    const { name, elementId, order, properties } = req.body;

    const stepId = checkExists(req.params.stepId);

    const step = await StepEntity.findById(stepId);
    if (!step) {
      throw new NotFoundError(`Step id: ${stepId} not found.`);
    }

    // Validate element exists
    const element = await ElementEntity.findById(elementId);
    if (!element) {
      throw new NotFoundError(`Element id: ${elementId} not found.`);
    }

    try {
      // If validation succeeds, proceed to create StepElement
      const stepElement = await StepElementEntity.create({
        id: uuidv4(),
        name: name,
        elementId: element.dbModel.id,
        stepId,
        order,
      });

      // Handle properties if provided - create corresponding StepElementProperties records
      if (properties && typeof properties === "object") {
        const propertyPromises = Object.entries(properties).map(
          async ([propertyId, propertyValue]) => {
            return await StepElementProperties.create({
              id: uuidv4(),
              stepElementId: stepElement.dbModel.id,
              propertyId,
              propertyValue: JSON.stringify(propertyValue),
            });
          },
        );

        // Wait for all properties to be created
        await Promise.all(propertyPromises);
      }

      res.status(201).json({
        id: stepElement.dbModel.id,
        name: stepElement.dbModel.name,
        elementId: stepElement.dbModel.elementId,
        stepId: stepElement.dbModel.stepId,
        order: stepElement.dbModel.order,
      });
    } catch (validationError) {
      // Re-throw with clearer message if Zod validation fails
      throw new Error(
        `Properties validation failed: ${validationError instanceof Error ? validationError.message : "Unknown error"}`,
      );
    }
  },
  inputSchema: createStepElementInput,
  outputSchema: createStepElementOutput,
});

export default handleRouteError(createStepElement);
