import { Models } from "@db/models";
import { OrgUserPermission } from "@db/models/enums";

export async function seedUsers(models: Models) {
  await models.User.bulkCreate([
    {
      id: "seedUser1",
      email: "admin@project-cb.dev",
    },
  ]);

  await models.OrganizationUser.create({
    organization_id: "seedOrg1",
    user_id: "seedUser1",
    permissions: OrgUserPermission.ADMIN,
  });

  console.log("🌱 Seeded users");
}
