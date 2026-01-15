import bcrypt from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import { OrganizationUserPermission } from "~sharedTypes/enums";

export async function seedUsers(models: Models) {
  const adminPasswordHash = bcrypt.hashSync("password", 10);

  const user = await models.User.create({
    id: uuidV4(),
    email: "admin@project-cb.dev",
    passwordHash: adminPasswordHash,
  });

  const organization = await models.Organization.findOne({
    where: { slug: "seed-org" },
  });

  if (!organization) {
    throw new Error("Organization not found for seeding users");
  }

  await models.OrganizationUser.create({
    organizationId: organization.id,
    userId: user.id,
    permissions: OrganizationUserPermission.ADMIN,
  });

  console.log("🌱 Seeded users");
}
