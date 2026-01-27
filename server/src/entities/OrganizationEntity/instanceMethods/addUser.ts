import { OrganizationUserPermission } from "@packages/shared/types/enums";

import { OrganizationUser } from "~db/models/OrganizationUser";

import type OrganizationEntity from "../OrganizationEntity";

export default async function addUser(
  this: OrganizationEntity,
  {
    permissions,
    userId,
  }: {
    permissions: OrganizationUserPermission;
    userId: string;
  },
): Promise<{
  organizationId: string;
  permissions: OrganizationUserPermission;
  userId: string;
}> {
  const organizationUserRecord = await OrganizationUser.create({
    organizationId: this.dbModel.id,
    permissions,
    userId,
  });

  return {
    organizationId: organizationUserRecord.organizationId,
    permissions: organizationUserRecord.permissions,
    userId: organizationUserRecord.userId,
  };
}
