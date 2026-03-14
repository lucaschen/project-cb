import type { FindStepsOutput } from "@packages/shared/http/schemas/flows/steps/findSteps";
import { NodeType } from "@packages/shared/types/enums";
import { getOrderedStepNodeIds } from "@packages/shared/utils/flows/getOrderedStepNodeIds";
import { Op, type Transaction } from "sequelize";

import { DecisionNode } from "~db/models/DecisionNode";
import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";
import { Step } from "~db/models/Step";
import UnexpectedError from "~src/utils/errors/UnexpectedError";

import type FlowEntity from "../FlowEntity";

export default async function findStepSummaries(
  this: FlowEntity,
  transaction?: Transaction,
): Promise<FindStepsOutput> {
  const nodeModels = await Node.findAll({
    order: [["id", "ASC"]],
    transaction,
    where: { flowId: this.dbModel.id },
  });

  const stepNodeIds = nodeModels
    .filter((node) => node.type === NodeType.STEP)
    .map((node) => node.id);
  const decisionNodeIds = nodeModels
    .filter((node) => node.type === NodeType.DECISION)
    .map((node) => node.id);

  const [stepModels, coordinateModels, decisionNodeModels, decisionConditionModels] =
    await Promise.all([
    Step.findAll({
      transaction,
      where: {
        nodeId: { [Op.in]: stepNodeIds },
      },
    }),
    NodeCoordinate.findAll({
      transaction,
      where: {
        nodeId: { [Op.in]: stepNodeIds },
      },
    }),
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

  const stepsByNodeId = new Map(stepModels.map((step) => [step.nodeId, step]));
  const coordinatesByNodeId = new Map(
    coordinateModels.map((coordinate) => [coordinate.nodeId, coordinate]),
  );

  const decisionConditionsByNodeId = new Map<string, DecisionNodeCondition[]>();
  for (const condition of decisionConditionModels) {
    const existingConditions =
      decisionConditionsByNodeId.get(condition.nodeId) ?? [];
    existingConditions.push(condition);
    decisionConditionsByNodeId.set(condition.nodeId, existingConditions);
  }

  const orderedStepNodeIds = getOrderedStepNodeIds([
    ...nodeModels
      .filter((node) => node.type === NodeType.STEP)
      .map((node) => {
        const step = stepsByNodeId.get(node.id);

        if (!step) {
          throw new UnexpectedError(`Step node id: ${node.id} has no step record.`);
        }

        return {
          nextNodeId: step.nextNodeId,
          nodeId: node.id,
          type: NodeType.STEP as const,
        };
      }),
    ...decisionNodeModels.map((decisionNode) => ({
      conditions: (decisionConditionsByNodeId.get(decisionNode.nodeId) ?? []).map(
        (condition) => ({
          id: condition.id,
          order: condition.order,
          toNodeId: condition.toNodeId,
        }),
      ),
      fallbackNextNodeId: decisionNode.fallbackNextNodeId,
      nodeId: decisionNode.nodeId,
      type: NodeType.DECISION as const,
    })),
  ]);

  const stepSummaries = nodeModels
    .map((node) => {
      if (node.type !== NodeType.STEP) {
        return null;
      }

      const step = stepsByNodeId.get(node.id);

      if (!step) {
        throw new UnexpectedError(`Step node id: ${node.id} has no step record.`);
      }

      const coordinates = coordinatesByNodeId.get(node.id);

      if (!coordinates) {
        throw new UnexpectedError(
          `Step node id: ${node.id} has no coordinate record.`,
        );
      }

      return {
        coordinates: {
          x: coordinates.x,
          y: coordinates.y,
        },
        flowId: node.flowId,
        name: node.name,
        nextNodeId: step.nextNodeId,
        nodeId: node.id,
        type: node.type,
      };
    })
    .filter((stepSummary): stepSummary is FindStepsOutput[number] => stepSummary !== null);

  const stepSummariesByNodeId = new Map(
    stepSummaries.map((stepSummary) => [stepSummary.nodeId, stepSummary]),
  );

  return orderedStepNodeIds
    .map((nodeId) => stepSummariesByNodeId.get(nodeId))
    .filter((stepSummary): stepSummary is FindStepsOutput[number] => stepSummary !== undefined);
}
