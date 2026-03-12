import { getCurrentUserOrganizations } from "@app/api/organizations";
import { queryKeys } from "@app/api/queryKeys";
import {
  clearStoredActiveOrganizationId,
  getStoredActiveOrganizationId,
} from "@app/utils/localStorage";
import {
  resolveActiveOrganizationId,
  syncActiveOrganizationId,
} from "@app/utils/organizations";
import type { GetCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

type UseCurrentUserOrganizationsOptions = {
  isSessionPending?: boolean;
  sessionData?: GetCurrentSessionOutput | null;
};

const useCurrentUserOrganizations = ({
  isSessionPending = false,
  sessionData = null,
}: UseCurrentUserOrganizationsOptions = {}) => {
  const { data, ...rest } = useQuery({
    enabled: Boolean(sessionData),
    queryFn: getCurrentUserOrganizations,
    queryKey: queryKeys.currentUserOrganizations,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isSessionPending) {
      return;
    }

    if (!sessionData) {
      clearStoredActiveOrganizationId();
      return;
    }

    if (!data) {
      return;
    }

    const nextOrganizationId = syncActiveOrganizationId(data);

    if (!nextOrganizationId) {
      clearStoredActiveOrganizationId();
    }
  }, [data, isSessionPending, sessionData]);

  const organizations = data ?? [];
  const activeOrganizationId = resolveActiveOrganizationId(
    organizations,
    getStoredActiveOrganizationId(),
  );
  const activeOrganization =
    organizations.find((organization) => organization.id === activeOrganizationId) ??
    null;

  return {
    activeOrganization,
    activeOrganizationId,
    organizations,
    ...rest,
  };
};

export default useCurrentUserOrganizations;
