import type { CreatedOrganizationApiKeyType } from "@packages/shared/http/schemas/organizations/common";
import { randomUUID } from "crypto";

import { OrganizationApiKey } from "~db/models/OrganizationApiKey";
import {
  generateOrganizationApiKey,
  getOrganizationApiKeyPrefix,
} from "~src/utils/apiKeys";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type OrganizationEntity from "../OrganizationEntity";

export default async function createApiKey(
  this: OrganizationEntity,
  {
    createdByUserId,
    expiresAt,
    name,
  }: {
    createdByUserId: string;
    expiresAt?: Date | null;
    name: string;
  },
): Promise<CreatedOrganizationApiKeyType> {
  const now = new Date();

  if (expiresAt && expiresAt <= now) {
    throw new InvalidRequestError("Organization API key expiry must be in the future.");
  }

  const key = generateOrganizationApiKey();
  const organizationApiKey = await OrganizationApiKey.create({
    createdByUserId,
    expiresAt: expiresAt ?? null,
    id: randomUUID(),
    key,
    lastUsedAt: null,
    name,
    organizationId: this.dbModel.id,
    prefix: getOrganizationApiKeyPrefix(key),
    revokedAt: null,
    revokedByUserId: null,
  });

  return {
    createdAt: organizationApiKey.createdAt.toISOString(),
    createdByUserId: organizationApiKey.createdByUserId,
    expiresAt: organizationApiKey.expiresAt?.toISOString() ?? null,
    id: organizationApiKey.id,
    key: organizationApiKey.key,
    lastUsedAt: organizationApiKey.lastUsedAt?.toISOString() ?? null,
    name: organizationApiKey.name,
    prefix: organizationApiKey.prefix,
    revokedAt: organizationApiKey.revokedAt?.toISOString() ?? null,
    revokedByUserId: organizationApiKey.revokedByUserId,
  };
}
