import { z } from "zod";

import { organizationMemberParamsSchema } from "./common";

export const removeOrganizationMemberParams = organizationMemberParamsSchema;

export type RemoveOrganizationMemberParams =
  z.infer<typeof removeOrganizationMemberParams>;

export const removeOrganizationMemberOutput = z.null();

export type RemoveOrganizationMemberOutput =
  z.infer<typeof removeOrganizationMemberOutput>;
