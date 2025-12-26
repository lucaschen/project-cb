import { Models } from "@db/models";

export async function seedFlows(models: Models) {
  await models.Flow.create({
    id: "seedFlow1",
    organizationId: "seedOrg1",
    name: "Main Flow",
    slug: "main-flow",
  });

  console.log("🌱 Seeded flows");
}
