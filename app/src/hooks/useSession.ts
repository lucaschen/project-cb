import { queryKeys } from "@app/api/queryKeys";
import { getCurrentSession } from "@app/api/session";
import { useQuery } from "@tanstack/react-query";

const useSession = () => {
  const { data: sessionData, ...rest } = useQuery({
    queryFn: getCurrentSession,
    queryKey: queryKeys.session,
    staleTime: 60_000,
  });

  return {
    sessionData: sessionData ?? null,
    ...rest,
  };
};

export default useSession;
