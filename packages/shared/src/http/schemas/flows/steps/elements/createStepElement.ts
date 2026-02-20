import { z } from "zod";

// Import generated Zod schemas
import { elementSchema } from "~shared/generated/elements";

export const createStepElementInput = elementSchema;

export type CreateStepElementInput = z.infer<typeof createStepElementInput>;

export const createStepElementOutput = z
  .object({
    elementId: z.string(),
    order: z.number(),
  })
  .extend(elementSchema);

export type CreateStepElementOutput = z.infer<typeof createStepElementOutput>;
