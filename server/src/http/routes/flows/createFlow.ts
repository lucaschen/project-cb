import {
  createFlowInput,
  createFlowOutput,
} from "@packages/shared/http/schemas/flows/createFlow";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const createFlow = enforceSchema({
  handler: async (req, res) => {
    const { name, organizationId, slug } = req.body;

    const userEntity = await checkExists(req.context.sessionEntity).fetchUserEntity();

    const organizationEntity = await OrganizationEntity.findById(organizationId);
    if (!organizationEntity) {
      throw new NotFoundError(`Organization id: ${organizationId} not found.`);
    }

    const canCreateFlow = await userEntity.canCreateFlowsInOrganization(
      organizationId,
    );
    if (!canCreateFlow) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to create flow in this organization.",
      );
    }

    // Question: do flows require an organizationId? can a user directly own a flow?
    const flowEntity = await FlowEntity.create({
      name,
      organizationId,
      slug,
    });

    res.status(201).json({
      id: flowEntity.dbModel.id,
      name: flowEntity.dbModel.name,
      organizationId: flowEntity.dbModel.organizationId,
      slug: flowEntity.dbModel.slug,
    });
  },
  inputSchema: createFlowInput,
  outputSchema: createFlowOutput,
});

export default handleRouteError(createFlow);
