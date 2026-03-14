import { z } from "zod";

import {
  organizationAdminDetailSchema,
  organizationIdParamsSchema,
} from "./common";

export const updateOrganizationParams = organizationIdParamsSchema;

export type UpdateOrganizationParams = z.infer<typeof updateOrganizationParams>;

export const updateOrganizationInput = z
  .object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
  })
  .strict()
  .refine((value) => value.name !== undefined || value.slug !== undefined, {
    message: "At least one organization field must be provided.",
  });

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInput>;

export const updateOrganizationOutput = organizationAdminDetailSchema;

export type UpdateOrganizationOutput = z.infer<typeof updateOrganizationOutput>;
