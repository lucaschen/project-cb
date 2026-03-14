import {
  revokeOrganizationApiKeyOutput,
  revokeOrganizationApiKeyParams,
} from "@packages/shared/http/schemas/organizations/revokeOrganizationApiKey";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const revokeOrganizationApiKey = enforceSchema({
  handler: async (req, res) => {
    const { apiKeyId, organizationId } = req.params;

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
        "Insufficient permissions to revoke organization API keys.",
      );
    }

    await organizationEntity.revokeApiKey({
      apiKeyId,
      revokedByUserId: userEntity.dbModel.id,
    });

    res.status(204).end();
  },
  outputSchema: revokeOrganizationApiKeyOutput,
  paramsSchema: revokeOrganizationApiKeyParams,
});

export default handleRouteError(revokeOrganizationApiKey);
