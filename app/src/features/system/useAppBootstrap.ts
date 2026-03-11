import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "@app/features/auth/api";
import { queryKeys } from "@app/lib/api/queryKeys";
import { useAppStore } from "@app/stores/appStore";

export const useAppBootstrap = () => {
  const { clearCurrentSession, setAuthBootstrapStatus, setCurrentSession } = useAppStore();

  const sessionQuery = useQuery({
    queryFn: getCurrentSession,
    queryKey: queryKeys.session,
    staleTime: 60_000,
  });

  useEffect(() => {
    setAuthBootstrapStatus(sessionQuery.isPending ? "loading" : "ready");
  }, [sessionQuery.isPending, setAuthBootstrapStatus]);

  useEffect(() => {
    if (sessionQuery.data) {
      setCurrentSession(sessionQuery.data);
      return;
    }

    clearCurrentSession();
  }, [clearCurrentSession, sessionQuery.data, setCurrentSession]);

  return {
    error: sessionQuery.error,
    isBootstrapping: sessionQuery.isPending,
    refetch: sessionQuery.refetch,
    session: sessionQuery.data ?? null,
  };
};
