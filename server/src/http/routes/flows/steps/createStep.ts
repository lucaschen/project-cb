import {
  createStepInput,
  createStepOutput,
} from "@packages/shared/http/schemas/flows/steps/createStep";
import { NodeType } from "@packages/shared/types/enums";
import checkExists from "@packages/shared/utils/checkExists";
import { v4 as uuidv4 } from "uuid";

import FlowEntity from "~entities/FlowEntity";
import NodeEntity from "~entities/NodeEntity";
import StepEntity from "~entities/StepEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const createStepNode = enforceSchema({
  handler: async (req, res) => {
    // TODO: ensure user has permissions to flow
    const { nextNodeId, name } = req.body;

    const flowId = checkExists(req.params.flowId);

    const flow = await FlowEntity.findById(flowId);

    if (!flow) {
      throw new NotFoundError(`Flow id: ${flowId} not found.`);
    }

    const nodeEntity = await NodeEntity.create({
      id: uuidv4(),
      type: NodeType.STEP,
      flowId: flow.dbModel.id,
      name,
    });
    const stepEntity = await StepEntity.create({
      nodeId: nodeEntity.dbModel.id,
      nextNodeId,
    });

    res.status(201).json({
      flowId: nodeEntity.dbModel.flowId,
      name: nodeEntity.dbModel.name,
      nextNodeId: stepEntity.dbModel.nextNodeId,
      nodeId: stepEntity.dbModel.nodeId,
      type: nodeEntity.dbModel.type,
    });
  },
  inputSchema: createStepInput,
  outputSchema: createStepOutput,
});

export default handleRouteError(createStepNode);
