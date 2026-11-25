import { describe, expect, it } from "vitest";
import { createGeneratorPoints, createPlaygroundScene, GENERATORS } from "./playground-scene";
import { createPortableRecipe, parsePortableRecipe, getAnimationMotion } from "./playground-recipe";

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

describe("Portable Playground recipes", () => {
  const recipe = { id: "local", name: "Solar study", generator: "orbital-bloom" as const, seed: 42, density: 64, influence: 75, palette: "citrus" as const, createdAt: "2026-11-24T00:00:00.000Z" };
  it("round-trips a versioned recipe without executable content", () => {
    const portable = createPortableRecipe(recipe);
    const restored = parsePortableRecipe(JSON.stringify(portable));
    expect(restored).toMatchObject({ name: recipe.name, generator: recipe.generator, seed: recipe.seed, density: recipe.density, influence: recipe.influence, palette: recipe.palette });
  });
  it("rejects malformed, unsupported, oversized, and out-of-range imports", () => {
    expect(() => parsePortableRecipe("{")).toThrow(/valid recipe/i);
    expect(() => parsePortableRecipe(JSON.stringify({ format: "other", version: 1, recipe: {} }))).toThrow(/unsupported/i);
    expect(() => parsePortableRecipe(" ".repeat(16_385))).toThrow(/too large/i);
    const invalid = { format: "forma-playground-recipe", version: 1, recipe: { ...createPortableRecipe(recipe).recipe, seed: 10_000_000 } };
    expect(() => parsePortableRecipe(JSON.stringify(invalid))).toThrow(/seed/i);
  });
});


describe("Playground motion modes", () => {
  it("keeps still mode motionless and bounds drift and pulse transforms", () => {
    expect(getAnimationMotion("still", 2)).toEqual({ offsetX: 0, offsetY: 0, scale: 1 });
    const drift = getAnimationMotion("drift", Math.PI / 2);
    expect(Math.abs(drift.offsetX)).toBeLessThanOrEqual(0.012);
    expect(Math.abs(drift.offsetY)).toBeLessThanOrEqual(0.009);
    const pulse = getAnimationMotion("pulse", Math.PI / 2);
    expect(pulse.scale).toBeCloseTo(1.035);
  });
  it("round-trips animation mode and defaults older recipes to still", () => {
    const portable = createPortableRecipe({ id: "motion", name: "Drifting study", generator: "woven-lattice", seed: 8, density: 32, influence: 40, palette: "mineral", animation: "drift", createdAt: new Date(0).toISOString() });
    expect(parsePortableRecipe(JSON.stringify(portable)).animation).toBe("drift");
    const legacy = { ...portable, recipe: { ...portable.recipe, animation: undefined } };
    expect(parsePortableRecipe(JSON.stringify(legacy)).animation).toBe("still");
  });
  it("rejects unknown animation modes in imported recipes", () => {
    const portable = createPortableRecipe({ id: "motion", name: "Pulse", generator: "displacement", seed: 2, density: 24, influence: 20, palette: "atelier", createdAt: new Date(0).toISOString() });
    expect(() => parsePortableRecipe(JSON.stringify({ ...portable, recipe: { ...portable.recipe, animation: "chaos" } }))).toThrow(/animation/i);
  });
});
