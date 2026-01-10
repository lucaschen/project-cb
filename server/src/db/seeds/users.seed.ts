import bcrypt from "bcryptjs";

import { Models } from "~db/models";
import { OrganizationUserPermission } from "~sharedTypes/enums";

export async function seedUsers(models: Models) {
  const adminPasswordHash = bcrypt.hashSync("password", 10);

  await models.User.bulkCreate([
    {
      id: "seedUser1",
      email: "admin@project-cb.dev",
      passwordHash: adminPasswordHash,
    },
  ]);

  await models.OrganizationUser.create({
    organizationId: "seedOrg1",
    userId: "seedUser1",
    permissions: OrganizationUserPermission.ADMIN,
  });

  console.log("🌱 Seeded users");
}
