import { z } from "zod";

import { flowSchema } from "./common";

export const findFlowsParams = z.object({
  organizationId: z.string().min(1),
});

export type FindFlowsParams = z.infer<typeof findFlowsParams>;

export const findFlowsOutput = z.array(flowSchema);

export type FindFlowsOutput = z.infer<typeof findFlowsOutput>;
