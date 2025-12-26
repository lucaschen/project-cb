import { Models } from "@db/models";
import { OrgUserPermission } from "@root/sharedTypes/enums";

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
    permissions: OrgUserPermission.ADMIN,
  });

  console.log("🌱 Seeded users");
}
