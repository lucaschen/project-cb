import {
  createOrganizationApiKeyInput,
  createOrganizationApiKeyOutput,
  createOrganizationApiKeyParams,
} from "@packages/shared/http/schemas/organizations/createOrganizationApiKey";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const createOrganizationApiKey = enforceSchema({
  handler: async (req, res) => {
    const { organizationId } = req.params;

    const userEntity = await checkExists(req.context.sessionEntity).fetchUserEntity();
    const organizationEntity = await OrganizationEntity.findById(organizationId);

    if (!organizationEntity) {
      throw new NotFoundError(`Organization id: ${organizationId} not found.`);
    }

    const canAdminOrganization = await userEntity.canAdminOrganization(
      organizationId,
    );
    if (!canAdminOrganization) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to create organization API keys.",
      );
    }

    const response = await organizationEntity.createApiKey({
      createdByUserId: userEntity.dbModel.id,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      name: req.body.name,
    });

    res.status(201).json(response);
  },
  inputSchema: createOrganizationApiKeyInput,
  outputSchema: createOrganizationApiKeyOutput,
  paramsSchema: createOrganizationApiKeyParams,
});

export default handleRouteError(createOrganizationApiKey);
