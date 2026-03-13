import type { FindStepElementsOutput } from "@packages/shared/http/schemas/flows/steps/elements/findStepElements";
import { NodeType } from "@packages/shared/types/enums";
import type { Transaction } from "sequelize";

import { Node } from "~db/models/Node";
import StepElementEntity from "~entities/StepElementEntity";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type StepEntity from "../StepEntity";

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

  const stepElementEntities = await StepElementEntity.findByStepId(
    this.dbModel.nodeId,
    transaction,
  );

  // Hydrate each entity via its own method for now; this read path is simple to
  // follow and can be re-batched later if builder payload performance becomes a
  // bottleneck.
  return await Promise.all(
    stepElementEntities.map((stepElementEntity) =>
      stepElementEntity.fetchHydratedPayload(transaction),
    ),
  );
}
