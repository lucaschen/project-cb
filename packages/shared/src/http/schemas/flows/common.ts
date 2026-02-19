import { z } from "zod";

export const flowPayload = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  organizationId: z.string().min(1),
  slug: z.string().min(1),
});

export type FlowPayload = z.infer<typeof flowPayload>;
