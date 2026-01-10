import { Sequelize } from "sequelize";

const {
  DB_HOST = "localhost",
  DB_PORT = "5432",
  DB_NAME = "project-cb",
  DB_USER = "postgres",
  DB_PASSWORD = "password",
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  define: {
    underscored: false,
    timestamps: true,
  },
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: "postgres",
  logging: false, // set true to see SQL
});
