import type { OrganizationMemberType } from "@packages/shared/http/schemas/organizations/common";
import { OrganizationUserPermission } from "@packages/shared/types/enums";
import checkExists from "@packages/shared/utils/checkExists";

import { OrganizationUser } from "~db/models/OrganizationUser";
import { User } from "~db/models/User";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type OrganizationEntity from "../OrganizationEntity";

export default async function updateMemberPermissions(
  this: OrganizationEntity,
  {
    permissions,
    userId,
  }: {
    permissions: OrganizationUserPermission;
    userId: string;
  },
): Promise<OrganizationMemberType> {
  const organizationUser = await OrganizationUser.findOne({
    include: [
      {
        as: "user",
        model: User,
      },
    ],
    where: {
      organizationId: this.dbModel.id,
      userId,
    },
  });

  if (!organizationUser) {
    throw new NotFoundError(
      `Organization member user id: ${userId} not found in organization.`,
    );
  }

  const isDemotingAdmin =
    organizationUser.permissions === OrganizationUserPermission.ADMIN &&
    permissions !== OrganizationUserPermission.ADMIN;

  if (isDemotingAdmin && (await this.countAdmins()) <= 1) {
    throw new InvalidRequestError(
      "Organization must retain at least one admin.",
    );
  }

  organizationUser.permissions = permissions;
  await organizationUser.save();

  return {
    email: checkExists(organizationUser.user).email,
    permissions: organizationUser.permissions,
    userId: organizationUser.userId,
  };
}
