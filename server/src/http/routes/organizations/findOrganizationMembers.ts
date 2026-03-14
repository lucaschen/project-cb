import {
  findOrganizationMembersOutput,
  findOrganizationMembersParams,
} from "@packages/shared/http/schemas/organizations/findOrganizationMembers";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const findOrganizationMembers = enforceSchema({
  handler: async (req, res) => {
    const { organizationId } = req.params;

    const userEntity = await checkExists(req.context.sessionEntity).fetchUserEntity();
    const organizationEntity = await OrganizationEntity.findById(organizationId);

    if (!organizationEntity) {
      throw new NotFoundError(`Organization id: ${organizationId} not found.`);
    }

    const canReadOrganization = await userEntity.canReadOrganization(
      organizationId,
    );
    if (!canReadOrganization) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to view organization members.",
      );
    }

    const response = await organizationEntity.findMembers();

    res.status(200).json(response);
  },
  outputSchema: findOrganizationMembersOutput,
  paramsSchema: findOrganizationMembersParams,
});

export default handleRouteError(findOrganizationMembers);
