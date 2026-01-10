import { z } from "zod";

import { sessionPayload } from "./common";

export const createSessionInput = z.object({
  password: z.string().min(1),
  username: z.string().min(1),
});

export type CreateSessionInput = z.infer<typeof createSessionInput>;

export const createSessionOutput = sessionPayload;

export type CreateSessionOutput = z.infer<typeof createSessionOutput>;
