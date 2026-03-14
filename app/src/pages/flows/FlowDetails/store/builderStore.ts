import type { NodeChange } from "@xyflow/react";
import { applyNodeChanges } from "@xyflow/react";
import { create } from "zustand";

import type {
  BuilderCanvasGraph,
  BuilderFlowEdge,
  BuilderFlowNode,
} from "../utils/builderFlowToReactFlow";
import { sanitizeSelectionAfterGraphReplace } from "../utils/builderGraph";

export type SelectedItem = {
  id: string;
  kind: "edge" | "node";
} | null;

type ReactFlowStore = {
  edges: BuilderFlowEdge[];
  nodes: BuilderFlowNode[];
  selectedItem: SelectedItem;
  applyNodeChanges: (changes: NodeChange<BuilderFlowNode>[]) => void;
  initializeGraph: (
    graph: BuilderCanvasGraph,
    options?: { preserveSelection?: boolean },
  ) => void;
  resetGraph: () => void;
  selectItem: (item: SelectedItem) => void;
};

const useBuilderStore = create<ReactFlowStore>((set) => ({
  edges: [],
  nodes: [],
  selectedItem: null,
  applyNodeChanges: (changes) =>
    set((state) => {
      const semanticChanges = changes.filter(
        (change) => change.type !== "select",
      );

      if (semanticChanges.length === 0) {
        return state;
      }

      const nextNodes = applyNodeChanges(semanticChanges, state.nodes);

      if (
        nextNodes.length === state.nodes.length &&
        nextNodes.every((node, index) => node === state.nodes[index])
      ) {
        return state;
      }

      return {
        nodes: nextNodes,
      };
    }),
  initializeGraph: (graph, options = {}) =>
    set((state) => {
      const nextSelectedItem = options.preserveSelection
        ? sanitizeSelectionAfterGraphReplace(graph, state.selectedItem)
        : null;

      if (
        state.edges === graph.edges &&
        state.nodes === graph.nodes &&
        state.selectedItem === nextSelectedItem
      ) {
        return state;
      }

      return {
        edges: graph.edges,
        nodes: graph.nodes,
        selectedItem: nextSelectedItem,
      };
    }),
  resetGraph: () =>
    set((state) => {
      if (
        state.edges.length === 0 &&
        state.nodes.length === 0 &&
        state.selectedItem === null
      ) {
        return state;
      }

      return {
        edges: [],
        nodes: [],
        selectedItem: null,
      };
    }),
  selectItem: (item) =>
    set((state) => {
      if (
        state.selectedItem?.id === item?.id &&
        state.selectedItem?.kind === item?.kind
      ) {
        return state;
      }

      return {
        selectedItem: item,
      };
    }),
}));

export default useBuilderStore;
