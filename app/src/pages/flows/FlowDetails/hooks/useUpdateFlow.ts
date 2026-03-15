import { updateFlowBuilder } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import { useToast } from "@app/components/ui/ToastProvider";
import { getApiErrorMessage } from "@app/utils/getApiErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { BuilderCanvasGraph } from "../utils/builderFlowToReactFlow";
import { graphToUpdateBuilderInput } from "../utils/builderGraph";

const useUpdateFlow = (flowId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: updateFlowBuilder,
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.flow(response.flow.id), response);
    },
  });

  const updateFlow = async (currentGraph: BuilderCanvasGraph) => {
    try {
      await mutateAsync({
        flowId,
        input: graphToUpdateBuilderInput(currentGraph),
      });
      toast.success("Builder changes saved.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, {
          byStatus: {
            400: "Unable to save those builder changes right now. Review the builder issues and try again.",
          },
          default: "Unable to save the builder right now. Try again.",
        }),
      );
    }
  };

  return {
    updateFlow,
    ...rest,
  };
};

export default useUpdateFlow;
