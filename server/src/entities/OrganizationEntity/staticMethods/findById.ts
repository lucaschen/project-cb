import { Organization } from "~db/models/Organization";

import type OrganizationEntity from "../OrganizationEntity";

export default async function findById(
  this: typeof OrganizationEntity,
  id: string
): Promise<OrganizationEntity | null> {
  const organization = await Organization.findOne({
    where: {
      deletedAt: null,
      id,
    },
  });

  if (!organization) return null;

  return new this(organization);
}
