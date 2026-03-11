import { OrganizationUserPermission } from "@packages/shared/types/enums";

import { OrganizationUser } from "~db/models/OrganizationUser";

import type UserEntity from "../UserEntity";

export default async function canCreateFlowsInOrganization(
  this: UserEntity,
  organizationId: string,
): Promise<boolean> {
  const organizationUserRecord = await OrganizationUser.findOne({
    where: {
      organizationId,
      userId: this.dbModel.id,
    },
  });

  if (!organizationUserRecord) {
    return false;
  }

  return [
    OrganizationUserPermission.ADMIN,
    OrganizationUserPermission.EDITOR,
  ].includes(organizationUserRecord.permissions);
}
