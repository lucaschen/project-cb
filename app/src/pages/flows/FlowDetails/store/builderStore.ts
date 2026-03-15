import FlowGraphEntity from "@packages/shared/entities/FlowGraphEntity/FlowGraphEntity";
import type {
  FlowGraph,
  FlowGraphEdge,
  FlowGraphNode,
} from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import type { NodeChange } from "@xyflow/react";
import { applyNodeChanges } from "@xyflow/react";
import { create } from "zustand";

export type SelectedItem = {
  id: string;
  kind: "edge" | "node";
} | null;

export type InspectorTab = "flow" | "selection";

type ReactFlowStore = {
  graphEntity: FlowGraphEntity;
  edges: FlowGraphEdge[];
  nodes: FlowGraphNode[];
  inspectorTab: InspectorTab;
  selectedItem: SelectedItem;
  applyNodeChanges: (changes: NodeChange<FlowGraphNode>[]) => void;
  initializeGraph: (
    graph: FlowGraph,
    options?: { preserveSelection?: boolean },
  ) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  updateGraph: (mutateGraphCallback: (graph: FlowGraphEntity) => void) => void;
  selectItem: (item: SelectedItem) => void;
};

const useBuilderStore = create<ReactFlowStore>((set) => ({
  graphEntity: new FlowGraphEntity({
    edges: [],
    nodes: [],
  }),
  edges: [],
  nodes: [],
  inspectorTab: "flow",
  selectedItem: null,
  applyNodeChanges: (changes) =>
    set((state) => {
      if (changes.length === 0) {
        return state;
      }

      const nextNodes = applyNodeChanges(changes, state.nodes);
      const positionChanges = changes.filter(
        (change) => change.type === "position",
      ) as Array<Extract<NodeChange<FlowGraphNode>, { type: "position" }>>;

      for (const change of positionChanges) {
        const node = state.graphEntity.getNodeById(change.id);

        if (!node || !change.position) {
          continue;
        }

        node.position = change.position;
      }

      return {
        nodes: nextNodes,
      };
    }),
  initializeGraph: (graph) =>
    set(() => {
      const flowGraphEntity = new FlowGraphEntity(graph);
      const { edges, nodes } = flowGraphEntity.getGraph();

      return {
        graphEntity: flowGraphEntity,
        edges,
        nodes,
      };
    }),
  setInspectorTab: (tab) =>
    set((state) => {
      if (state.inspectorTab === tab) {
        return state;
      }

      return {
        inspectorTab: tab,
      };
    }),
  selectItem: (item) =>
    set((state) => {
      const nextInspectorTab = item === null ? "flow" : "selection";

      if (
        state.selectedItem?.id === item?.id &&
        state.selectedItem?.kind === item?.kind &&
        state.inspectorTab === nextInspectorTab
      ) {
        return state;
      }

      return {
        inspectorTab: nextInspectorTab,
        selectedItem: item,
      };
    }),
  updateGraph: (mutateGraphCallback) =>
    set((state) => {
      mutateGraphCallback(state.graphEntity);

      const nextGraph = state.graphEntity.getGraph();

      return {
        edges: nextGraph.edges,
        nodes: nextGraph.nodes,
      };
    }),
}));

export default useBuilderStore;
