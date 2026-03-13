import { z } from "zod";

import { hydratedStepElementSchema, stepElementSchema } from "./common";

export const updateStepElementsParams = z
  .object({
    flowId: z.string().min(1),
    stepId: z.string().min(1),
  })
  .strict();

export type UpdateStepElementsParams = z.infer<typeof updateStepElementsParams>;

export const updateStepElementsInput = z
  .object({
    elements: z.array(stepElementSchema),
  })
  .strict();

export type UpdateStepElementsInput = z.infer<typeof updateStepElementsInput>;

export const updateStepElementsOutput = z.array(hydratedStepElementSchema);

export type UpdateStepElementsOutput = z.infer<typeof updateStepElementsOutput>;
