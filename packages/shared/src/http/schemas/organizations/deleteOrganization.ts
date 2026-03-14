import { z } from "zod";

import { organizationIdParamsSchema } from "./common";

export const deleteOrganizationParams = organizationIdParamsSchema;

export type DeleteOrganizationParams = z.infer<typeof deleteOrganizationParams>;

export const deleteOrganizationOutput = z.null();

export type DeleteOrganizationOutput = z.infer<typeof deleteOrganizationOutput>;
