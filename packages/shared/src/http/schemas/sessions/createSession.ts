import { z } from "zod";

import { sessionPayload } from "./common";

export const createSessionInput = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export type CreateSessionInput = z.infer<typeof createSessionInput>;

export const createSessionOutput = sessionPayload;

export type CreateSessionOutput = z.infer<typeof createSessionOutput>;
