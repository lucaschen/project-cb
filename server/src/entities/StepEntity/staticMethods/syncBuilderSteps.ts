import type { BuilderStepInputType } from "@packages/shared/http/schemas/flows/builder/common";
import { NodeType } from "@packages/shared/types/enums";
import type { Transaction } from "sequelize";

import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";
import { Step } from "~db/models/Step";

import type StepEntity from "../StepEntity";

export default async function syncBuilderSteps(
  this: typeof StepEntity,
  {
    existingNodeIds,
    flowId,
    steps,
    transaction,
  }: {
    existingNodeIds: Set<string>;
    flowId: string;
    steps: BuilderStepInputType[];
    transaction: Transaction;
  },
): Promise<void> {
  await Promise.all(
    steps.map(async (step, index) => {
      if (existingNodeIds.has(step.nodeId)) {
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
            flowId,
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
    }),
  );
}
