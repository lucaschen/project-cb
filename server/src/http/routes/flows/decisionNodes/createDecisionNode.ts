import {
  createDecisionNodeInput,
  createDecisionNodeOutput,
} from "@packages/shared/http/schemas/flows/decisionNodes/createDecisionNode";
import { NodeType } from "@packages/shared/types/enums";
import checkExists from "@packages/shared/utils/checkExists";
import { v4 as uuidv4 } from "uuid";

import DecisionNodeEntity from "~entities/DecisionNodeEntity";
import FlowEntity from "~entities/FlowEntity";
import NodeEntity from "~entities/NodeEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const createDecisionNode = enforceSchema({
  handler: async (req, res) => {
    const { fallbackNextNodeId, name } = req.body;

    const flowId = checkExists(req.params.flowId);

    const userEntity = await req.context.sessionEntity?.fetchUserEntity();
    const flowEntity = await FlowEntity.findById(flowId);

    if (!userEntity) {
      throw new InvalidCredentialsError("Login required.");
    }
    if (!flowEntity) {
      throw new NotFoundError(`Flow id: ${flowId} not found.`);
    }

    const nodeEntity = await NodeEntity.create({
      id: uuidv4(),
      type: NodeType.DECISION,
      flowId: flowEntity.dbModel.id,
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
