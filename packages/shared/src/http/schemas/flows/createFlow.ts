import { z } from "zod";

import { flowSchema } from "./common";

export const createFlowInput = z.object({
  description: z.string().nullable().optional(),
  name: z.string().min(1),
  organizationId: z.string().min(1),
  slug: z.string().min(1),
});

export type CreateFlowInput = z.infer<typeof createFlowInput>;

export const createFlowOutput = flowSchema;

export type CreateFlowOutput = z.infer<typeof createFlowOutput>;
