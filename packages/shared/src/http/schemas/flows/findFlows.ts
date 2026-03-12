import { z } from "zod";

import { flowPayload } from "./common";

export const findFlowsParams = z.object({
  organizationId: z.string().min(1),
});

export type FindFlowsParams = z.infer<typeof findFlowsParams>;

export const findFlowsOutput = z.array(flowPayload);

export type FindFlowsOutput = z.infer<typeof findFlowsOutput>;
