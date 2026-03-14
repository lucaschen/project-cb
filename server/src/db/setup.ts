import { sequelize } from "~db/sequelize";

import {
  backfillLegacyOrganizationApiKeys,
  captureLegacyOrganizationApiKeys,
} from "./backfillLegacyOrganizationApiKeys";
import { initModels } from "./models";

export const models = initModels(sequelize);

export default async function setupDb() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const legacyOrganizationApiKeys =
      await captureLegacyOrganizationApiKeys(sequelize);

    // Only auto-sync schema in non-production environments
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
    }

    await backfillLegacyOrganizationApiKeys(legacyOrganizationApiKeys, models);
  } catch (err) {
    console.error("❌ Database connection failed", err);
    process.exit(1);
  }
}
