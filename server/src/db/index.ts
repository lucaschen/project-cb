import { initModels } from "./models";
import { sequelize } from "./sequelize";

export const models = initModels(sequelize);

export async function connectDb() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Only auto-sync schema in non-production environments
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
    }
  } catch (err) {
    console.error("❌ Database connection failed", err);
    process.exit(1);
  }
}
