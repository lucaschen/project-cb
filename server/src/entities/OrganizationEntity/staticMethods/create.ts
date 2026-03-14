import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { Organization } from "~db/models/Organization";

import type OrganizationEntity from "../OrganizationEntity";

export default async function create(
  this: typeof OrganizationEntity,
  {
    id,
    ...params
  }: Omit<InferCreationAttributes<Organization>, "deletedAt" | "id"> & {
    id?: string;
    deletedAt?: Date | null;
  },
): Promise<OrganizationEntity> {
  // Check if id already exists
  if (id) {
    const existingOrgById = await Organization.findByPk(id);
    if (existingOrgById) {
      throw new Error(`Organization with ID ${id} already exists`);
    }
  }

  const payload = {
    id: id ?? uuidV4(),
    ...params,
  };

  const model = await Organization.create(payload);

  return new this(model);
}
