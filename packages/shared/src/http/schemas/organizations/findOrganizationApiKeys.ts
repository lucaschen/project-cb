import { z } from "zod";

import { organizationApiKeySchema, organizationIdParamsSchema } from "./common";

export const findOrganizationApiKeysParams = organizationIdParamsSchema;

export type FindOrganizationApiKeysParams = z.infer<
  typeof findOrganizationApiKeysParams
>;

export const findOrganizationApiKeysOutput = z.array(organizationApiKeySchema);

export type FindOrganizationApiKeysOutput = z.infer<
  typeof findOrganizationApiKeysOutput
>;
