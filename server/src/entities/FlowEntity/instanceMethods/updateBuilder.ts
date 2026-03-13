import type {
  UpdateBuilderInput,
  UpdateBuilderOutput,
} from "@packages/shared/http/schemas/flows/builder/updateBuilder";
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
import DecisionNodeEntity from "~entities/DecisionNodeEntity";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type FlowEntity from "../FlowEntity";
import assertNoBuilderGraphCycles from "../utils/assertNoBuilderGraphCycles";
import assertSubmittedStepsConnected from "../utils/assertSubmittedStepsConnected";
import findMissingReferencedStepElementId from "../utils/findMissingReferencedStepElementId";

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

    const [
      existingFlowNodes,
      existingSubmittedNodes,
      existingSubmittedDecisionNodeEntities,
      existingSubmittedConditionModels,
    ] = await Promise.all([
      Node.findAll({
        transaction,
        where: {
          flowId: this.dbModel.id,
        },
      }),
      Node.findAll({
        transaction,
        where: {
          id: { [Op.in]: submittedNodeIds },
        },
      }),
      DecisionNodeEntity.findByNodeIds(submittedDecisionNodeIds, transaction),
      DecisionNodeCondition.findAll({
        transaction,
        where: {
          id: { [Op.in]: submittedConditionIds },
        },
      }),
    ]);

    const existingFlowStepNodeIds = new Set(
      existingFlowNodes
        .filter((node) => node.type === NodeType.STEP)
        .map((node) => node.id),
    );
    const existingFlowDecisionNodeIds = new Set(
      existingFlowNodes
        .filter((node) => node.type === NodeType.DECISION)
        .map((node) => node.id),
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
        existingNode.flowId !== this.dbModel.id ||
        existingNode.type !== NodeType.STEP
      ) {
        throw new InvalidRequestError(
          `Submitted step node id: ${step.nodeId} is not an existing step in this flow.`,
        );
      }
    }

    for (const decisionNode of payload.decisionNodes) {
      const existingNode = existingSubmittedNodesById.get(decisionNode.nodeId);

      if (!existingNode) {
        continue;
      }

      if (
        existingNode.flowId !== this.dbModel.id ||
        existingNode.type !== NodeType.DECISION
      ) {
        throw new InvalidRequestError(
          `Submitted decision node id: ${decisionNode.nodeId} is not an existing decision node in this flow.`,
        );
      }
    }

    const submittedConditionOwnerById = new Map(
      payload.decisionNodes.flatMap((decisionNode) =>
        decisionNode.conditions.map((condition) => [
          condition.id,
          decisionNode.nodeId,
        ]),
      ),
    );

    for (const existingCondition of existingSubmittedConditionModels) {
      const submittedOwnerNodeId = submittedConditionOwnerById.get(
        existingCondition.id,
      );

      if (submittedOwnerNodeId !== existingCondition.nodeId) {
        throw new InvalidRequestError(
          `Decision condition id: ${existingCondition.id} does not belong to submitted decision node id: ${submittedOwnerNodeId}.`,
        );
      }
    }

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

    const survivingStepElementModels = await StepElement.findAll({
      transaction,
      where: {
        stepId: { [Op.in]: submittedStepNodeIds },
      },
    });
    const survivingStepElementIdSet = new Set(
      survivingStepElementModels.map((stepElement) => stepElement.id),
    );

    for (const decisionNode of payload.decisionNodes) {
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

    const survivingStepElementConditionModels = await StepElementCondition.findAll(
      {
        transaction,
        where: {
          stepElementId: {
            [Op.in]: survivingStepElementModels.map((stepElement) => stepElement.id),
          },
        },
      },
    );

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

    const removedStepNodeIds = Array.from(existingFlowStepNodeIds).filter(
      (nodeId) => !submittedStepNodeIdSet.has(nodeId),
    );
    const removedDecisionNodeIds = Array.from(existingFlowDecisionNodeIds).filter(
      (nodeId) => !submittedDecisionNodeIdSet.has(nodeId),
    );

    for (const [index, step] of payload.steps.entries()) {
      const existingNode = existingSubmittedNodesById.get(step.nodeId);

      if (existingNode) {
        await Node.update(
          {
            name: step.name,
          },
          {
            transaction,
            where: {
              id: step.nodeId,
            },
          },
        );
      } else {
        await Node.create(
          {
            flowId: this.dbModel.id,
            id: step.nodeId,
            name: step.name,
            type: NodeType.STEP,
          },
          { transaction },
        );
      }

      await Step.upsert(
        {
          nextNodeId: step.nextNodeId,
          nodeId: step.nodeId,
          order: index,
        },
        { transaction },
      );

      await NodeCoordinate.upsert(
        {
          nodeId: step.nodeId,
          x: step.coordinates.x,
          y: step.coordinates.y,
        },
        { transaction },
      );
    }

    for (const decisionNode of payload.decisionNodes) {
      const existingNode = existingSubmittedNodesById.get(decisionNode.nodeId);

      if (existingNode) {
        await Node.update(
          {
            name: decisionNode.name,
          },
          {
            transaction,
            where: {
              id: decisionNode.nodeId,
            },
          },
        );
      } else {
        await Node.create(
          {
            flowId: this.dbModel.id,
            id: decisionNode.nodeId,
            name: decisionNode.name,
            type: NodeType.DECISION,
          },
          { transaction },
        );
      }

      await NodeCoordinate.upsert(
        {
          nodeId: decisionNode.nodeId,
          x: decisionNode.coordinates.x,
          y: decisionNode.coordinates.y,
        },
        { transaction },
      );

      const existingDecisionNodeEntity = existingSubmittedDecisionNodesById.get(
        decisionNode.nodeId,
      );
      const decisionNodeEntity =
        existingDecisionNodeEntity ??
        new DecisionNodeEntity(
          await DecisionNode.create(
            {
              fallbackNextNodeId: decisionNode.fallbackNextNodeId,
              nodeId: decisionNode.nodeId,
            },
            { transaction },
          ),
        );

      await decisionNodeEntity.updateFromInput(decisionNode, transaction);
    }

    await DecisionNodeCondition.destroy({
      transaction,
      where: {
        nodeId: {
          [Op.in]: removedDecisionNodeIds,
        },
      },
    });

    await DecisionNode.destroy({
      transaction,
      where: {
        nodeId: {
          [Op.in]: removedDecisionNodeIds,
        },
      },
    });

    await NodeCoordinate.destroy({
      transaction,
      where: {
        nodeId: {
          [Op.in]: removedDecisionNodeIds,
        },
      },
    });

    await Node.destroy({
      transaction,
      where: {
        id: {
          [Op.in]: removedDecisionNodeIds,
        },
      },
    });

    const removedStepElementModels = await StepElement.findAll({
      transaction,
      where: {
        stepId: {
          [Op.in]: removedStepNodeIds,
        },
      },
    });
    const removedStepElementIds = removedStepElementModels.map(
      (stepElement) => stepElement.id,
    );

    await StepElementProperties.destroy({
      transaction,
      where: {
        stepElementId: {
          [Op.in]: removedStepElementIds,
        },
      },
    });

    await StepElementCondition.destroy({
      transaction,
      where: {
        stepElementId: {
          [Op.in]: removedStepElementIds,
        },
      },
    });

    await StepElement.destroy({
      transaction,
      where: {
        stepId: {
          [Op.in]: removedStepNodeIds,
        },
      },
    });

    await NodeCoordinate.destroy({
      transaction,
      where: {
        nodeId: {
          [Op.in]: removedStepNodeIds,
        },
      },
    });

    await Step.destroy({
      transaction,
      where: {
        nodeId: {
          [Op.in]: removedStepNodeIds,
        },
      },
    });

    await Node.destroy({
      transaction,
      where: {
        id: {
          [Op.in]: removedStepNodeIds,
        },
      },
    });
  });

  return this.fetchBuilderPayload();
}
