import { sequelize } from "~db/sequelize";
import setupDb from "~src/db/setup";

export const setupTestDatabase = async () => {
  await setupDb();
};

export const resetTestDatabase = async () => {
  await sequelize.sync({ force: true });
};

export const teardownTestDatabase = async () => {
  await sequelize.close();
};
