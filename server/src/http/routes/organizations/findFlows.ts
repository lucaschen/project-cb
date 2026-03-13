import {
  findFlowsOutput,
  findFlowsParams,
} from "@packages/shared/http/schemas/flows/findFlows";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";

const findFlows = enforceSchema({
  handler: async (req, res) => {
    const { organizationId } = req.params;

    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();

    const canReadFlows =
      await userEntity.canReadFlowsInOrganization(organizationId);
    if (!canReadFlows) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to read flows in this organization.",
      );
    }

    const flowEntities = await FlowEntity.findByOrganizationId(organizationId);
    const response = flowEntities.map((flowEntity) => flowEntity.getPayload());

    res.status(200).json(response);
  },
  outputSchema: findFlowsOutput,
  paramsSchema: findFlowsParams,
});

export default handleRouteError(findFlows);
