import { sequelize } from "../sequelize";

import { seedOrganizations } from "./organizations.seed";
import { seedUsers } from "./users.seed";
import { seedFlows } from "./flows.seed";

import { initModels } from "../models";

export async function runSeeds() {
  const models = initModels(sequelize);

  try {
    await sequelize.authenticate();
    console.log("🌱 Connected to DB");

    // ⚠️ DEV ONLY
    await sequelize.sync({ force: true });

    await seedOrganizations(models);
    await seedUsers(models);
    await seedFlows(models);

    console.log("✅ Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeeds();
}
