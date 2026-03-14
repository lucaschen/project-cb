import {
  fetchOrganizationOutput,
  fetchOrganizationParams,
} from "@packages/shared/http/schemas/organizations/fetchOrganization";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const fetchOrganization = enforceSchema({
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
        "Insufficient permissions to view organization settings.",
      );
    }

    res.status(200).json(organizationEntity.getAdminDetail());
  },
  outputSchema: fetchOrganizationOutput,
  paramsSchema: fetchOrganizationParams,
});

export default handleRouteError(fetchOrganization);
