import { z } from "zod";

export const sessionPayload = z.object({
  email: z.string(),
  userId: z.string(),
});

export type SessionPayload = z.infer<typeof sessionPayload>;
