import { z } from "zod";

import { stepPayload } from "./common";

export const createStepInput = z.object({
  name: z.string().min(1),
  nextNodeId: z.string().min(1).or(z.null()),
});

export type createStepInput = z.infer<typeof createStepInput>;

export const createStepOutput = stepPayload;

export type CreateStepOutput = z.infer<typeof createStepOutput>;
