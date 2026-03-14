import { OrganizationUserPermission } from "@packages/shared/types/enums";
import { z } from "zod";

import {
  organizationMemberParamsSchema,
  organizationMemberSchema,
} from "./common";

export const updateOrganizationMemberParams = organizationMemberParamsSchema;

export type UpdateOrganizationMemberParams = z.infer<
  typeof updateOrganizationMemberParams
>;

export const updateOrganizationMemberInput = z
  .object({
    permissions: z.enum(OrganizationUserPermission),
  })
  .strict();

export type UpdateOrganizationMemberInput = z.infer<
  typeof updateOrganizationMemberInput
>;

export const updateOrganizationMemberOutput = organizationMemberSchema;

export type UpdateOrganizationMemberOutput = z.infer<
  typeof updateOrganizationMemberOutput
>;
