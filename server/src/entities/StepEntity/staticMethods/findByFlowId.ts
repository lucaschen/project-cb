import { NodeType } from "@packages/shared/types/enums";
import { Op, type Transaction } from "sequelize";

import { Node } from "~db/models/Node";
import { Step } from "~db/models/Step";

import type StepEntity from "../StepEntity";

export default async function findByFlowId(
  this: typeof StepEntity,
  flowId: string,
  transaction?: Transaction,
): Promise<StepEntity[]> {
  const stepNodes = await Node.findAll({
    transaction,
    where: {
      flowId,
      type: NodeType.STEP,
    },
  });

  const stepModels = await Step.findAll({
    transaction,
    where: {
      nodeId: {
        [Op.in]: stepNodes.map((stepNode) => stepNode.id),
      },
    },
  });

  return stepModels.map((stepModel) => new this(stepModel));
}
