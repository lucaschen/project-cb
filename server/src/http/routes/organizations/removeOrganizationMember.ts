import {
  removeOrganizationMemberOutput,
  removeOrganizationMemberParams,
} from "@packages/shared/http/schemas/organizations/removeOrganizationMember";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const removeOrganizationMember = enforceSchema({
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
        "Insufficient permissions to remove organization members.",
      );
    }

    await organizationEntity.removeMember(userId);

    res.status(204).end();
  },
  outputSchema: removeOrganizationMemberOutput,
  paramsSchema: removeOrganizationMemberParams,
});

export default handleRouteError(removeOrganizationMember);
