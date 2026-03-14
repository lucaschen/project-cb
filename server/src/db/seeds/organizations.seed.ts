import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";

export async function seedOrganizations(models: Models) {
  const organization = await models.Organization.create({
    id: uuidV4(),
    name: "Seed Org",
    slug: "seed-org",
  });

  console.log("🌱 Seeded organizations");

  return organization;
}
