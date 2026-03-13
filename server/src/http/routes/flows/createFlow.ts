import {
  createFlowInput,
  createFlowOutput,
} from "@packages/shared/http/schemas/flows/createFlow";
import checkExists from "@packages/shared/utils/checkExists";
import { UniqueConstraintError } from "sequelize";

import FlowEntity from "~entities/FlowEntity";
import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const createFlow = enforceSchema({
  handler: async (req, res) => {
    const { description, name, organizationId, slug } = req.body;

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
    let flowEntity;
    try {
      flowEntity = await FlowEntity.create({
        description: description ?? null,
        name,
        organizationId,
        slug,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new InvalidRequestError("Flow already exists.");
      }

      throw error;
    }

    res.status(201).json(flowEntity.getPayload());
  },
  inputSchema: createFlowInput,
  outputSchema: createFlowOutput,
});

export default handleRouteError(createFlow);
