import type { OrganizationApiKeyType } from "@packages/shared/http/schemas/organizations/common";
import { Op } from "sequelize";

import { OrganizationApiKey } from "~db/models/OrganizationApiKey";

import type OrganizationEntity from "../OrganizationEntity";

export default async function findActiveApiKeys(
  this: OrganizationEntity,
): Promise<OrganizationApiKeyType[]> {
  const now = new Date();
  const apiKeys = await OrganizationApiKey.findAll({
    order: [["createdAt", "ASC"]],
    where: {
      organizationId: this.dbModel.id,
      revokedAt: null,
      [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now } }],
    },
  });

  return apiKeys.map((apiKey) => ({
    createdAt: apiKey.createdAt.toISOString(),
    createdByUserId: apiKey.createdByUserId,
    expiresAt: apiKey.expiresAt?.toISOString() ?? null,
    id: apiKey.id,
    lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
    name: apiKey.name,
    prefix: apiKey.prefix,
    revokedAt: apiKey.revokedAt?.toISOString() ?? null,
    revokedByUserId: apiKey.revokedByUserId,
  }));
}
