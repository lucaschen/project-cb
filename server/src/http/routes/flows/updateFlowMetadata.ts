import {
  updateFlowMetadataInput,
  updateFlowMetadataOutput,
  updateFlowMetadataParams,
} from "@packages/shared/http/schemas/flows/updateFlowMetadata";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const updateFlowMetadata = enforceSchema({
  handler: async (req, res) => {
    const { flowId } = req.params;
    const metadata = req.body;

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

    const response = await flowEntity.updateMetadata(metadata);

    res.status(200).json(response);
  },
  inputSchema: updateFlowMetadataInput,
  outputSchema: updateFlowMetadataOutput,
  paramsSchema: updateFlowMetadataParams,
});

export default handleRouteError(updateFlowMetadata);
