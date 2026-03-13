import type { HydratedStepElementType } from "@packages/shared/http/schemas/flows/steps/elements/common";
import { Op, type Transaction } from "sequelize";

import { ElementProperties } from "~db/models/ElementProperties";
import { StepElementProperties } from "~db/models/StepElementProperties";

import type StepElementEntity from "../StepElementEntity";
import hydrateStepElement from "../utils/hydrateStepElement";

export default async function fetchHydratedPayload(
  this: StepElementEntity,
  transaction?: Transaction,
): Promise<HydratedStepElementType> {
  const stepElementPropertyModels = await StepElementProperties.findAll({
    transaction,
    where: {
      stepElementId: this.dbModel.id,
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

  return hydrateStepElement({
    elementPropertyModels,
    stepElementModel: this.dbModel,
    stepElementPropertyModels,
  });
}
