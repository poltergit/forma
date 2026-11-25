import { describe, expect, it } from "vitest";
import { applySceneMaterialPreset, getSceneMaterialPreset, SCENE_MATERIAL_PRESETS } from "./scene-materials";
const base = { roughness: .28, metalness: .12, emissive: "#000000" };
describe("Scene Studio physical material presets", () => {
  it("exposes six named surface presets", () => {
    expect(SCENE_MATERIAL_PRESETS.map((preset) => preset.id)).toEqual(["paper","ink","metal","glass","liquid","ceramic"]);
  });
  it("uses real transmission and optical depth for glass and liquid", () => {
    expect(getSceneMaterialPreset("glass")).toMatchObject({ transmission: 1, thickness: .85, ior: 1.48, clearcoat: .95 });
    expect(getSceneMaterialPreset("liquid")).toMatchObject({ transmission: .82, thickness: 1.35, ior: 1.36, clearcoat: 1 });
  });
  it("applies a complete preset without mutating the original object", () => {
    const result = applySceneMaterialPreset(base, "metal");
    expect(result).toMatchObject({ roughness: .2, metalness: .88, clearcoat: .22, transmission: 0 });
    expect(base).toEqual({ roughness: .28, metalness: .12, emissive: "#000000" });
  });
});
