import type { StepElementType } from "@packages/shared/http/schemas/flows/steps/elements/common";
import { Op, type Transaction } from "sequelize";

import { Element } from "~db/models/Element";
import { ElementProperties } from "~db/models/ElementProperties";
import { StepElementProperties } from "~db/models/StepElementProperties";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type StepElementEntity from "../StepElementEntity";
import defaultValueSatisfiesStepElementProperty from "../utils/defaultValueSatisfiesStepElementProperty";
import serializeStepElementPropertyValue from "../utils/serializeStepElementPropertyValue";

export default async function updateFromInput(
  this: StepElementEntity,
  input: StepElementType,
  order: number,
  transaction: Transaction,
): Promise<StepElementEntity> {
  const submittedPropertyIds = input.properties.map(
    (property) => property.propertyId,
  );
  const submittedPropertyIdSet = new Set(submittedPropertyIds);

  if (submittedPropertyIds.length !== submittedPropertyIdSet.size) {
    throw new InvalidRequestError(
      `Property ids must be unique for step element id: ${input.id}.`,
    );
  }

  // Validate against the current element definition inside the entity method so
  // the update logic stays encapsulated here. If step updates become hot enough
  // to matter, these lookups can be lifted and batched by the caller.
  const [elementModel, elementPropertyModels] = await Promise.all([
    Element.findByPk(input.elementId, { transaction }),
    ElementProperties.findAll({
      transaction,
      where: {
        elementId: input.elementId,
      },
    }),
  ]);

  if (!elementModel) {
    throw new InvalidRequestError(
      `Unknown element id: ${input.elementId} for step element id: ${input.id}.`,
    );
  }

  const validElementPropertiesById = new Map(
    elementPropertyModels.map((property) => [property.id, property]),
  );

  const serializedProperties = input.properties.map((property) => {
    const elementProperty = validElementPropertiesById.get(property.propertyId);

    if (!elementProperty) {
      throw new InvalidRequestError(
        `Property id: ${property.propertyId} is invalid for element id: ${input.elementId}.`,
      );
    }

    return {
      propertyId: property.propertyId,
      propertyValue: serializeStepElementPropertyValue(
        property.value,
        elementProperty.propertyType,
      ),
    };
  });

  for (const elementProperty of elementPropertyModels) {
    if (!elementProperty.required) {
      continue;
    }

    const submittedProperty = serializedProperties.find(
      (property) => property.propertyId === elementProperty.id,
    );

    if (submittedProperty) {
      continue;
    }

    if (
      defaultValueSatisfiesStepElementProperty(
        elementProperty.defaultValue,
        elementProperty.propertyType,
      )
    ) {
      continue;
    }

    throw new InvalidRequestError(
      `Required property id: ${elementProperty.id} is missing for step element id: ${input.id}.`,
    );
  }

  this.dbModel.elementId = input.elementId;
  this.dbModel.name = input.name;
  this.dbModel.order = order;

  await this.dbModel.save({ transaction });

  await Promise.all(
    serializedProperties.map((property) =>
      StepElementProperties.upsert(
        {
          propertyId: property.propertyId,
          propertyValue: property.propertyValue,
          stepElementId: this.dbModel.id,
        },
        { transaction },
      ),
    ),
  );

  await StepElementProperties.destroy({
    transaction,
    where: {
      propertyId: {
        [Op.notIn]: serializedProperties.map((property) => property.propertyId),
      },
      stepElementId: this.dbModel.id,
    },
  });

  await this.dbModel.reload({ transaction });

  return this;
}
