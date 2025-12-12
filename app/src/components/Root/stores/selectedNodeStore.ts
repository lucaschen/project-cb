import { create } from "zustand";

interface SelectedNodeState {
  selectedItemId: string | null;
  selectedItemType: "node" | "edge";
  setSelectedItem: (args: { id: string; type: "node" | "edge" } | null) => void;
}

export const useSelectedNodeStore = create<SelectedNodeState>((set) => ({
  selectedItemId: null,
  selectedItemType: "node",
  setSelectedItem: (item) => {
    if (!item) return set(() => ({ selectedItemId: null }));

    set(() => ({ selectedItemId: item.id, selectedItemType: item.type }));
  },
}));
