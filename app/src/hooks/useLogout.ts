import { queryKeys } from "@app/api/queryKeys";
import { deleteCurrentSession } from "@app/api/session";
import { clearStoredActiveOrganizationId } from "@app/utils/localStorage";
import { queryClient } from "@app/utils/queryClient";
import { useMutation } from "@tanstack/react-query";

const useLogout = () => {
  const logoutMutation = useMutation({
    mutationFn: deleteCurrentSession,
    onSettled: async () => {
      queryClient.setQueryData(queryKeys.session, null);
      queryClient.removeQueries({
        queryKey: queryKeys.currentUserOrganizations,
      });
      clearStoredActiveOrganizationId();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.session,
      });
    },
  });

  return logoutMutation;
};

export default useLogout;
