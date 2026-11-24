import { describe, expect, it } from "vitest";
import { parseSceneDocument, readSceneLibrary } from "./scene-document";

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

  it("recovers a valid local library and ignores corrupt storage", () => {
    const entry = { id: "scene-1", ...parseSceneDocument(validScene), updatedAt: "2026-11-24T00:00:00.000Z" };
    expect(readSceneLibrary(JSON.stringify([entry]))).toHaveLength(1);
    expect(readSceneLibrary("{broken")).toEqual([]);
  });
});
