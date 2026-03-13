import { z } from "zod";

import { stepSummarySchema } from "./common";

export const findStepsParams = z.object({
  flowId: z.string().min(1),
});

export type FindStepsParams = z.infer<typeof findStepsParams>;

export const findStepsOutput = z.array(stepSummarySchema);

export type FindStepsOutput = z.infer<typeof findStepsOutput>;
