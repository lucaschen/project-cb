import { OrganizationUserPermission } from "@packages/shared/types/enums";
import { randomUUID } from "crypto";

import OrganizationEntity from "~entities/OrganizationEntity/OrganizationEntity";

export const seedOrganization = async ({
  name = `Org ${randomUUID()}`,
  slug = `org-${randomUUID()}`,
}: {
  name?: string;
  slug?: string;
} = {}) => {
  return await OrganizationEntity.create({ name, slug });
};

export const addUserToOrganization = async ({
  organizationEntity,
  permissions = OrganizationUserPermission.ADMIN,
  userId,
}: {
  organizationEntity: OrganizationEntity;
  permissions?: OrganizationUserPermission;
  userId: string;
}) => {
  return await organizationEntity.addUser({ permissions, userId });
};

export const seedOrganizationForUser = async ({
  name,
  permissions,
  slug,
  userId,
}: {
  name?: string;
  permissions?: OrganizationUserPermission;
  slug?: string;
  userId: string;
}) => {
  const organizationEntity = await seedOrganization({ name, slug });

  await addUserToOrganization({
    organizationEntity,
    permissions,
    userId,
  });

  return organizationEntity;
};
