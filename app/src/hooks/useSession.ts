import { queryKeys } from "@app/api/queryKeys";
import { deleteCurrentSession, getCurrentSession } from "@app/api/session";
import { queryClient } from "@app/utils/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

const useSession = () => {
  const { data: sessionData, ...rest } = useQuery({
    queryFn: getCurrentSession,
    queryKey: queryKeys.session,
    staleTime: Infinity,
  });

  const logoutMutation = useMutation({
    mutationFn: deleteCurrentSession,
    onSettled: async () => {
      queryClient.setQueryData(queryKeys.session, null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.session,
      });
    },
  });

  return {
    sessionData: sessionData ?? null,
    logoutMutation,
    ...rest,
  };
};

export default useSession;
