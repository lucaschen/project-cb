import { z } from "zod";

import { organizationApiKeyParamsSchema } from "./common";

export const revokeOrganizationApiKeyParams = organizationApiKeyParamsSchema;

export type RevokeOrganizationApiKeyParams = z.infer<
  typeof revokeOrganizationApiKeyParams
>;

export const revokeOrganizationApiKeyOutput = z.null();

export type RevokeOrganizationApiKeyOutput = z.infer<
  typeof revokeOrganizationApiKeyOutput
>;
