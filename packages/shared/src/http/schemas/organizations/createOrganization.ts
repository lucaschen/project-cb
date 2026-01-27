import { z } from "zod";

import { organizationPayload } from "./common";

export const createOrganizationInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export type createOrganizationInput = z.infer<typeof createOrganizationInput>;

export const createOrganizationOutput = organizationPayload;

export type CreateOrganizationOutput = z.infer<typeof createOrganizationOutput>;
