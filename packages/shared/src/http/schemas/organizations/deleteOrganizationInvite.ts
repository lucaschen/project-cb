import { z } from "zod";

import { organizationInviteParamsSchema } from "./common";

export const deleteOrganizationInviteParams = organizationInviteParamsSchema;

export type DeleteOrganizationInviteParams =
  z.infer<typeof deleteOrganizationInviteParams>;

export const deleteOrganizationInviteOutput = z.null();

export type DeleteOrganizationInviteOutput =
  z.infer<typeof deleteOrganizationInviteOutput>;
