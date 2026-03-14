import {
  deleteOrganizationOutput,
  deleteOrganizationParams,
} from "@packages/shared/http/schemas/organizations/deleteOrganization";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const deleteOrganization = enforceSchema({
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
        "Insufficient permissions to delete organization.",
      );
    }

    await organizationEntity.softDelete();

    res.status(204).end();
  },
  outputSchema: deleteOrganizationOutput,
  paramsSchema: deleteOrganizationParams,
});

export default handleRouteError(deleteOrganization);
