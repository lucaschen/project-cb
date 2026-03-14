import { z } from "zod";

import { organizationAdminDetailSchema } from "./common";

export const createOrganizationInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationInput>;

export const createOrganizationOutput = organizationAdminDetailSchema;

export type CreateOrganizationOutput = z.infer<typeof createOrganizationOutput>;
