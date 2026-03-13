import {
  updateBuilderInput,
  updateBuilderOutput,
  updateBuilderParams,
} from "@packages/shared/http/schemas/flows/builder/updateBuilder";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const updateBuilder = enforceSchema({
  handler: async (req, res) => {
    const { flowId } = req.params;
    const payload = req.body;

    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();
    const flowEntity = await FlowEntity.findById(flowId);

    if (!flowEntity) {
      throw new NotFoundError(`Flow id: ${flowId} not found.`);
    }

    const canEditFlow = await userEntity.canEditFlow(flowId);
    if (!canEditFlow) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to edit this flow.",
      );
    }

    const response = await flowEntity.updateBuilder(payload);

    res.status(200).json(response);
  },
  inputSchema: updateBuilderInput,
  outputSchema: updateBuilderOutput,
  paramsSchema: updateBuilderParams,
});

export default handleRouteError(updateBuilder);
