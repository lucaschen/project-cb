import { Op, type Transaction } from "sequelize";

import { Node } from "~db/models/Node";
import { NodeCoordinate } from "~db/models/NodeCoordinate";
import { Step } from "~db/models/Step";
import { StepElement } from "~db/models/StepElement";
import { StepElementCondition } from "~db/models/StepElementCondition";
import { StepElementProperties } from "~db/models/StepElementProperties";

import type StepEntity from "../StepEntity";

export default async function destroyByNodeIds(
  this: typeof StepEntity,
  nodeIds: string[],
  transaction: Transaction,
): Promise<void> {
  const removedStepElementModels = await StepElement.findAll({
    transaction,
    where: {
      stepId: {
        [Op.in]: nodeIds,
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
        [Op.in]: nodeIds,
      },
    },
  });

  await NodeCoordinate.destroy({
    transaction,
    where: {
      nodeId: {
        [Op.in]: nodeIds,
      },
    },
  });

  await Step.destroy({
    transaction,
    where: {
      nodeId: {
        [Op.in]: nodeIds,
      },
    },
  });

  await Node.destroy({
    transaction,
    where: {
      id: {
        [Op.in]: nodeIds,
      },
    },
  });
}
