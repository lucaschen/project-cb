import type { SessionPayload } from "@packages/shared/http/schemas/sessions/common";

import { create } from "zustand";

import { clearStoredActiveOrganizationId, setStoredActiveOrganizationId } from "@app/lib/storage";

type AuthBootstrapStatus = "idle" | "loading" | "ready";

type AppStoreState = {
  activeOrganizationId: string | null;
  authBootstrapStatus: AuthBootstrapStatus;
  clearActiveOrganizationId: () => void;
  clearCurrentSession: () => void;
  currentSession: SessionPayload | null;
  setActiveOrganizationId: (organizationId: string) => void;
  setAuthBootstrapStatus: (status: AuthBootstrapStatus) => void;
  setCurrentSession: (session: SessionPayload) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  activeOrganizationId: null,
  authBootstrapStatus: "idle",
  clearActiveOrganizationId: () => {
    clearStoredActiveOrganizationId();
    set({
      activeOrganizationId: null,
    });
  },
  clearCurrentSession: () => {
    clearStoredActiveOrganizationId();
    set({
      activeOrganizationId: null,
      currentSession: null,
    });
  },
  currentSession: null,
  setActiveOrganizationId: (organizationId) => {
    setStoredActiveOrganizationId(organizationId);
    set({
      activeOrganizationId: organizationId,
    });
  },
  setAuthBootstrapStatus: (authBootstrapStatus) => {
    set({
      authBootstrapStatus,
    });
  },
  setCurrentSession: (currentSession) => {
    set({
      currentSession,
    });
  },
}));
