import { sequelize } from "./sequelize";
import { initModels } from "./models";

export const models = initModels(sequelize);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // DEV ONLY — remove in prod
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error("❌ Database connection failed", err);
    process.exit(1);
  }
}
