import type { InferCreationAttributes } from "sequelize";
import { v4 as uuidV4 } from "uuid";

import { Organization } from "~db/models/Organization";
import { generateApiKey } from "~src/utils/apiKeys";

import type OrganizationEntity from "../OrganizationEntity";

export default async function create(
  this: typeof OrganizationEntity,
  {
    id,
    apiKey,
    ...params
  }: Omit<InferCreationAttributes<Organization>, "id" | "apiKey"> & {
    id?: string;
    apiKey?: string;
  },
): Promise<OrganizationEntity> {
  const payload = {
    id: id ?? uuidV4(),
    apiKey: apiKey ?? generateApiKey(),
    ...params,
  };

  const model = await Organization.create(payload);

  return new this(model);
}
