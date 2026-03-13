import type { ConditionStatement } from "@packages/shared/db/schemas/conditionStatement";
import type {
  UpdateStepElementsInput,
  UpdateStepElementsOutput,
} from "@packages/shared/http/schemas/flows/steps/elements/updateStepElements";
import { NodeType } from "@packages/shared/types/enums";
import { Op } from "sequelize";

import { Element } from "~db/models/Element";
import { ElementProperties } from "~db/models/ElementProperties";
import { Node } from "~db/models/Node";
import { StepElement } from "~db/models/StepElement";
import { StepElementCondition } from "~db/models/StepElementCondition";
import { StepElementProperties } from "~db/models/StepElementProperties";
import { sequelize } from "~db/sequelize";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type StepEntity from "../StepEntity";
import defaultValueSatisfiesStepElementProperty from "../utils/defaultValueSatisfiesStepElementProperty";
import getReferencedStepElementIds from "../utils/getReferencedStepElementIds";
import serializeStepElementPropertyValue from "../utils/serializeStepElementPropertyValue";

export default async function updateStepElements(
  this: StepEntity,
  flowId: string,
  payload: UpdateStepElementsInput,
): Promise<UpdateStepElementsOutput> {
  return sequelize.transaction(async (transaction) => {
    const stepNode = await Node.findOne({
      transaction,
      where: {
        flowId,
        id: this.dbModel.nodeId,
        type: NodeType.STEP,
      },
    });

    if (!stepNode) {
      throw new NotFoundError(
        `Step id: ${this.dbModel.nodeId} not found in flow id: ${flowId}.`,
      );
    }

    const submittedElements = payload.elements;
    const submittedElementIds = submittedElements.map((element) => element.id);
    const submittedElementIdSet = new Set(submittedElementIds);

    if (submittedElementIds.length !== submittedElementIdSet.size) {
      throw new InvalidRequestError("Step element ids must be unique.");
    }

    const existingStepElements = await StepElement.findAll({
      transaction,
      where: {
        stepId: this.dbModel.nodeId,
      },
    });

    const existingStepElementsById = new Map(
      existingStepElements.map((stepElement) => [stepElement.id, stepElement]),
    );

    const existingSubmittedStepElements = await StepElement.findAll({
      transaction,
      where: {
        id: { [Op.in]: submittedElementIds },
      },
    });

    for (const existingStepElement of existingSubmittedStepElements) {
      if (existingStepElement.stepId !== this.dbModel.nodeId) {
        throw new InvalidRequestError(
          `Step element id: ${existingStepElement.id} does not belong to step id: ${this.dbModel.nodeId}.`,
        );
      }
    }

    const submittedElementDefinitionIds = Array.from(
      new Set(submittedElements.map((element) => element.elementId)),
    );

    const [elementModels, elementPropertyModels] = await Promise.all([
      Element.findAll({
        transaction,
        where: {
          id: { [Op.in]: submittedElementDefinitionIds },
        },
      }),
      ElementProperties.findAll({
        transaction,
        where: {
          elementId: { [Op.in]: submittedElementDefinitionIds },
        },
      }),
    ]);

    const elementDefinitionIds = new Set(
      elementModels.map((element) => element.id),
    );

    for (const element of submittedElements) {
      if (!elementDefinitionIds.has(element.elementId)) {
        throw new InvalidRequestError(
          `Unknown element id: ${element.elementId} for step element id: ${element.id}.`,
        );
      }
    }

    const elementPropertiesByElementId = new Map<string, ElementProperties[]>();

    for (const elementProperty of elementPropertyModels) {
      const existing =
        elementPropertiesByElementId.get(elementProperty.elementId) ?? [];

      existing.push(elementProperty);
      elementPropertiesByElementId.set(elementProperty.elementId, existing);
    }

    const serializedPropertiesByStepElementId = new Map<
      string,
      Array<{ propertyId: string; propertyValue: string }>
    >();

    for (const submittedElement of submittedElements) {
      const submittedPropertyIds = submittedElement.properties.map(
        (property) => property.propertyId,
      );
      const submittedPropertyIdSet = new Set(submittedPropertyIds);

      if (submittedPropertyIds.length !== submittedPropertyIdSet.size) {
        throw new InvalidRequestError(
          `Property ids must be unique for step element id: ${submittedElement.id}.`,
        );
      }

      const validElementProperties =
        elementPropertiesByElementId.get(submittedElement.elementId) ?? [];
      const validElementPropertiesById = new Map(
        validElementProperties.map((property) => [property.id, property]),
      );

      const serializedProperties = submittedElement.properties.map(
        (property) => {
          const elementProperty = validElementPropertiesById.get(
            property.propertyId,
          );

          if (!elementProperty) {
            throw new InvalidRequestError(
              `Property id: ${property.propertyId} is invalid for element id: ${submittedElement.elementId}.`,
            );
          }

          return {
            propertyId: property.propertyId,
            propertyValue: serializeStepElementPropertyValue(
              property.value,
              elementProperty.propertyType,
            ),
          };
        },
      );

      for (const elementProperty of validElementProperties) {
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
          `Required property id: ${elementProperty.id} is missing for step element id: ${submittedElement.id}.`,
        );
      }

      serializedPropertiesByStepElementId.set(
        submittedElement.id,
        serializedProperties,
      );
    }

    const removedStepElementIds = existingStepElements
      .map((stepElement) => stepElement.id)
      .filter((id) => !submittedElementIdSet.has(id));
    const removedStepElementIdSet = new Set(removedStepElementIds);

    if (removedStepElementIds.length > 0) {
      const flowStepNodes = await Node.findAll({
        transaction,
        where: {
          flowId,
          type: NodeType.STEP,
        },
      });

      const flowStepElementModels = await StepElement.findAll({
        transaction,
        where: {
          id: { [Op.notIn]: removedStepElementIds },
          stepId: { [Op.in]: flowStepNodes.map((node) => node.id) },
        },
      });

      const survivingConditionModels = await StepElementCondition.findAll({
        transaction,
        where: {
          stepElementId: {
            [Op.in]: flowStepElementModels.map((element) => element.id),
          },
        },
      });

      const referencingCondition = survivingConditionModels.find((condition) =>
        getReferencedStepElementIds(
          condition.statement as ConditionStatement,
        ).some((referencedStepElementId) =>
          removedStepElementIdSet.has(referencedStepElementId),
        ),
      );

      if (referencingCondition) {
        throw new InvalidRequestError(
          `Cannot remove a step element that is still referenced by condition id: ${referencingCondition.id}.`,
        );
      }
    }

    for (const [index, submittedElement] of submittedElements.entries()) {
      const existingStepElement = existingStepElementsById.get(
        submittedElement.id,
      );

      if (existingStepElement) {
        await StepElement.update(
          {
            elementId: submittedElement.elementId,
            name: submittedElement.name,
            order: index,
          },
          {
            transaction,
            where: {
              id: submittedElement.id,
            },
          },
        );
      } else {
        await StepElement.create(
          {
            elementId: submittedElement.elementId,
            id: submittedElement.id,
            name: submittedElement.name,
            order: index,
            stepId: this.dbModel.nodeId,
          },
          { transaction },
        );
      }

      const serializedProperties =
        serializedPropertiesByStepElementId.get(submittedElement.id) ?? [];

      await Promise.all(
        serializedProperties.map((property) =>
          StepElementProperties.upsert(
            {
              propertyId: property.propertyId,
              propertyValue: property.propertyValue,
              stepElementId: submittedElement.id,
            },
            { transaction },
          ),
        ),
      );

      await StepElementProperties.destroy({
        transaction,
        where: {
          propertyId: {
            [Op.notIn]: serializedProperties.map(
              (property) => property.propertyId,
            ),
          },
          stepElementId: submittedElement.id,
        },
      });
    }

    await StepElementProperties.destroy({
      transaction,
      where: {
        stepElementId: { [Op.in]: removedStepElementIds },
      },
    });

    await StepElementCondition.destroy({
      transaction,
      where: {
        stepElementId: { [Op.in]: removedStepElementIds },
      },
    });

    await StepElement.destroy({
      transaction,
      where: {
        id: { [Op.in]: removedStepElementIds },
      },
    });

    return this.fetchStepElements(flowId, transaction);
  });
}
