import type { HydratedStepElementType } from "@packages/shared/http/schemas/flows/steps/elements/common";

import type { ElementProperties } from "~db/models/ElementProperties";
import type { StepElement } from "~db/models/StepElement";
import type { StepElementProperties } from "~db/models/StepElementProperties";
import UnexpectedError from "~src/utils/errors/UnexpectedError";

export default function getHydratedStepElements({
  elementPropertyModels,
  stepElementModels,
  stepElementPropertyModels,
}: {
  elementPropertyModels: ElementProperties[];
  stepElementModels: StepElement[];
  stepElementPropertyModels: StepElementProperties[];
}): HydratedStepElementType[] {
  const elementPropertiesById = new Map(
    elementPropertyModels.map((elementProperty) => [elementProperty.id, elementProperty]),
  );

  const stepElementPropertiesByStepElementId = new Map<
    string,
    StepElementProperties[]
  >();

  for (const stepElementProperty of stepElementPropertyModels) {
    const existing =
      stepElementPropertiesByStepElementId.get(stepElementProperty.stepElementId) ??
      [];

    existing.push(stepElementProperty);
    stepElementPropertiesByStepElementId.set(stepElementProperty.stepElementId, existing);
  }

  return stepElementModels
    .slice()
    .sort(
      (left, right) => left.order - right.order || left.id.localeCompare(right.id),
    )
    .map((stepElement) => ({
      elementId: stepElement.elementId,
      id: stepElement.id,
      name: stepElement.name,
      order: stepElement.order,
      properties: (
        stepElementPropertiesByStepElementId.get(stepElement.id) ?? []
      )
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
    }));
}
