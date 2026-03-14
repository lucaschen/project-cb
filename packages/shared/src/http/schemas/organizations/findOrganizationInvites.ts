import { z } from "zod";

import { organizationIdParamsSchema, organizationInviteSchema } from "./common";

export const findOrganizationInvitesParams = organizationIdParamsSchema;

export type FindOrganizationInvitesParams =
  z.infer<typeof findOrganizationInvitesParams>;

export const findOrganizationInvitesOutput = z.array(organizationInviteSchema);

export type FindOrganizationInvitesOutput =
  z.infer<typeof findOrganizationInvitesOutput>;
