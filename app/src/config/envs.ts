import * as z from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string(),
});

let parsedEnvs;

try {
  parsedEnvs = envSchema.parse(import.meta.env);
} catch (error) {
  if (error instanceof Error) {
    throw new Error("Error parsing envs: " + error.message);
  }

  throw new Error("Error parsing envs");
}

export const envs = parsedEnvs;
