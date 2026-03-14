import {
  createOrganizationInviteInput,
  createOrganizationInviteOutput,
  createOrganizationInviteParams,
} from "@packages/shared/http/schemas/organizations/createOrganizationInvite";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const createOrganizationInvite = enforceSchema({
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
        "Insufficient permissions to create organization invites.",
      );
    }

    const response = await organizationEntity.createInvite({
      email: req.body.email,
      expiresAt: new Date(req.body.expiresAt),
      invitedByUserId: userEntity.dbModel.id,
      permissions: req.body.permissions,
    });

    res.status(201).json(response);
  },
  inputSchema: createOrganizationInviteInput,
  outputSchema: createOrganizationInviteOutput,
  paramsSchema: createOrganizationInviteParams,
});

export default handleRouteError(createOrganizationInvite);
