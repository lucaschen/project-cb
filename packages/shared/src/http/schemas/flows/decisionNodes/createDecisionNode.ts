import { z } from "zod";

import { decisionNodePayload } from "./common";

export const createDecisionNodeInput = z.object({
  fallbackNextNodeId: z.string().min(1),
  name: z.string().min(1),
});

export type createDecisionNodeInput = z.infer<typeof createDecisionNodeInput>;

export const createDecisionNodeOutput = decisionNodePayload;

export type CreateDecisionNodeOutput = z.infer<typeof createDecisionNodeOutput>;
