import { Models } from "@db/models";

import { seedSteps } from "./steps.seed";

export async function seedFlows(models: Models) {
  // ───────────────────
  // Flow
  // ───────────────────
  await models.Flow.create({
    id: "seedFlow1",
    organizationId: "seedOrg1",
    name: "Main Flow",
    slug: "main-flow",
  });

  await seedSteps(models);

  console.log("🌱 Seeded purchase price step");
}
