import { OrganizationUserPermission } from "@packages/shared/types/enums";
import { z } from "zod";

export const organizationSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export type OrganizationSummaryType = z.infer<typeof organizationSummarySchema>;

export const organizationAdminDetailSchema = organizationSummarySchema;

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

export const organizationApiKeySchema = z.object({
  createdAt: z.string().datetime(),
  createdByUserId: z.string().uuid(),
  expiresAt: z.string().datetime().nullable(),
  id: z.string().uuid(),
  lastUsedAt: z.string().datetime().nullable(),
  name: z.string().min(1),
  prefix: z.string().min(1),
  revokedAt: z.string().datetime().nullable(),
  revokedByUserId: z.string().uuid().nullable(),
});

export type OrganizationApiKeyType = z.infer<typeof organizationApiKeySchema>;

export const createdOrganizationApiKeySchema = organizationApiKeySchema.extend({
  key: z.string().min(1),
});

export type CreatedOrganizationApiKeyType = z.infer<
  typeof createdOrganizationApiKeySchema
>;

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

export const organizationApiKeyParamsSchema = organizationIdParamsSchema.extend({
  apiKeyId: z.string().uuid(),
});

export type OrganizationApiKeyParamsType = z.infer<
  typeof organizationApiKeyParamsSchema
>;
