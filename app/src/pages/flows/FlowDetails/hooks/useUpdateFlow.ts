import { updateFlowBuilder } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import useToast from "@app/components/ui/useToast";
import { getApiErrorMessage } from "@app/utils/getApiErrorMessage";
import FlowBuilderEntity from "@packages/shared/entities/FlowBuilderEntity/FlowBuilderEntity";
import type { FlowGraph } from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateFlow = (flowId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: updateFlowBuilder,
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.flow(response.flow.id), response);
    },
  });

  const updateFlow = async (graph: FlowGraph) => {
    try {
      await mutateAsync({
        flowId,
        input: FlowBuilderEntity.fromGraph(graph).getPayload(),
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
