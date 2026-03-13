import { Sequelize } from "sequelize";
import { vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.CORS_ALLOWED_ORIGINS ??= "http://localhost:3000";
process.env.DEBUGGING ??= "false";
process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.DB_NAME ??= "project-cb-test";
process.env.DB_HOST ??= "localhost";
process.env.DB_USER ??= "postgres";
process.env.DB_PASSWORD ??= "password";
process.env.DB_PORT ??= "5432";
process.env.PORT ??= "4100";

const testSequelize = new Sequelize({
  define: {
    underscored: false,
    timestamps: true,
  },
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});

vi.mock("~db/sequelize", () => ({
  sequelize: testSequelize,
}));
