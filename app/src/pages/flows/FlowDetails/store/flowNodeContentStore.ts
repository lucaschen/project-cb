import type { FlowStepElementType, FlowWithNodesType } from "@packages/shared/http/schemas/flows/common";
import { create } from "zustand";

const isStepNode = (
  node: FlowWithNodesType["nodes"][number],
): node is Extract<FlowWithNodesType["nodes"][number], { elements: FlowStepElementType[] }> =>
  "elements" in node;

type FlowNodeContentStore = {
  stepElementsByNodeId: Record<string, FlowStepElementType[]>;
  initializeFromFlow: (flow: FlowWithNodesType) => void;
  reset: () => void;
  setStepElements: (nodeId: string, elements: FlowStepElementType[]) => void;
};

const useFlowNodeContentStore = create<FlowNodeContentStore>((set) => ({
  stepElementsByNodeId: {},
  initializeFromFlow: (flow) =>
    set(() => ({
      stepElementsByNodeId: Object.fromEntries(
        flow.nodes
          .filter(isStepNode)
          .map((node) => [node.nodeId, node.elements]),
      ),
    })),
  reset: () =>
    set(() => ({
      stepElementsByNodeId: {},
    })),
  setStepElements: (nodeId, elements) =>
    set((state) => ({
      stepElementsByNodeId: {
        ...state.stepElementsByNodeId,
        [nodeId]: elements,
      },
    })),
}));

export default useFlowNodeContentStore;
