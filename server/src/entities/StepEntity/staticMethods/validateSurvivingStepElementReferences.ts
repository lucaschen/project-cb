import type { BuilderDecisionNodeInputType } from "@packages/shared/http/schemas/flows/builder/common";
import { Op, type Transaction } from "sequelize";

import { StepElement } from "~db/models/StepElement";
import { StepElementCondition } from "~db/models/StepElementCondition";
import findMissingReferencedStepElementId from "~entities/StepElementConditionEntity/utils/findMissingReferencedStepElementId";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type StepEntity from "../StepEntity";

export default async function validateSurvivingStepElementReferences(
  this: typeof StepEntity,
  {
    decisionNodes,
    stepNodeIds,
    transaction,
  }: {
    decisionNodes: BuilderDecisionNodeInputType[];
    stepNodeIds: string[];
    transaction: Transaction;
  },
): Promise<void> {
  const survivingStepElementModels = await StepElement.findAll({
    transaction,
    where: {
      stepId: {
        [Op.in]: stepNodeIds,
      },
    },
  });
  const survivingStepElementIdSet = new Set(
    survivingStepElementModels.map((stepElement) => stepElement.id),
  );

  for (const decisionNode of decisionNodes) {
    for (const condition of decisionNode.conditions) {
      const invalidStepElementId = findMissingReferencedStepElementId({
        statement: condition.statement,
        validStepElementIds: survivingStepElementIdSet,
      });

      if (!invalidStepElementId) {
        continue;
      }

      throw new InvalidRequestError(
        `Decision condition id: ${condition.id} references invalid step element id: ${invalidStepElementId}.`,
      );
    }
  }

  const survivingStepElementConditionModels = await StepElementCondition.findAll({
    transaction,
    where: {
      stepElementId: {
        [Op.in]: survivingStepElementModels.map((stepElement) => stepElement.id),
      },
    },
  });

  for (const stepElementCondition of survivingStepElementConditionModels) {
    const invalidStepElementId = findMissingReferencedStepElementId({
      statement: stepElementCondition.statement,
      validStepElementIds: survivingStepElementIdSet,
    });

    if (!invalidStepElementId) {
      continue;
    }

    throw new InvalidRequestError(
      `Field visibility condition id: ${stepElementCondition.id} references invalid step element id: ${invalidStepElementId}.`,
    );
  }
}
