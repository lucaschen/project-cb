import type { FetchFlowOutput } from "@packages/shared/http/schemas/flows/fetchFlow";
import { NodeType } from "@packages/shared/types/enums";
import { Op } from "sequelize";

import { DecisionNode } from "~db/models/DecisionNode";
import { DecisionNodeCondition } from "~db/models/DecisionNodeCondition";
import { ElementProperties } from "~db/models/ElementProperties";
import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";
import { StepElement } from "~db/models/StepElement";
import { StepElementProperties } from "~db/models/StepElementProperties";
import getHydratedStepElements from "~entities/StepEntity/instanceMethods/getHydratedStepElements";
import UnexpectedError from "~src/utils/errors/UnexpectedError";

import type FlowEntity from "../FlowEntity";

export default async function fetchBuilderPayload(
  this: FlowEntity,
): Promise<FetchFlowOutput> {
  const [nodeModels, stepSummaries] = await Promise.all([
    Node.findAll({
      order: [
        ["name", "ASC"],
        ["id", "ASC"],
      ],
      where: { flowId: this.dbModel.id },
    }),
    this.findStepSummaries(),
  ]);

  const stepSummariesByNodeId = new Map(
    stepSummaries.map((stepSummary) => [stepSummary.nodeId, stepSummary]),
  );
  const stepNodeIds = stepSummaries.map((stepSummary) => stepSummary.nodeId);
  const decisionNodeIds = nodeModels
    .filter((node) => node.type === NodeType.DECISION)
    .map((node) => node.id);

  const [coordinateModels, decisionNodeModels] = await Promise.all([
    NodeCoordinate.findAll({
      where: {
        nodeId: { [Op.in]: decisionNodeIds },
      },
    }),
    DecisionNode.findAll({
      where: {
        nodeId: { [Op.in]: decisionNodeIds },
      },
    }),
  ]);

  const [stepElementModels, decisionConditionModels] = await Promise.all([
    StepElement.findAll({
      where: {
        stepId: { [Op.in]: stepNodeIds },
      },
    }),
    DecisionNodeCondition.findAll({
      where: {
        nodeId: { [Op.in]: decisionNodeIds },
      },
    }),
  ]);

  const stepElementIds = stepElementModels.map((stepElement) => stepElement.id);

  const hydratedStepElementPropertyModels = await StepElementProperties.findAll(
    {
      where: {
        stepElementId: { [Op.in]: stepElementIds },
      },
    },
  );

  const propertyIds = Array.from(
    new Set(
      hydratedStepElementPropertyModels.map(
        (stepElementProperty) => stepElementProperty.propertyId,
      ),
    ),
  );

  const elementPropertyModels = await ElementProperties.findAll({
    where: {
      id: { [Op.in]: propertyIds },
    },
  });

  const decisionCoordinatesByNodeId = new Map(
    coordinateModels.map((coordinate) => [coordinate.nodeId, coordinate]),
  );
  const decisionNodesByNodeId = new Map(
    decisionNodeModels.map((decisionNode) => [
      decisionNode.nodeId,
      decisionNode,
    ]),
  );
  const stepElementsByStepId = new Map<string, StepElement[]>();
  for (const stepElement of stepElementModels) {
    const existing = stepElementsByStepId.get(stepElement.stepId) ?? [];
    existing.push(stepElement);
    stepElementsByStepId.set(stepElement.stepId, existing);
  }

  const decisionConditionsByNodeId = new Map<string, DecisionNodeCondition[]>();
  for (const condition of decisionConditionModels) {
    const existing = decisionConditionsByNodeId.get(condition.nodeId) ?? [];
    existing.push(condition);
    decisionConditionsByNodeId.set(condition.nodeId, existing);
  }

  return {
    flow: {
      ...this.getPayload(),
      nodes: nodeModels.map((node) => {
        if (node.type === NodeType.STEP) {
          const stepSummary = stepSummariesByNodeId.get(node.id);

          if (!stepSummary) {
            throw new UnexpectedError(
              `Step node id: ${node.id} has no hydrated step summary.`,
            );
          }

          const elements = (
            stepElementsByStepId.get(stepSummary.nodeId) ?? []
          ).sort(
            (left, right) =>
              left.order - right.order || left.id.localeCompare(right.id),
          );
          const elementIds = elements.map((element) => element.id);
          const hydratedElements = getHydratedStepElements({
            elementPropertyModels,
            stepElementModels: elements,
            stepElementPropertyModels: hydratedStepElementPropertyModels.filter(
              (stepElementProperty) =>
                elementIds.includes(stepElementProperty.stepElementId),
            ),
          });

          return {
            coordinates: stepSummary.coordinates,
            elements: hydratedElements,
            name: stepSummary.name,
            nextNodeId: stepSummary.nextNodeId,
            nodeId: stepSummary.nodeId,
            order: stepSummary.order,
            type: node.type,
          };
        }

        const coordinates = decisionCoordinatesByNodeId.get(node.id);
        const nodeCoordinates = coordinates
          ? {
              x: coordinates.x,
              y: coordinates.y,
            }
          : null;

        const decisionNode = decisionNodesByNodeId.get(node.id);

        if (!decisionNode) {
          throw new UnexpectedError(
            `Decision node id: ${node.id} has no decision record.`,
          );
        }

        const conditions = (decisionConditionsByNodeId.get(node.id) ?? [])
          .sort(
            (left, right) =>
              left.order - right.order || left.id.localeCompare(right.id),
          )
          .map((condition) => ({
            id: condition.id,
            order: condition.order,
            statement: condition.statement,
            toNodeId: condition.toNodeId,
          }));

        return {
          conditions,
          coordinates: nodeCoordinates,
          fallbackNextNodeId: decisionNode.fallbackNextNodeId,
          name: node.name,
          nodeId: node.id,
          type: node.type,
        };
      }),
    },
  };
}
