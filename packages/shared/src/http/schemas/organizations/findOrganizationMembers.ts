import { z } from "zod";

import { organizationIdParamsSchema, organizationMemberSchema } from "./common";

export const findOrganizationMembersParams = organizationIdParamsSchema;

export type FindOrganizationMembersParams = z.infer<
  typeof findOrganizationMembersParams
>;

export const findOrganizationMembersOutput = z.array(organizationMemberSchema);

export type FindOrganizationMembersOutput = z.infer<
  typeof findOrganizationMembersOutput
>;
