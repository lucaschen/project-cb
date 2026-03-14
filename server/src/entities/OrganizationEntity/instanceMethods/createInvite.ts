import type { OrganizationInviteType } from "@packages/shared/http/schemas/organizations/common";
import type { OrganizationUserPermission } from "@packages/shared/types/enums";
import { randomUUID } from "crypto";
import { Op } from "sequelize";

import { OrganizationUserInvitation } from "~db/models/OrganizationUserInvitation";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type OrganizationEntity from "../OrganizationEntity";

export default async function createInvite(
  this: OrganizationEntity,
  {
    email,
    expiresAt,
    invitedByUserId,
    permissions,
  }: {
    email: string;
    expiresAt: Date;
    invitedByUserId: string;
    permissions: OrganizationUserPermission;
  },
): Promise<OrganizationInviteType> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();

  if (expiresAt <= now) {
    throw new InvalidRequestError(
      "Organization invite expiration must be in the future.",
    );
  }

  const existingInvite = await OrganizationUserInvitation.findOne({
    where: {
      email: normalizedEmail,
      expiresAt: {
        [Op.gt]: now,
      },
      organizationId: this.dbModel.id,
    },
  });

  if (existingInvite) {
    throw new InvalidRequestError(
      "An active invite already exists for this email.",
    );
  }

  const invite = await OrganizationUserInvitation.create({
    email: normalizedEmail,
    expiresAt,
    id: randomUUID(),
    invitedByUserId,
    organizationId: this.dbModel.id,
    permissions,
  });

  return {
    email: invite.email,
    expiresAt: invite.expiresAt.toISOString(),
    id: invite.id,
    invitedByUserId: invite.invitedByUserId,
    permissions: invite.permissions,
  };
}
