import { OrganizationUserPermission } from "@packages/shared/types/enums";

import { OrganizationUser } from "~db/models/OrganizationUser";

import type OrganizationEntity from "../OrganizationEntity";

export default async function countAdmins(
  this: OrganizationEntity,
): Promise<number> {
  return OrganizationUser.count({
    where: {
      organizationId: this.dbModel.id,
      permissions: OrganizationUserPermission.ADMIN,
    },
  });
}
