import { z } from "zod";

import {
  createdOrganizationApiKeySchema,
  organizationIdParamsSchema,
} from "./common";

export const createOrganizationApiKeyParams = organizationIdParamsSchema;

export type CreateOrganizationApiKeyParams = z.infer<
  typeof createOrganizationApiKeyParams
>;

export const createOrganizationApiKeyInput = z
  .object({
    expiresAt: z.string().datetime().optional(),
    name: z.string().min(1),
  })
  .strict();

export type CreateOrganizationApiKeyInput = z.infer<
  typeof createOrganizationApiKeyInput
>;

export const createOrganizationApiKeyOutput = createdOrganizationApiKeySchema;

export type CreateOrganizationApiKeyOutput = z.infer<
  typeof createOrganizationApiKeyOutput
>;
