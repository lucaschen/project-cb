import type { BuilderDecisionNodeInputType } from "@packages/shared/http/schemas/flows/builder/common";
import type { Transaction } from "sequelize";

import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type DecisionNodeEntity from "../DecisionNodeEntity";

export default async function validateSubmittedConditionOwnership(
  this: typeof DecisionNodeEntity,
  decisionNodes: BuilderDecisionNodeInputType[],
  transaction?: Transaction,
): Promise<void> {
  const submittedConditionIds = decisionNodes.flatMap((decisionNode) =>
    decisionNode.conditions.map((condition) => condition.id),
  );
  const submittedConditionOwnerById = new Map(
    decisionNodes.flatMap((decisionNode) =>
      decisionNode.conditions.map((condition) => [
        condition.id,
        decisionNode.nodeId,
      ]),
    ),
  );
  const existingConditionEntities = await this.findConditionEntitiesByIds(
    submittedConditionIds,
    transaction,
  );

  for (const existingConditionEntity of existingConditionEntities) {
    const submittedOwnerNodeId = submittedConditionOwnerById.get(
      existingConditionEntity.dbModel.id,
    );

    if (submittedOwnerNodeId === existingConditionEntity.dbModel.nodeId) {
      continue;
    }

    throw new InvalidRequestError(
      `Decision condition id: ${existingConditionEntity.dbModel.id} does not belong to submitted decision node id: ${submittedOwnerNodeId}.`,
    );
  }
}
