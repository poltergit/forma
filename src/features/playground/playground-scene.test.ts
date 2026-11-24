import { describe, expect, it } from "vitest";
import { createGeneratorPoints, createPlaygroundScene, GENERATORS } from "./playground-scene";

describe("Playground generator registry", () => {
  it("exposes three distinct instruments", () => {
    expect(GENERATORS.map((item) => item.id)).toEqual(["displacement", "orbital-bloom", "woven-lattice"]);
  });
  it("reproduces the same output for the same instrument, seed, and density", () => {
    for (const generator of GENERATORS) expect(createGeneratorPoints(42, 24, generator.id)).toEqual(createGeneratorPoints(42, 24, generator.id));
  });
  it("changes logical output when the seed changes", () => {
    expect(createGeneratorPoints(42, 24, "orbital-bloom")).not.toEqual(createGeneratorPoints(43, 24, "orbital-bloom"));
  });
  it("creates visibly distinct point systems for each instrument", () => {
    const displacement = createGeneratorPoints(42, 36, "displacement");
    const bloom = createGeneratorPoints(42, 36, "orbital-bloom");
    const lattice = createGeneratorPoints(42, 36, "woven-lattice");
    expect(bloom).not.toEqual(displacement);
    expect(lattice).not.toEqual(displacement);
    expect(bloom).not.toEqual(lattice);
  });
  it("enforces generator, density, and seed bounds", () => {
    expect(() => createGeneratorPoints(1, 11, "displacement")).toThrow(/density/i);
    expect(() => createGeneratorPoints(1, 100, "displacement")).toThrow(/density/i);
    expect(() => createGeneratorPoints(-1, 24, "displacement")).toThrow(/seed/i);
    expect(() => createGeneratorPoints(1, 24, "invalid" as never)).toThrow(/instrument/i);
  });
  it("exports each instrument as an editable Scene Studio document", () => {
    for (const generator of GENERATORS) {
      const scene = createPlaygroundScene(27, 64, 58, generator.id);
      expect(scene.format).toBe("forma-scene");
      expect(scene.objects).toHaveLength(64);
      expect(scene.name).toContain(generator.name);
      expect(scene.objects.every((item) => item.position.every(Number.isFinite))).toBe(true);
    }
  });
  it("rejects out-of-range influence values", () => {
    expect(() => createPlaygroundScene(1, 24, 101)).toThrow(/influence/i);
  });
});
