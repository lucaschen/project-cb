import { OrganizationUserPermission } from "@packages/shared/types/enums";
import { Op } from "sequelize";

import { OrganizationUser } from "~db/models/OrganizationUser";
import OrganizationEntity from "~entities/OrganizationEntity";

import type UserEntity from "../UserEntity";

export default async function canCreateFlowsInOrganization(
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
      permissions: {
        [Op.in]: [
          OrganizationUserPermission.ADMIN,
          OrganizationUserPermission.EDITOR,
        ],
      },
      userId: this.dbModel.id,
    },
  });

  return !!organizationUserRecord;
}
