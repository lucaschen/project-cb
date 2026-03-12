import { OrganizationUser } from "~db/models/OrganizationUser";

import type UserEntity from "../UserEntity";

export default async function canReadFlowsInOrganization(
  this: UserEntity,
  organizationId: string,
): Promise<boolean> {
  const organizationUserRecord = await OrganizationUser.findOne({
    where: {
      organizationId,
      userId: this.dbModel.id,
    },
  });

  return !!organizationUserRecord;
}
