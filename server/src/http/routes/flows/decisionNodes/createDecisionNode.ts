import {
  createDecisionNodeInput,
  createDecisionNodeOutput,
} from "@packages/shared/http/schemas/flows/decisionNodes/createDecisionNode";
import { NodeType } from "@packages/shared/types/enums";
import checkExists from "@packages/shared/utils/checkExists";
import { v4 as uuidv4 } from "uuid";

import DecisionNodeEntity from "~entities/DecisionNodeEntity";
import NodeEntity from "~entities/NodeEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";

const createDecisionNode = enforceSchema({
  handler: async (req, res) => {
    const { fallbackNextNodeId, name } = req.body;

    const flowId = checkExists(req.params.flowId);
    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();
    const canEditFlow = await userEntity.canEditFlow(flowId);

    if (!canEditFlow) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to create flow in this organization.",
      );
    }

    const nodeEntity = await NodeEntity.create({
      id: uuidv4(),
      type: NodeType.DECISION,
      flowId,
      name,
    });

    const decisionNodeEntity = await DecisionNodeEntity.create({
      nodeId: nodeEntity.dbModel.id,
      fallbackNextNodeId,
    });

    res.status(201).json({
      fallbackNextNodeId: decisionNodeEntity.dbModel.fallbackNextNodeId,
      flowId: nodeEntity.dbModel.flowId,
      name: nodeEntity.dbModel.name,
      nodeId: decisionNodeEntity.dbModel.nodeId,
      type: nodeEntity.dbModel.type,
    });
  },
  inputSchema: createDecisionNodeInput,
  outputSchema: createDecisionNodeOutput,
});

export default handleRouteError(createDecisionNode);
