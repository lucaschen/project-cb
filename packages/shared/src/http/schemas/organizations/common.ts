import { OrganizationUserPermission } from "@packages/shared/types/enums";
import { z } from "zod";

export const organizationSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export type OrganizationSummaryType = z.infer<typeof organizationSummarySchema>;

export const organizationAdminDetailSchema = organizationSummarySchema.extend({
  apiKey: z.string().min(1),
});

export type OrganizationAdminDetailType = z.infer<
  typeof organizationAdminDetailSchema
>;

export const organizationMemberSchema = z.object({
  email: z.string().email(),
  permissions: z.enum(OrganizationUserPermission),
  userId: z.string().uuid(),
});

export type OrganizationMemberType = z.infer<typeof organizationMemberSchema>;

export const organizationInviteSchema = z.object({
  email: z.string().email(),
  expiresAt: z.string().datetime(),
  id: z.string().uuid(),
  invitedByUserId: z.string().uuid(),
  permissions: z.enum(OrganizationUserPermission),
});

export type OrganizationInviteType = z.infer<typeof organizationInviteSchema>;

export const organizationIdParamsSchema = z.object({
  organizationId: z.string().uuid(),
});

export type OrganizationIdParamsType = z.infer<
  typeof organizationIdParamsSchema
>;

export const organizationMemberParamsSchema = organizationIdParamsSchema.extend(
  {
    userId: z.string().uuid(),
  },
);

export type OrganizationMemberParamsType = z.infer<
  typeof organizationMemberParamsSchema
>;

export const organizationInviteParamsSchema = organizationIdParamsSchema.extend(
  {
    inviteId: z.string().uuid(),
  },
);

export type OrganizationInviteParamsType = z.infer<
  typeof organizationInviteParamsSchema
>;
