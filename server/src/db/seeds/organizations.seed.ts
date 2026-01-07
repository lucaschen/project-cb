import { Models } from "~db/models";

export async function seedOrganizations(models: Models) {
  await models.Organization.bulkCreate([
    {
      id: "seedOrg1",
      name: "Seed Org",
      slug: "seed-org",
      apiKey: "cb_test_key_123",
    },
  ]);

  console.log("🌱 Seeded organizations");
}
