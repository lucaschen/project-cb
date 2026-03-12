import { z } from "zod";

import { flowBuilderSchema } from "./common";

export const fetchFlowParams = z.object({
  flowId: z.string().min(1),
});

export type FetchFlowParams = z.infer<typeof fetchFlowParams>;

export const fetchFlowOutput = flowBuilderSchema;

export type FetchFlowOutput = z.infer<typeof fetchFlowOutput>;
