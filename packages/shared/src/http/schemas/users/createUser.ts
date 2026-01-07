import { z } from "zod";

export const createUserInput = z.object({
  password: z.string().min(1),
  username: z.string().min(5),
});

export type CreateUserInput = z.infer<typeof createUserInput>;

export const createUserOutput = z.object({
  username: z.string(),
});

export type CreateUserOutput = z.infer<typeof createUserOutput>;
