import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { Step } from "~db/models/Step";
import { StepElement } from "~db/models/StepElement";
import { StepElementProperties } from "~db/models/StepElementProperties";
import { StepElementCondition } from "~db/models/StepElementCondition";

import type StepEntity from "../StepEntity";

export default async function create(
  this: typeof StepEntity,
  params: Omit<InferCreationAttributes<Step>, "id"> & {
    id?: string;
  }
): Promise<StepEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await Step.create(payload);

  return new this(model);
}

export async function createWithElements(
  this: typeof StepEntity,
  params: {
    stepParams: Omit<InferCreationAttributes<Step>, "id"> & {
      id?: string;
    };
    elements?: {
      name: string;
      elementId: string;
      order: number;
      properties?: Record<string, any>;
      conditions?: any[];
    }[];
  }
): Promise<StepEntity> {
  // Create the step
  const step = await this.create(params.stepParams);

  // Create step elements if provided
  if (params.elements && params.elements.length > 0) {
    for (const element of params.elements) {
      // Create the step element
      const stepElement = await StepElement.create({
        id: uuidV4(),
        name: element.name,
        elementId: element.elementId,
        stepId: step.dbModel.nodeId,
        order: element.order,
      });

      // Create properties if provided
      if (element.properties && Object.keys(element.properties).length > 0) {
        const propertyPromises = Object.entries(element.properties).map(
          async ([propertyId, propertyValue]) => {
            return await StepElementProperties.create({
              id: uuidV4(),
              stepElementId: stepElement.id,
              propertyId,
              propertyValue: JSON.stringify(propertyValue),
            });
          },
        );
        await Promise.all(propertyPromises);
      }

      // Create conditions if provided
      if (element.conditions && element.conditions.length > 0) {
        const conditionPromises = element.conditions.map(
          async (condition) => {
            return await StepElementCondition.create({
              id: uuidV4(),
              stepElementId: stepElement.id,
              statement: condition,
            });
          },
        );
        await Promise.all(conditionPromises);
      }
    }
  }

  // Return the step entity
  return step;
}
