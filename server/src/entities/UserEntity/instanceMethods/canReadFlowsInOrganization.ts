import type UserEntity from "../UserEntity";

export default async function canReadFlowsInOrganization(
  this: UserEntity,
  organizationId: string,
): Promise<boolean> {
  return this.canReadOrganization(organizationId);
}
