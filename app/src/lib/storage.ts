const activeOrganizationStorageKey = "project-cb.activeOrganizationId";

const canUseStorage = () => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

export const getStoredActiveOrganizationId = () => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(activeOrganizationStorageKey);
};

export const setStoredActiveOrganizationId = (organizationId: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(activeOrganizationStorageKey, organizationId);
};

export const clearStoredActiveOrganizationId = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(activeOrganizationStorageKey);
};
