import { z } from "zod";

export const createStepElementInput = z.object({
  elementId: z.string(),
  name: z.string(),
  order: z.number(),
});

export const createStepElementOutput = z.object({
  elementId: z.string(),
  id: z.string(),
  name: z.string(),
  order: z.number(),
  stepId: z.string(),
});
