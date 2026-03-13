import { z } from "zod";

import { flowPayload } from "./common";

export const createFlowInput = z.object({
  description: z.string().nullable().optional(),
  name: z.string().min(1),
  organizationId: z.string().min(1),
  slug: z.string().min(1),
});

export type createFlowInput = z.infer<typeof createFlowInput>;

export const createFlowOutput = flowPayload;

export type CreateFlowOutput = z.infer<typeof createFlowOutput>;
