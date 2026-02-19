import { InferAttributes } from "sequelize";

import { DecisionNode } from "~db/models/DecisionNode";

import DecisionNodeEntity from "../DecisionNodeEntity";

export default function getPayload(
  this: DecisionNodeEntity,
): InferAttributes<DecisionNode> {
  return {
    nodeId: this.dbModel.nodeId,
    fallbackNextNodeId: this.dbModel.fallbackNextNodeId,
  };
}
