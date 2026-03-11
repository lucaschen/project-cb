import { z } from "zod";

// Import generated Zod schemas
import {
  elementSchema,
  elementWithOptionalPropertiesSchema,
} from "~shared/generated/elements";

export const createStepElementInput = elementWithOptionalPropertiesSchema.and(
  z.object({
    order: z.number().optional(),
  }),
);

export type CreateStepElementInput = z.infer<typeof createStepElementInput>;

export const createStepElementOutput = elementSchema.and(
  z.object({
    id: z.string(),
    order: z.number(),
  }),
);

export type CreateStepElementOutput = z.infer<typeof createStepElementOutput>;
