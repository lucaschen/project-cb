import { OrganizationUserPermission } from "@packages/shared/types/enums";
import { z } from "zod";

import { organizationIdParamsSchema, organizationInviteSchema } from "./common";

export const createOrganizationInviteParams = organizationIdParamsSchema;

export type CreateOrganizationInviteParams = z.infer<
  typeof createOrganizationInviteParams
>;

export const createOrganizationInviteInput = z
  .object({
    email: z.email(),
    expiresAt: z.iso.datetime(),
    permissions: z.enum(OrganizationUserPermission),
  })
  .strict();

export type CreateOrganizationInviteInput = z.infer<
  typeof createOrganizationInviteInput
>;

export const createOrganizationInviteOutput = organizationInviteSchema;

export type CreateOrganizationInviteOutput = z.infer<
  typeof createOrganizationInviteOutput
>;
