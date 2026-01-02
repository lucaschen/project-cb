import { Models } from "@db/models";
import { OrganizationUserPermission } from "@sharedTypes/enums";

export async function seedUsers(models: Models) {
  await models.User.bulkCreate([
    {
      id: "seedUser1",
      email: "admin@project-cb.dev",
    },
  ]);

  await models.OrganizationUser.create({
    organizationId: "seedOrg1",
    userId: "seedUser1",
    permissions: OrganizationUserPermission.ADMIN,
  });

  console.log("🌱 Seeded users");
}
