import { OrganizationUserPermission } from "@packages/shared/types/enums";

import { OrganizationUser } from "~db/models/OrganizationUser";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type OrganizationEntity from "../OrganizationEntity";

export default async function removeMember(
  this: OrganizationEntity,
  userId: string,
): Promise<void> {
  const organizationUser = await OrganizationUser.findOne({
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

  if (
    organizationUser.permissions === OrganizationUserPermission.ADMIN &&
    (await this.countAdmins()) <= 1
  ) {
    throw new InvalidRequestError(
      "Organization must retain at least one admin.",
    );
  }

  await organizationUser.destroy();
}
