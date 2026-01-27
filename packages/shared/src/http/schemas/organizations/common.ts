import { z } from "zod";

export const organizationPayload = z.object({
  apiKey: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export type OrganizationPayload = z.infer<typeof organizationPayload>;
