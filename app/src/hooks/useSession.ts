import { queryKeys } from "@app/api/queryKeys";
import { getCurrentSession } from "@app/api/session";
import { useQuery } from "@tanstack/react-query";

const useSession = () => {
  const { data: sessionData, ...rest } = useQuery({
    queryFn: getCurrentSession,
    queryKey: queryKeys.session,
    staleTime: Infinity,
  });

  return {
    sessionData: sessionData ?? null,
    ...rest,
  };
};

export default useSession;
