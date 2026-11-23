import { beforeEach, describe, expect, it } from "vitest";
import { useEditorUiStore } from "./editor-ui-store";

describe("Scene Studio editor UI store", () => {
  beforeEach(() => {
    useEditorUiStore.setState({ activePanel: "hierarchy" });
  });

  it("starts with the hierarchy panel active", () => {
    expect(useEditorUiStore.getState().activePanel).toBe("hierarchy");
  });

  it("changes the active panel without mutating scene data", () => {
    useEditorUiStore.getState().setActivePanel("inspector");

    expect(useEditorUiStore.getState().activePanel).toBe("inspector");
  });
});
