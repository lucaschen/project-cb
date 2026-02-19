import { OrganizationUserPermission } from "@packages/shared/types/enums";

import { OrganizationUser } from "~db/models/OrganizationUser";

import type OrganizationEntity from "../OrganizationEntity";

export default async function canUserCreateFlow(
  this: OrganizationEntity,
  {
    userId,
  }: {
    userId: string;
  },
): Promise<boolean> {
  const organizationUserRecord = await OrganizationUser.findOne({
    where: {
      organizationId: this.dbModel.id,
      userId,
    },
  });

  if (!organizationUserRecord) {
    return false;
  }

  const permissions = organizationUserRecord.permissions;
  const canCreateFlow = [
    OrganizationUserPermission.ADMIN,
    OrganizationUserPermission.EDITOR,
  ].includes(permissions);

  return canCreateFlow;
}
