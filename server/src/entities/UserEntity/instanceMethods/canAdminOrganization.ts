import { OrganizationUserPermission } from "@packages/shared/types/enums";

import { OrganizationUser } from "~db/models/OrganizationUser";
import OrganizationEntity from "~entities/OrganizationEntity";

import type UserEntity from "../UserEntity";

export default async function canAdminOrganization(
  this: UserEntity,
  organizationId: string,
): Promise<boolean> {
  const organization = await OrganizationEntity.findById(organizationId);

  if (!organization) {
    return false;
  }

  const organizationUserRecord = await OrganizationUser.findOne({
    where: {
      organizationId,
      permissions: OrganizationUserPermission.ADMIN,
      userId: this.dbModel.id,
    },
  });

  return !!organizationUserRecord;
}
