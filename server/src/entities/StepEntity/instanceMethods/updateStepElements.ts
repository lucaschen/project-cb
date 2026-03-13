import type { ConditionStatement } from "@packages/shared/db/schemas/conditionStatement";
import type {
  UpdateStepElementsInput,
  UpdateStepElementsOutput,
} from "@packages/shared/http/schemas/flows/steps/elements/updateStepElements";
import { NodeType } from "@packages/shared/types/enums";
import { Op } from "sequelize";

import { Node } from "~db/models/Node";
import { StepElement } from "~db/models/StepElement";
import { StepElementCondition } from "~db/models/StepElementCondition";
import { StepElementProperties } from "~db/models/StepElementProperties";
import { sequelize } from "~db/sequelize";
import findMissingReferencedStepElementId from "~entities/StepElementConditionEntity/utils/findMissingReferencedStepElementId";
import StepElementEntity from "~entities/StepElementEntity";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type StepEntity from "../StepEntity";

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

    const existingStepElements = await StepElementEntity.findByStepId(
      this.dbModel.nodeId,
      transaction,
    );
    const existingStepElementsById = new Map(
      existingStepElements.map((stepElement) => [
        stepElement.dbModel.id,
        stepElement,
      ]),
    );

    const existingSubmittedStepElements = await StepElementEntity.findByIds(
      submittedElementIds,
      transaction,
    );

    for (const existingStepElement of existingSubmittedStepElements) {
      if (existingStepElement.dbModel.stepId !== this.dbModel.nodeId) {
        throw new InvalidRequestError(
          `Step element id: ${existingStepElement.dbModel.id} does not belong to step id: ${this.dbModel.nodeId}.`,
        );
      }
    }

    const removedStepElementIds = existingStepElements
      .map((stepElement) => stepElement.dbModel.id)
      .filter((id) => !submittedElementIdSet.has(id));

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
      const validRemainingStepElementIds = new Set(
        flowStepElementModels.map((element) => element.id),
      );

      const referencingCondition = survivingConditionModels.find((condition) =>
        Boolean(
          findMissingReferencedStepElementId({
            statement: condition.statement as ConditionStatement,
            validStepElementIds: validRemainingStepElementIds,
          }),
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

      const stepElementEntity =
        existingStepElement ??
        new StepElementEntity(
          await StepElement.create(
            {
              elementId: submittedElement.elementId,
              id: submittedElement.id,
              name: submittedElement.name,
              order: index,
              stepId: this.dbModel.nodeId,
            },
            { transaction },
          ),
        );

      await stepElementEntity.updateFromInput(
        submittedElement,
        index,
        transaction,
      );
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
