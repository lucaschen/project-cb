import {
  getStoredActiveOrganizationId,
  setStoredActiveOrganizationId,
} from "@app/utils/localStorage";
import type { OrganizationPayload } from "@packages/shared/http/schemas/organizations/common";

export const resolveActiveOrganizationId = (
  organizations: OrganizationPayload[],
  storedActiveOrganizationId = getStoredActiveOrganizationId(),
) => {
  if (organizations.length === 0) {
    return null;
  }

  if (storedActiveOrganizationId) {
    const persistedOrganization = organizations.find(
      (organization) => organization.id === storedActiveOrganizationId,
    );

    if (persistedOrganization) {
      return persistedOrganization.id;
    }
  }

  return organizations[0]?.id ?? null;
};

export const syncActiveOrganizationId = (
  organizations: OrganizationPayload[],
) => {
  const nextOrganizationId = resolveActiveOrganizationId(organizations);

  if (nextOrganizationId) {
    setStoredActiveOrganizationId(nextOrganizationId);
  }

  return nextOrganizationId;
};
