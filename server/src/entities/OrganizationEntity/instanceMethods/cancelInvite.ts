import { Op } from "sequelize";

import { OrganizationUserInvitation } from "~db/models/OrganizationUserInvitation";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type OrganizationEntity from "../OrganizationEntity";

export default async function cancelInvite(
  this: OrganizationEntity,
  inviteId: string,
): Promise<void> {
  const invite = await OrganizationUserInvitation.findOne({
    where: {
      expiresAt: {
        [Op.gt]: new Date(),
      },
      id: inviteId,
      organizationId: this.dbModel.id,
    },
  });

  if (!invite) {
    throw new NotFoundError(
      `Organization invite id: ${inviteId} not found in organization.`,
    );
  }

  await invite.destroy();
}
