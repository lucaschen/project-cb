import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { Organization } from "~db/models/Organization";

import type OrganizationEntity from "../OrganizationEntity";

export default async function create(
  this: typeof OrganizationEntity,
  params: Omit<InferCreationAttributes<Organization>, "id"> & {
    id?: string;
  }
): Promise<OrganizationEntity> {
  const payload = { id: params.id ?? uuidV4(), ...params };

  const model = await Organization.create(payload);

  return new this(model);
}
