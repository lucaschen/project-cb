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
import assertNoBuilderGraphCycles from "../utils/assertNoBuilderGraphCycles";
import assertSubmittedStepsConnected from "../utils/assertSubmittedStepsConnected";

export default async function updateBuilder(
  this: FlowEntity,
  payload: UpdateBuilderInput,
): Promise<UpdateBuilderOutput> {
  await sequelize.transaction(async (transaction) => {
    const submittedStepNodeIds = payload.steps.map((step) => step.nodeId);
    const submittedDecisionNodeIds = payload.decisionNodes.map(
      (decisionNode) => decisionNode.nodeId,
    );
    const submittedConditionIds = payload.decisionNodes.flatMap((decisionNode) =>
      decisionNode.conditions.map((condition) => condition.id),
    );

    const submittedStepNodeIdSet = new Set(submittedStepNodeIds);
    const submittedDecisionNodeIdSet = new Set(submittedDecisionNodeIds);
    const submittedConditionIdSet = new Set(submittedConditionIds);

    if (submittedStepNodeIds.length !== submittedStepNodeIdSet.size) {
      throw new InvalidRequestError("Step node ids must be unique.");
    }

    if (submittedDecisionNodeIds.length !== submittedDecisionNodeIdSet.size) {
      throw new InvalidRequestError("Decision node ids must be unique.");
    }

    if (submittedConditionIds.length !== submittedConditionIdSet.size) {
      throw new InvalidRequestError("Decision condition ids must be unique.");
    }

    for (const stepNodeId of submittedStepNodeIdSet) {
      if (submittedDecisionNodeIdSet.has(stepNodeId)) {
        throw new InvalidRequestError(
          `Node id: ${stepNodeId} cannot be submitted as both a step and a decision node.`,
        );
      }
    }

    const submittedNodeIds = [
      ...submittedStepNodeIds,
      ...submittedDecisionNodeIds,
    ];
    const submittedNodeIdSet = new Set(submittedNodeIds);

    const [existingFlowStepEntities, existingFlowDecisionNodeEntities, existingSubmittedNodes] =
      await Promise.all([
        StepEntity.findByFlowId(this.dbModel.id, transaction),
        DecisionNodeEntity.findByFlowId(this.dbModel.id, transaction),
        Node.findAll({
          transaction,
          where: {
            id: { [Op.in]: submittedNodeIds },
          },
        }),
      ]);

    const [existingSubmittedStepEntities, existingSubmittedDecisionNodeEntities] =
      await Promise.all([
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

    for (const step of payload.steps) {
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

    for (const step of payload.steps) {
      if (step.nextNodeId === null) {
        continue;
      }

      if (submittedNodeIdSet.has(step.nextNodeId)) {
        continue;
      }

      throw new InvalidRequestError(
        `Step node id: ${step.nodeId} has invalid nextNodeId: ${step.nextNodeId}.`,
      );
    }

    for (const decisionNode of payload.decisionNodes) {
      if (!submittedNodeIdSet.has(decisionNode.fallbackNextNodeId)) {
        throw new InvalidRequestError(
          `Decision node id: ${decisionNode.nodeId} has invalid fallbackNextNodeId: ${decisionNode.fallbackNextNodeId}.`,
        );
      }

      for (const condition of decisionNode.conditions) {
        if (submittedNodeIdSet.has(condition.toNodeId)) {
          continue;
        }

        throw new InvalidRequestError(
          `Decision condition id: ${condition.id} has invalid toNodeId: ${condition.toNodeId}.`,
        );
      }
    }

    assertSubmittedStepsConnected({
      decisionNodes: payload.decisionNodes,
      steps: payload.steps,
    });
    assertNoBuilderGraphCycles({
      decisionNodes: payload.decisionNodes,
      steps: payload.steps,
    });

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
        existingSubmittedStepEntities.map((stepEntity) => stepEntity.dbModel.nodeId),
      ),
      flowId: this.dbModel.id,
      steps: payload.steps,
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

    await DecisionNodeEntity.destroyByNodeIds(removedDecisionNodeIds, transaction);
    await StepEntity.destroyByNodeIds(removedStepNodeIds, transaction);
  });

  return this.fetchBuilderPayload();
}
