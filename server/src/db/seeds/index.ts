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

    const env = process.env.NODE_ENV;
    if (env === "development" || env === "test") {
      console.log("⚠️ Running destructive sync with force: true (env:", env || "undefined", ")");
      await sequelize.sync({ force: true });
    } else {
      console.log(
        "⚠️ Skipping destructive sync; running non-destructive sequelize.sync() because NODE_ENV is",
        env || "undefined"
      );
      await sequelize.sync();
    }

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
