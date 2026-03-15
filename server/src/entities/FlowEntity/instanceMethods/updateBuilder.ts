import FlowBuilderEntity from "@packages/shared/entities/FlowBuilderEntity/FlowBuilderEntity";
import type {
  UpdateBuilderInput,
  UpdateBuilderOutput,
} from "@packages/shared/http/schemas/flows/builder/updateBuilder";
import { NodeType } from "@packages/shared/types/enums";
import { Op } from "sequelize";

import { Node } from "~db/models/Node";
import { sequelize } from "~db/sequelize";
import DecisionNodeEntity from "~entities/DecisionNodeEntity";
import StepEntity from "~entities/StepEntity";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type FlowEntity from "../FlowEntity";

export default async function updateBuilder(
  this: FlowEntity,
  payload: UpdateBuilderInput,
): Promise<UpdateBuilderOutput> {
  await sequelize.transaction(async (transaction) => {
    const validationErrors = new FlowBuilderEntity(
      payload,
    ).getValidationErrors();

    if (validationErrors.length > 0) {
      throw new InvalidRequestError(validationErrors[0]);
    }

    const submittedStepNodeIds = payload.stepNodes.map((step) => step.nodeId);
    const submittedDecisionNodeIds = payload.decisionNodes.map(
      (decisionNode) => decisionNode.nodeId,
    );

    const submittedStepNodeIdSet = new Set(submittedStepNodeIds);
    const submittedDecisionNodeIdSet = new Set(submittedDecisionNodeIds);

    const submittedNodeIds = [
      ...submittedStepNodeIds,
      ...submittedDecisionNodeIds,
    ];

    const [
      existingFlowStepEntities,
      existingFlowDecisionNodeEntities,
      existingSubmittedNodes,
    ] = await Promise.all([
      StepEntity.findByFlowId(this.dbModel.id, transaction),
      DecisionNodeEntity.findByFlowId(this.dbModel.id, transaction),
      Node.findAll({
        transaction,
        where: {
          id: { [Op.in]: submittedNodeIds },
        },
      }),
    ]);

    const [
      existingSubmittedStepEntities,
      existingSubmittedDecisionNodeEntities,
    ] = await Promise.all([
      StepEntity.findByNodeIds(submittedStepNodeIds, transaction),
      DecisionNodeEntity.findByNodeIds(submittedDecisionNodeIds, transaction),
    ]);

    const existingFlowStepNodeIdSet = new Set(
      existingFlowStepEntities.map((stepEntity) => stepEntity.dbModel.nodeId),
    );
    const existingFlowDecisionNodeIdSet = new Set(
      existingFlowDecisionNodeEntities.map(
        (decisionNodeEntity) => decisionNodeEntity.dbModel.nodeId,
      ),
    );
    const existingSubmittedNodesById = new Map(
      existingSubmittedNodes.map((node) => [node.id, node]),
    );
    const existingSubmittedDecisionNodesById = new Map(
      existingSubmittedDecisionNodeEntities.map((decisionNodeEntity) => [
        decisionNodeEntity.dbModel.nodeId,
        decisionNodeEntity,
      ]),
    );

    for (const step of payload.stepNodes) {
      const existingNode = existingSubmittedNodesById.get(step.nodeId);

      if (!existingNode) {
        continue;
      }

      if (
        existingNode.flowId === this.dbModel.id &&
        existingNode.type === NodeType.STEP &&
        existingFlowStepNodeIdSet.has(step.nodeId)
      ) {
        continue;
      }

      throw new InvalidRequestError(
        `Submitted step node id: ${step.nodeId} is not an existing step in this flow.`,
      );
    }

    for (const decisionNode of payload.decisionNodes) {
      const existingNode = existingSubmittedNodesById.get(decisionNode.nodeId);

      if (!existingNode) {
        continue;
      }

      if (
        existingNode.flowId === this.dbModel.id &&
        existingNode.type === NodeType.DECISION &&
        existingFlowDecisionNodeIdSet.has(decisionNode.nodeId)
      ) {
        continue;
      }

      throw new InvalidRequestError(
        `Submitted decision node id: ${decisionNode.nodeId} is not an existing decision node in this flow.`,
      );
    }

    await DecisionNodeEntity.validateSubmittedConditionOwnership(
      payload.decisionNodes,
      transaction,
    );

    await StepEntity.validateSurvivingStepElementReferences({
      decisionNodes: payload.decisionNodes,
      stepNodeIds: submittedStepNodeIds,
      transaction,
    });

    const removedStepNodeIds = Array.from(existingFlowStepNodeIdSet).filter(
      (nodeId) => !submittedStepNodeIdSet.has(nodeId),
    );
    const removedDecisionNodeIds = Array.from(
      existingFlowDecisionNodeIdSet,
    ).filter((nodeId) => !submittedDecisionNodeIdSet.has(nodeId));

    await StepEntity.syncBuilderSteps({
      existingNodeIds: new Set(
        existingSubmittedStepEntities.map(
          (stepEntity) => stepEntity.dbModel.nodeId,
        ),
      ),
      flowId: this.dbModel.id,
      steps: payload.stepNodes,
      transaction,
    });

    await DecisionNodeEntity.syncBuilderDecisionNodes({
      decisionNodes: payload.decisionNodes,
      existingByNodeId: existingSubmittedDecisionNodesById,
      existingNodeIds: new Set(
        existingSubmittedDecisionNodeEntities.map(
          (decisionNodeEntity) => decisionNodeEntity.dbModel.nodeId,
        ),
      ),
      flowId: this.dbModel.id,
      transaction,
    });

    await DecisionNodeEntity.destroyByNodeIds(
      removedDecisionNodeIds,
      transaction,
    );
    await StepEntity.destroyByNodeIds(removedStepNodeIds, transaction);
  });

  return this.fetchBuilderPayload();
}
