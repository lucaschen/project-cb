import { OrganizationApiKey } from "~db/models/OrganizationApiKey";
import NotFoundError from "~src/utils/errors/NotFoundError";

import type OrganizationEntity from "../OrganizationEntity";

export default async function revokeApiKey(
  this: OrganizationEntity,
  {
    apiKeyId,
    revokedByUserId,
  }: {
    apiKeyId: string;
    revokedByUserId: string;
  },
): Promise<void> {
  const organizationApiKey = await OrganizationApiKey.findOne({
    where: {
      id: apiKeyId,
      organizationId: this.dbModel.id,
      revokedAt: null,
    },
  });

  if (!organizationApiKey) {
    throw new NotFoundError(
      `Organization API key id: ${apiKeyId} not found in organization.`,
    );
  }

  organizationApiKey.revokedAt = new Date();
  organizationApiKey.revokedByUserId = revokedByUserId;
  await organizationApiKey.save();
}
