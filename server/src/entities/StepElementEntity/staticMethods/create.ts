import checkExists from "@packages/shared/utils/checkExists";
import { type InferCreationAttributes, Op } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { StepElement } from "~db/models/StepElement";
import { sequelize } from "~db/sequelize";
import ElementEntity from "~entities/ElementEntity";
import StepEntity from "~entities/StepEntity";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type StepElementEntity from "../StepElementEntity";

export default async function create(
  this: typeof StepElementEntity,
  params: Omit<InferCreationAttributes<StepElement>, "id" | "order"> & {
    id?: string;
    order?: number;
  },
): Promise<StepElementEntity> {
  const step = await StepEntity.findById(params.stepId);
  if (!step) {
    throw new NotFoundError(`Step id: ${params.stepId} not found.`);
  }

  // Validate element exists
  const element = await ElementEntity.findById(params.elementId);
  if (!element) {
    throw new NotFoundError(`Element id: ${params.elementId} not found.`);
  }

  return await sequelize.transaction(async (transaction) => {
    const maxOrder = (await StepElement.max("order", {
      where: { stepId: params.stepId },
      transaction,
    })) as number | null;

    const largestOrder = maxOrder ?? -1;
    const appendOrder = largestOrder + 1;
    const hasProvidedOrder =
      typeof params.order === "number" && Number.isFinite(params.order);
    const providedOrder = hasProvidedOrder
      ? checkExists(params.order)
      : appendOrder;

    const targetOrder = Math.min(
      Math.max(Math.floor(providedOrder), 0),
      appendOrder,
    );

    if (hasProvidedOrder && targetOrder <= largestOrder) {
      await StepElement.increment(
        { order: 1 },
        {
          where: {
            stepId: params.stepId,
            order: { [Op.gte]: targetOrder },
          },
          transaction,
        },
      );
    }

    const payload = {
      ...params,
      id: params.id ?? uuidV4(),
      order: targetOrder,
    };

    const model = await StepElement.create(payload, { transaction });

    return new this(model);
  });
}
