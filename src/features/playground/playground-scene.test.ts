import { describe, expect, it } from "vitest";
import { createPoints, createPlaygroundScene } from "./playground-scene";

describe("playground generator", () => {
  it("reproduces the same points for the same seed", () => {
    expect(createPoints(42, 12)).toEqual(createPoints(42, 12));
  });
  it("produces a different composition for a different seed", () => {
    expect(createPoints(42, 12)).not.toEqual(createPoints(43, 12));
  });
  it("respects the requested point count", () => {
    expect(createPoints(42, 7)).toHaveLength(7);
  });
  it("creates a bounded Scene Studio-compatible composition", () => {
    const scene = createPlaygroundScene(27, 64, 58);
    expect(scene.format).toBe("forma-scene");
    expect(scene.objects).toHaveLength(64);
    expect(scene.objects[0]).toMatchObject({ id: 1, visible: true, roughness: 0.28 });
    expect(scene.objects.every((item) => item.position.every(Number.isFinite))).toBe(true);
  });
  it("rejects out-of-range generator parameters", () => {
    expect(() => createPlaygroundScene(1, 100, 50)).toThrow(/density/i);
    expect(() => createPlaygroundScene(1, 24, 101)).toThrow(/influence/i);
  });
});
