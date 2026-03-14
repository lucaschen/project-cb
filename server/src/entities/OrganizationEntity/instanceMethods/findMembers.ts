import type { OrganizationMemberType } from "@packages/shared/http/schemas/organizations/common";
import checkExists from "@packages/shared/utils/checkExists";

import { OrganizationUser } from "~db/models/OrganizationUser";
import { User } from "~db/models/User";

import type OrganizationEntity from "../OrganizationEntity";

export default async function findMembers(
  this: OrganizationEntity,
): Promise<OrganizationMemberType[]> {
  const organizationUsers = await OrganizationUser.findAll({
    include: [
      {
        as: "user",
        model: User,
      },
    ],
    order: [["userId", "ASC"]],
    where: {
      organizationId: this.dbModel.id,
    },
  });

  return organizationUsers.map((organizationUser) => ({
    email: checkExists(organizationUser.user).email,
    permissions: organizationUser.permissions,
    userId: organizationUser.userId,
  }));
}
