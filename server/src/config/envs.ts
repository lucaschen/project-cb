import "dotenv/config";

import * as z from "zod";

const envSchema = z.object({
  CORS_ALLOWED_ORIGINS: z.string().transform((str) => str.split(",")),
  DEBUGGING: z.coerce.boolean(),
  JWT_SECRET: z.string(),
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.coerce.number(),
  PORT: z.coerce.number(),
});

let parsedEnvs;
try {
  parsedEnvs = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof Error) {
    throw new Error("Error parsing envs: " + error.message);
  }

  throw new Error("Error parsing envs");
}

export const envs = parsedEnvs;
