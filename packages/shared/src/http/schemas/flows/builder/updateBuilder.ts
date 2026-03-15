import { z } from "zod";

import { fetchFlowOutput } from "../fetchFlow";
import {
  builderDecisionNodeInputSchema,
  builderStepInputSchema,
} from "./common";

export const updateBuilderParams = z.object({
  flowId: z.string().min(1),
});

export type UpdateBuilderParams = z.infer<typeof updateBuilderParams>;

export const updateBuilderInput = z
  .object({
    decisionNodes: z.array(builderDecisionNodeInputSchema),
    stepNodes: z.array(builderStepInputSchema),
  })
  .strict();

export type UpdateBuilderInput = z.infer<typeof updateBuilderInput>;

export const updateBuilderOutput = fetchFlowOutput;

export type UpdateBuilderOutput = z.infer<typeof updateBuilderOutput>;
