import OrganizationEntity from "~entities/OrganizationEntity";

import InvalidCredentialsError from "../errors/InvalidCredentialsError";
import NotFoundError from "../errors/NotFoundError";

export const canUserCreateFlowInOrganization = async ({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}): Promise<true | NotFoundError | InvalidCredentialsError> => {
  const organizationEntity = await OrganizationEntity.findById(organizationId);

  if (!organizationEntity) {
    return new NotFoundError(`Organization id: ${organizationId} not found.`);
  }

  const canCreateFlow = await organizationEntity.canUserCreateFlow({
    userId,
  });

  if (!canCreateFlow) {
    return new InvalidCredentialsError(
      "Insufficient permissions to create flow in this organization.",
    );
  }

  return true;
};
