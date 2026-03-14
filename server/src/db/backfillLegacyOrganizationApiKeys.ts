import { QueryTypes, type Sequelize } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { getOrganizationApiKeyPrefix } from "../utils/apiKeys";
import type { Models } from "./models";

type LegacyOrganizationApiKeyRow = {
  apiKey: string;
  id: string;
};

const readLegacyOrganizationApiKeys = async (
  sequelize: Sequelize,
): Promise<LegacyOrganizationApiKeyRow[]> => {
  try {
    const columns = await sequelize.getQueryInterface().describeTable(
      "organizations",
    );

    if (!("apiKey" in columns)) {
      return [];
    }
  } catch {
    return [];
  }

  return sequelize.query<LegacyOrganizationApiKeyRow>(
    'SELECT id, "apiKey" FROM organizations WHERE "apiKey" IS NOT NULL',
    {
      type: QueryTypes.SELECT,
    },
  );
};

export const captureLegacyOrganizationApiKeys = readLegacyOrganizationApiKeys;

export const backfillLegacyOrganizationApiKeys = async (
  legacyApiKeys: LegacyOrganizationApiKeyRow[],
  models: Models,
) => {
  for (const legacyApiKey of legacyApiKeys) {
    const existingApiKey = await models.OrganizationApiKey.findOne({
      where: {
        key: legacyApiKey.apiKey,
        organizationId: legacyApiKey.id,
      },
    });

    if (existingApiKey) {
      continue;
    }

    const organizationUser = await models.OrganizationUser.findOne({
      order: [["userId", "ASC"]],
      where: {
        organizationId: legacyApiKey.id,
      },
    });

    if (!organizationUser) {
      console.warn(
        `Skipping legacy API key backfill for organization ${legacyApiKey.id} because no organization member exists.`,
      );
      continue;
    }

    await models.OrganizationApiKey.create({
      createdByUserId: organizationUser.userId,
      expiresAt: null,
      id: uuidV4(),
      key: legacyApiKey.apiKey,
      lastUsedAt: null,
      name: "Migrated legacy API key",
      organizationId: legacyApiKey.id,
      prefix: getOrganizationApiKeyPrefix(legacyApiKey.apiKey),
      revokedAt: null,
      revokedByUserId: null,
    });
  }
};
