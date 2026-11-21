import { create } from "zustand";

export type EditorPanel = "hierarchy" | "inspector";

type EditorUiState = {
  activePanel: EditorPanel;
  setActivePanel: (panel: EditorPanel) => void;
};

export const useEditorUiStore = create<EditorUiState>((set) => ({
  activePanel: "hierarchy",
  setActivePanel: (activePanel) => set({ activePanel }),
}));
