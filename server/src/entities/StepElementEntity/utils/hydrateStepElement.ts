import type { HydratedStepElementType } from "@packages/shared/http/schemas/flows/steps/elements/common";

import type { ElementProperties } from "~db/models/ElementProperties";
import type { StepElement } from "~db/models/StepElement";
import type { StepElementProperties } from "~db/models/StepElementProperties";
import UnexpectedError from "~src/utils/errors/UnexpectedError";

export default function hydrateStepElement({
  elementPropertyModels,
  stepElementModel,
  stepElementPropertyModels,
}: {
  elementPropertyModels: ElementProperties[];
  stepElementModel: StepElement;
  stepElementPropertyModels: StepElementProperties[];
}): HydratedStepElementType {
  const elementPropertiesById = new Map(
    elementPropertyModels.map((elementProperty) => [elementProperty.id, elementProperty]),
  );

  return {
    elementId: stepElementModel.elementId,
    id: stepElementModel.id,
    name: stepElementModel.name,
    order: stepElementModel.order,
    properties: stepElementPropertyModels
      .map((stepElementProperty) => {
        const elementProperty = elementPropertiesById.get(
          stepElementProperty.propertyId,
        );

        if (!elementProperty) {
          throw new UnexpectedError(
            `Element property id: ${stepElementProperty.propertyId} not found.`,
          );
        }

        return {
          defaultValue: elementProperty.defaultValue,
          propertyId: elementProperty.id,
          propertyName: elementProperty.propertyName,
          propertyType: elementProperty.propertyType,
          required: elementProperty.required,
          value: stepElementProperty.propertyValue,
        };
      })
      .sort(
        (left, right) =>
          left.propertyName.localeCompare(right.propertyName) ||
          left.propertyId.localeCompare(right.propertyId),
      ),
  };
}
