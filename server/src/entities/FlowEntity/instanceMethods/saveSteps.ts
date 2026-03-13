import type {
  SaveStepsInput,
  SaveStepsOutput,
} from "@packages/shared/http/schemas/flows/steps/saveSteps";
import { NodeType } from "@packages/shared/types/enums";
import { Op } from "sequelize";

import { DecisionNode } from "~db/models/DecisionNode";
import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";
import { Step } from "~db/models/Step";
import { StepElement } from "~db/models/StepElement";
import { StepElementCondition } from "~db/models/StepElementCondition";
import { StepElementProperties } from "~db/models/StepElementProperties";
import { sequelize } from "~db/sequelize";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type FlowEntity from "../FlowEntity";

export default async function saveSteps(
  this: FlowEntity,
  payload: SaveStepsInput,
): Promise<SaveStepsOutput> {
  return sequelize.transaction(async (transaction) => {
    const submittedSteps = payload.steps;
    const submittedNodeIds = submittedSteps.map((step) => step.nodeId);
    const submittedNodeIdSet = new Set(submittedNodeIds);

    if (submittedNodeIdSet.size !== submittedNodeIds.length) {
      throw new InvalidRequestError("Step node ids must be unique.");
    }

    const [existingFlowNodes, existingSubmittedNodes, decisionBaseNodes] =
      await Promise.all([
        Node.findAll({
          transaction,
          where: { flowId: this.dbModel.id },
        }),
        Node.findAll({
          transaction,
          where: {
            id: { [Op.in]: submittedNodeIds },
          },
        }),
        Node.findAll({
          transaction,
          where: {
            flowId: this.dbModel.id,
            type: NodeType.DECISION,
          },
        }),
      ]);

    const existingFlowStepNodeIds = new Set(
      existingFlowNodes
        .filter((node) => node.type === NodeType.STEP)
        .map((node) => node.id),
    );
    const existingFlowNonStepNodeIds = new Set(
      existingFlowNodes
        .filter((node) => node.type !== NodeType.STEP)
        .map((node) => node.id),
    );

    for (const node of existingSubmittedNodes) {
      if (node.flowId !== this.dbModel.id || node.type !== NodeType.STEP) {
        throw new InvalidRequestError(
          `Submitted step node id: ${node.id} is not an existing step in this flow.`,
        );
      }
    }

    const existingSubmittedStepNodeIds = new Set(
      existingSubmittedNodes.map((node) => node.id),
    );

    const removedStepNodeIds = Array.from(existingFlowStepNodeIds).filter(
      (nodeId) => !submittedNodeIdSet.has(nodeId),
    );
    const removedStepNodeIdSet = new Set(removedStepNodeIds);

    for (const step of submittedSteps) {
      if (step.nextNodeId === null) {
        continue;
      }

      if (submittedNodeIdSet.has(step.nextNodeId)) {
        continue;
      }

      if (existingFlowNonStepNodeIds.has(step.nextNodeId)) {
        continue;
      }

      throw new InvalidRequestError(
        `Step node id: ${step.nodeId} has invalid nextNodeId: ${step.nextNodeId}.`,
      );
    }

    const decisionNodeIds = decisionBaseNodes.map((node) => node.id);

    const [decisionNodes, decisionConditions] = await Promise.all([
      DecisionNode.findAll({
        transaction,
        where: {
          nodeId: { [Op.in]: decisionNodeIds },
        },
      }),
      DecisionNodeCondition.findAll({
        transaction,
        where: {
          nodeId: { [Op.in]: decisionNodeIds },
        },
      }),
    ]);

    const referencedRemovedFallbackNode = decisionNodes.find((decisionNode) =>
      removedStepNodeIdSet.has(decisionNode.fallbackNextNodeId),
    );

    if (referencedRemovedFallbackNode) {
      throw new InvalidRequestError(
        `Decision node id: ${referencedRemovedFallbackNode.nodeId} references a removed step.`,
      );
    }

    const referencedRemovedConditionNode = decisionConditions.find(
      (condition) => removedStepNodeIdSet.has(condition.toNodeId),
    );

    if (referencedRemovedConditionNode) {
      throw new InvalidRequestError(
        `Decision condition id: ${referencedRemovedConditionNode.id} references a removed step.`,
      );
    }

    const inboundReferenceCounts = new Map(
      submittedNodeIds.map((nodeId) => [nodeId, 0]),
    );

    for (const step of submittedSteps) {
      if (
        step.nextNodeId !== null &&
        submittedNodeIdSet.has(step.nextNodeId) &&
        step.nextNodeId !== step.nodeId
      ) {
        inboundReferenceCounts.set(
          step.nextNodeId,
          (inboundReferenceCounts.get(step.nextNodeId) ?? 0) + 1,
        );
      }
    }

    for (const decisionNode of decisionNodes) {
      if (submittedNodeIdSet.has(decisionNode.fallbackNextNodeId)) {
        inboundReferenceCounts.set(
          decisionNode.fallbackNextNodeId,
          (inboundReferenceCounts.get(decisionNode.fallbackNextNodeId) ?? 0) +
            1,
        );
      }
    }

    for (const condition of decisionConditions) {
      if (submittedNodeIdSet.has(condition.toNodeId)) {
        inboundReferenceCounts.set(
          condition.toNodeId,
          (inboundReferenceCounts.get(condition.toNodeId) ?? 0) + 1,
        );
      }
    }

    for (const [index, step] of submittedSteps.entries()) {
      if (index === 0) {
        continue;
      }

      if ((inboundReferenceCounts.get(step.nodeId) ?? 0) === 0) {
        throw new InvalidRequestError(
          `Step node id: ${step.nodeId} is disconnected from the saved step graph.`,
        );
      }
    }

    for (const [index, step] of submittedSteps.entries()) {
      const nextNodeId = step.nextNodeId ?? null;

      if (existingSubmittedStepNodeIds.has(step.nodeId)) {
        await Node.update(
          { name: step.name },
          {
            transaction,
            where: { id: step.nodeId },
          },
        );

        await Step.update(
          { nextNodeId, order: index },
          {
            transaction,
            where: { nodeId: step.nodeId },
          },
        );

        await NodeCoordinate.upsert(
          {
            nodeId: step.nodeId,
            x: step.coordinates.x,
            y: step.coordinates.y,
          },
          { transaction },
        );

        continue;
      }

      await Node.create(
        {
          flowId: this.dbModel.id,
          id: step.nodeId,
          name: step.name,
          type: NodeType.STEP,
        },
        { transaction },
      );

      await Step.create(
        {
          nextNodeId,
          nodeId: step.nodeId,
          order: index,
        },
        { transaction },
      );

      await NodeCoordinate.create(
        {
          nodeId: step.nodeId,
          x: step.coordinates.x,
          y: step.coordinates.y,
        },
        { transaction },
      );
    }

    const removedStepElements = await StepElement.findAll({
      transaction,
      where: {
        stepId: { [Op.in]: removedStepNodeIds },
      },
    });

    const removedStepElementIds = removedStepElements.map(
      (stepElement) => stepElement.id,
    );

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
        stepId: { [Op.in]: removedStepNodeIds },
      },
    });

    await NodeCoordinate.destroy({
      transaction,
      where: {
        nodeId: { [Op.in]: removedStepNodeIds },
      },
    });

    await Step.destroy({
      transaction,
      where: {
        nodeId: { [Op.in]: removedStepNodeIds },
      },
    });

    await Node.destroy({
      transaction,
      where: {
        id: { [Op.in]: removedStepNodeIds },
      },
    });

    return this.findStepSummaries(transaction);
  });
}
