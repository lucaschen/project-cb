import { OrganizationUser } from "~db/models/OrganizationUser";
import OrganizationEntity from "~entities/OrganizationEntity";

import type UserEntity from "../UserEntity";

export default async function findOrganizations(this: UserEntity) {
  const organizationUsers = await OrganizationUser.findAll({
    where: {
      userId: this.dbModel.id,
    },
  });

  const organizationEntities = await Promise.all(
    organizationUsers.map(({ organizationId }) =>
      OrganizationEntity.findById(organizationId),
    ),
  );

  return organizationEntities.filter(
    (organizationEntity) => !!organizationEntity,
  );
}
