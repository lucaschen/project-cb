import { z } from "zod";

export const createUserInput = z.object({
  email: z.string().min(5),
  password: z.string().min(1),
});

export type CreateUserInput = z.infer<typeof createUserInput>;

export const createUserOutput = z.object({
  email: z.string(),
});

export type CreateUserOutput = z.infer<typeof createUserOutput>;
