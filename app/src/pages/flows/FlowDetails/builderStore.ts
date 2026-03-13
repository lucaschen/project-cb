import { create } from "zustand";

export type InspectorTab = "flow" | "selection";

type BuilderStore = {
  inspectorTab: InspectorTab;
  isInspectorOpen: boolean;
  isPaletteOpen: boolean;
  selectedNodeId: string | null;
  clearSelection: () => void;
  reset: () => void;
  selectNode: (nodeId: string) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  toggleInspectorOpen: () => void;
  togglePaletteOpen: () => void;
};

const useBuilderStore = create<BuilderStore>((set) => ({
  inspectorTab: "flow",
  isInspectorOpen: true,
  isPaletteOpen: true,
  selectedNodeId: null,
  clearSelection: () =>
    set({
      inspectorTab: "flow",
      selectedNodeId: null,
    }),
  reset: () =>
    set({
      inspectorTab: "flow",
      isInspectorOpen: true,
      isPaletteOpen: true,
      selectedNodeId: null,
    }),
  selectNode: (nodeId) =>
    set({
      inspectorTab: "selection",
      selectedNodeId: nodeId,
    }),
  setInspectorTab: (tab) =>
    set({
      inspectorTab: tab,
    }),
  toggleInspectorOpen: () =>
    set((state) => ({
      isInspectorOpen: !state.isInspectorOpen,
    })),
  togglePaletteOpen: () =>
    set((state) => ({
      isPaletteOpen: !state.isPaletteOpen,
    })),
}));

export default useBuilderStore;
