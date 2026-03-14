import { OrganizationUser } from "~db/models/OrganizationUser";
import OrganizationEntity from "~entities/OrganizationEntity";

import type UserEntity from "../UserEntity";

export default async function canReadOrganization(
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
      userId: this.dbModel.id,
    },
  });

  return !!organizationUserRecord;
}
