import { z } from "zod";

import { hydratedStepElementSchema } from "./common";

export const findStepElementsParams = z
  .object({
    flowId: z.string().min(1),
    stepId: z.string().min(1),
  })
  .strict();

export type FindStepElementsParams = z.infer<typeof findStepElementsParams>;

export const findStepElementsOutput = z.array(hydratedStepElementSchema);

export type FindStepElementsOutput = z.infer<typeof findStepElementsOutput>;
