import { z } from "zod";

import { decisionNodeSchema } from "./common";

export const createDecisionNodeInput = z.object({
  fallbackNextNodeId: z.string().min(1),
  name: z.string().min(1),
});

export type CreateDecisionNodeInput = z.infer<typeof createDecisionNodeInput>;

export const createDecisionNodeOutput = decisionNodeSchema;

export type CreateDecisionNodeOutput = z.infer<typeof createDecisionNodeOutput>;
