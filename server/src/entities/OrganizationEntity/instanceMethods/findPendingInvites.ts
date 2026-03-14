import type { OrganizationInviteType } from "@packages/shared/http/schemas/organizations/common";
import { Op } from "sequelize";

import { OrganizationUserInvitation } from "~db/models/OrganizationUserInvitation";

import type OrganizationEntity from "../OrganizationEntity";

export default async function findPendingInvites(
  this: OrganizationEntity,
): Promise<OrganizationInviteType[]> {
  const now = new Date();
  const invites = await OrganizationUserInvitation.findAll({
    order: [["expiresAt", "ASC"]],
    where: {
      expiresAt: {
        [Op.gt]: now,
      },
      organizationId: this.dbModel.id,
    },
  });

  return invites.map((invite) => ({
    email: invite.email,
    expiresAt: invite.expiresAt.toISOString(),
    id: invite.id,
    invitedByUserId: invite.invitedByUserId,
    permissions: invite.permissions,
  }));
}
