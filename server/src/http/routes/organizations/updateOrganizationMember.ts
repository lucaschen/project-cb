import {
  updateOrganizationMemberInput,
  updateOrganizationMemberOutput,
  updateOrganizationMemberParams,
} from "@packages/shared/http/schemas/organizations/updateOrganizationMember";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const updateOrganizationMember = enforceSchema({
  handler: async (req, res) => {
    const { organizationId, userId } = req.params;

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
        "Insufficient permissions to update organization members.",
      );
    }

    const response = await organizationEntity.updateMemberPermissions({
      permissions: req.body.permissions,
      userId,
    });

    res.status(200).json(response);
  },
  inputSchema: updateOrganizationMemberInput,
  outputSchema: updateOrganizationMemberOutput,
  paramsSchema: updateOrganizationMemberParams,
});

export default handleRouteError(updateOrganizationMember);
