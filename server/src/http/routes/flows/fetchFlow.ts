import {
  fetchFlowOutput,
  fetchFlowParams,
} from "@packages/shared/http/schemas/flows/fetchFlow";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const fetchFlow = enforceSchema({
  handler: async (req, res) => {
    const { flowId } = req.params;

    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();
    const flowEntity = await FlowEntity.findById(flowId);

    if (!flowEntity) {
      throw new NotFoundError(`Flow id: ${flowId} not found.`);
    }

    const canReadFlow = await userEntity.canReadFlowsInOrganization(
      flowEntity.dbModel.organizationId,
    );
    if (!canReadFlow) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to read this flow.",
      );
    }

    const response = await flowEntity.fetchBuilderPayload();

    res.status(200).json(response);
  },
  outputSchema: fetchFlowOutput,
  paramsSchema: fetchFlowParams,
});

export default handleRouteError(fetchFlow);
