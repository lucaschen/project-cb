import {
  createStepInput,
  createStepOutput,
} from "@packages/shared/http/schemas/flows/steps/createStep";
import { NodeType } from "@packages/shared/types/enums";
import checkExists from "@packages/shared/utils/checkExists";
import { v4 as uuidv4 } from "uuid";

import NodeEntity from "~entities/NodeEntity";
import StepEntity from "~entities/StepEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";

const createStepNode = enforceSchema({
  handler: async (req, res) => {
    // TODO: ensure user has permissions to flow
    const { nextNodeId, name } = req.body;

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
      type: NodeType.STEP,
      flowId,
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
