import type { FindStepsOutput } from "@packages/shared/http/schemas/flows/steps/findSteps";
import { NodeType } from "@packages/shared/types/enums";
import { Op, type Transaction } from "sequelize";

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
    where: {
      flowId: this.dbModel.id,
      type: NodeType.STEP,
    },
  });

  const stepNodeIds = nodeModels.map((node) => node.id);

  const [stepModels, coordinateModels] = await Promise.all([
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
  ]);

  const stepsByNodeId = new Map(stepModels.map((step) => [step.nodeId, step]));
  const coordinatesByNodeId = new Map(
    coordinateModels.map((coordinate) => [coordinate.nodeId, coordinate]),
  );

  return nodeModels
    .map((node) => {
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
        order: step.order,
        type: node.type,
      };
    })
    .sort(
      (left, right) => left.order - right.order || left.nodeId.localeCompare(right.nodeId),
    );
}
