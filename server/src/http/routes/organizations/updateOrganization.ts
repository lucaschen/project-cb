import {
  updateOrganizationInput,
  updateOrganizationOutput,
  updateOrganizationParams,
} from "@packages/shared/http/schemas/organizations/updateOrganization";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const updateOrganization = enforceSchema({
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
        "Insufficient permissions to update organization settings.",
      );
    }

    const response = await organizationEntity.updateSettings(req.body);

    res.status(200).json(response);
  },
  inputSchema: updateOrganizationInput,
  outputSchema: updateOrganizationOutput,
  paramsSchema: updateOrganizationParams,
});

export default handleRouteError(updateOrganization);
