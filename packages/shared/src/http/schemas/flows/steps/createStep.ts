import { z } from "zod";

import { stepCoordinatesSchema, stepSummarySchema } from "./common";

export const createStepInput = z.object({
  coordinates: stepCoordinatesSchema.optional(),
  name: z.string().min(1),
  nextNodeId: z.string().min(1).or(z.null()),
});

export type CreateStepInput = z.infer<typeof createStepInput>;

export const createStepOutput = stepSummarySchema;

export type CreateStepOutput = z.infer<typeof createStepOutput>;
