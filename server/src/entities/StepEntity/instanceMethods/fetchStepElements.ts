import type { FindStepElementsOutput } from "@packages/shared/http/schemas/flows/steps/elements/findStepElements";
import { NodeType } from "@packages/shared/types/enums";
import { Op, type Transaction } from "sequelize";

import { ElementProperties } from "~db/models/ElementProperties";
import { Node } from "~db/models/Node";
import { StepElement } from "~db/models/StepElement";
import { StepElementProperties } from "~db/models/StepElementProperties";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type StepEntity from "../StepEntity";
import getHydratedStepElements from "./getHydratedStepElements";

export default async function fetchStepElements(
  this: StepEntity,
  flowId: string,
  transaction?: Transaction,
): Promise<FindStepElementsOutput> {
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

  const stepElementModels = await StepElement.findAll({
    transaction,
    where: {
      stepId: this.dbModel.nodeId,
    },
  });

  const stepElementIds = stepElementModels.map((stepElement) => stepElement.id);

  const stepElementPropertyModels = await StepElementProperties.findAll({
    transaction,
    where: {
      stepElementId: { [Op.in]: stepElementIds },
    },
  });

  const propertyIds = Array.from(
    new Set(stepElementPropertyModels.map((property) => property.propertyId)),
  );

  const elementPropertyModels = await ElementProperties.findAll({
    transaction,
    where: {
      id: { [Op.in]: propertyIds },
    },
  });

  return getHydratedStepElements({
    elementPropertyModels,
    stepElementModels,
    stepElementPropertyModels,
  });
}
