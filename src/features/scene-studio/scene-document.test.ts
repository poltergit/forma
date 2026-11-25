import { describe, expect, it } from "vitest";
import { parseSceneDocument, readSceneLibrary } from "./scene-document";
import { normalizeSceneLighting, SCENE_LIGHTING_PRESETS } from "./scene-lighting";
import { DEFAULT_SCENE_RENDER, normalizeSceneRender, SCENE_RENDER_QUALITY } from "./scene-render";

const validScene = {
  format: "forma-scene",
  version: 1,
  name: "Study / 01",
  camera: "perspective",
  objects: [{
    id: 1, name: "Signal", kind: "box", color: "#f05b3e", roughness: 0.28,
    metalness: 0.12, emissive: "#000000", position: [0, 0, 0],
    rotation: [0, 0, 0], scale: 1, visible: true,
  }],
};

describe("scene document", () => {
  it("accepts a valid FORMA JSON scene", () => {
    expect(parseSceneDocument(validScene)).toMatchObject({ name: "Study / 01", camera: "perspective" });
  });

  it("rejects unsupported formats and malformed objects", () => {
    expect(() => parseSceneDocument({ ...validScene, format: "other" })).toThrow(/unsupported/i);
    expect(() => parseSceneDocument({ ...validScene, objects: [{ ...validScene.objects[0], position: [0, "bad", 0] }] })).toThrow(/invalid objects/i);
  });

  it("upgrades legacy objects with safe physical-material defaults", () => {
    expect(parseSceneDocument(validScene).objects[0]).toMatchObject({ transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0, clearcoatRoughness: 0, opacity: 1 });
  });

  it("accepts bounded physical material values and rejects invalid transmission", () => {
    const glass = { ...validScene, objects: [{ ...validScene.objects[0], transmission: 1, thickness: 1.2, ior: 1.48, clearcoat: 0.9, clearcoatRoughness: 0.03, opacity: 1 }] };
    expect(parseSceneDocument(glass).objects[0].transmission).toBe(1);
    expect(() => parseSceneDocument({ ...validScene, objects: [{ ...validScene.objects[0], transmission: 2 }] })).toThrow(/invalid objects/i);
  });

  it("normalizes legacy lighting and bounds custom rig values", () => {
    expect(parseSceneDocument(validScene).lighting?.preset).toBe("softbox");
    const value = normalizeSceneLighting({ preset: "neon", environment: "invalid", environmentIntensity: 99, key: { color: "bad", intensity: -2, position: [99, 0, 0] } });
    expect(value.environment).toBe("night");
    expect(value.environmentIntensity).toBe(3);
    expect(value.key).toMatchObject({ color: "#6855f5", intensity: 0, position: [10, 0, 0] });
    expect(SCENE_LIGHTING_PRESETS).toHaveLength(5);
  });

  it("normalizes legacy render settings and bounds the camera and render pipeline", () => {
    expect(parseSceneDocument(validScene).render).toEqual(DEFAULT_SCENE_RENDER);
    const settings = normalizeSceneRender({ projection: "orthographic", focusDistance: -4, aperture: 1, bloom: 8, vignette: -1, chromaticAberration: 1, toneMapping: "invalid", quality: "ultra" });
    expect(settings).toMatchObject({ projection: "orthographic", focusDistance: 0.5, aperture: 0.0002, bloom: 2, vignette: 0, chromaticAberration: 0.012, toneMapping: "aces", quality: "ultra" });
    expect(SCENE_RENDER_QUALITY).toHaveLength(3);
  });

  it("recovers a valid local library and ignores corrupt storage", () => {
    const entry = { id: "scene-1", ...parseSceneDocument(validScene), updatedAt: "2026-11-24T00:00:00.000Z" };
    expect(readSceneLibrary(JSON.stringify([entry]))).toHaveLength(1);
    expect(readSceneLibrary("{broken")).toEqual([]);
  });
});
