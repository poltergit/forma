import type { GeneratorId, PlaygroundRecipe } from "./playground-scene";

export type PaletteId = "atelier" | "citrus" | "nocturne" | "mineral";
export type AnimationMode = "still" | "drift" | "pulse";
export type MaterialId = "paper" | "ink" | "metal" | "glass" | "liquid" | "ceramic";

export const PLAYGROUND_MATERIALS: Array<{ id: MaterialId; name: string; note: string }> = [
  { id: "paper", name: "Paper", note: "GRAIN / MATTE" },
  { id: "ink", name: "Ink", note: "DENSE / FLAT" },
  { id: "metal", name: "Metal", note: "SPECULAR / HARD" },
  { id: "glass", name: "Glass", note: "LAYER / TRANSLUCENT" },
  { id: "liquid", name: "Liquid", note: "SOFT / FLUID" },
  { id: "ceramic", name: "Ceramic", note: "GLOSS / GLAZED" },
];

export function getMaterialTreatment(material: MaterialId) {
  const treatments = {
    paper: { alpha: 0.86, stroke: 0.28, highlight: 0.12, shadow: 0, grain: 0.035, blend: "source-over" as GlobalCompositeOperation },
    ink: { alpha: 1, stroke: 0.72, highlight: 0.02, shadow: 0, grain: 0, blend: "multiply" as GlobalCompositeOperation },
    metal: { alpha: 0.96, stroke: 0.62, highlight: 0.68, shadow: 0.18, grain: 0, blend: "source-over" as GlobalCompositeOperation },
    glass: { alpha: 0.48, stroke: 0.9, highlight: 0.82, shadow: 0.08, grain: 0, blend: "screen" as GlobalCompositeOperation },
    liquid: { alpha: 0.78, stroke: 0.42, highlight: 0.54, shadow: 0.1, grain: 0, blend: "source-over" as GlobalCompositeOperation },
    ceramic: { alpha: 0.94, stroke: 0.48, highlight: 0.42, shadow: 0.14, grain: 0, blend: "source-over" as GlobalCompositeOperation },
  };
  return treatments[material];
}

export const PLAYGROUND_PALETTES: Array<{ id: PaletteId; name: string; colors: [string, string, string]; background: string }> = [
  { id: "atelier", name: "Atelier", colors: ["#f05b3e", "#243bd6", "#20211f"], background: "#e8e5dc" },
  { id: "citrus", name: "Citrus", colors: ["#ed5b3b", "#d0df35", "#253c32"], background: "#f0eddf" },
  { id: "nocturne", name: "Nocturne", colors: ["#ff765e", "#7b8cff", "#f3e8ce"], background: "#20211f" },
  { id: "mineral", name: "Mineral", colors: ["#c45b45", "#438b88", "#343b4c"], background: "#e2e4df" },
];

export const PLAYGROUND_PRESETS: Array<{ id: string; name: string; note: string; generator: GeneratorId; density: number; influence: number; palette: PaletteId }> = [
  { id: "soft-pressure", name: "Soft pressure", note: "Quiet geometry, broad response", generator: "displacement", density: 48, influence: 32, palette: "atelier" },
  { id: "solar-flower", name: "Solar flower", note: "Radial energy, saturated color", generator: "orbital-bloom", density: 84, influence: 76, palette: "citrus" },
  { id: "deep-weave", name: "Deep weave", note: "Dense structure, cool mineral tones", generator: "woven-lattice", density: 88, influence: 42, palette: "nocturne" },
  { id: "signal-noise", name: "Signal / noise", note: "Loose field, sharp contrast", generator: "displacement", density: 28, influence: 94, palette: "mineral" },
];

export type PortableRecipe = {
  format: "forma-playground-recipe";
  version: 1;
  exportedAt: string;
  recipe: {
    name: string;
    generator: GeneratorId;
    seed: number;
    density: number;
    influence: number;
    palette: PaletteId;
    animation: AnimationMode;
  };
};

const generatorIds: GeneratorId[] = ["displacement", "orbital-bloom", "woven-lattice"];
const paletteIds: PaletteId[] = ["atelier", "citrus", "nocturne", "mineral"];
const materialIds: MaterialId[] = ["paper", "ink", "metal", "glass", "liquid", "ceramic"];

export function getAnimationMotion(mode: AnimationMode, phase: number) {
  if (mode === "drift") return { offsetX: Math.sin(phase) * 0.012, offsetY: Math.cos(phase * 0.72) * 0.009, scale: 1 };
  if (mode === "pulse") return { offsetX: 0, offsetY: 0, scale: 1 + Math.sin(phase) * 0.035 };
  return { offsetX: 0, offsetY: 0, scale: 1 };
}

export function createPortableRecipe(recipe: PlaygroundRecipe & { palette: PaletteId; animation?: AnimationMode; material?: MaterialId }): PortableRecipe {
  return {
    format: "forma-playground-recipe",
    version: 1,
    exportedAt: new Date().toISOString(),
    recipe: { name: recipe.name.trim().slice(0, 48), generator: recipe.generator, seed: recipe.seed, density: recipe.density, influence: recipe.influence, palette: recipe.palette, animation: recipe.animation ?? "still", material: recipe.material ?? "paper" },
  };
}

export function parsePortableRecipe(input: string): Omit<PlaygroundRecipe, "id" | "createdAt"> & { palette: PaletteId; material: MaterialId } {
  if (input.length > 16_384) throw new RangeError("Recipe file is too large.");
  let value: unknown;
  try { value = JSON.parse(input); } catch { throw new TypeError("This file is not valid recipe JSON."); }
  if (!value || typeof value !== "object") throw new TypeError("Recipe file must contain an object.");
  const envelope = value as Record<string, unknown>;
  const recipe = envelope.recipe as Record<string, unknown> | undefined;
  if (envelope.format !== "forma-playground-recipe" || envelope.version !== 1 || !recipe || typeof recipe !== "object") {
    throw new TypeError("Unsupported FORMA recipe format or version.");
  }
  if (typeof recipe.name !== "string" || !recipe.name.trim() || recipe.name.length > 48) throw new TypeError("Recipe name must be 1–48 characters.");
  if (!generatorIds.includes(recipe.generator as GeneratorId)) throw new TypeError("Recipe uses an unknown instrument.");
  if (!Number.isInteger(recipe.seed) || (recipe.seed as number) < 0 || (recipe.seed as number) > 9_999_999) throw new RangeError("Recipe seed is outside the supported range.");
  if (!Number.isInteger(recipe.density) || (recipe.density as number) < 12 || (recipe.density as number) > 96 || (recipe.density as number) % 4 !== 0) throw new RangeError("Recipe density must be 12–96 in steps of 4.");
  if (!Number.isFinite(recipe.influence) || (recipe.influence as number) < 0 || (recipe.influence as number) > 100 || (recipe.influence as number) % 5 !== 0) throw new RangeError("Recipe influence must be 0–100 in steps of 5.");
  if (!paletteIds.includes(recipe.palette as PaletteId)) throw new TypeError("Recipe uses an unknown palette.");
  const animation = recipe.animation === undefined ? "still" : recipe.animation;
  if (!["still", "drift", "pulse"].includes(animation as string)) throw new TypeError("Recipe uses an unknown animation mode.");
  const material = recipe.material === undefined ? "paper" : recipe.material;\n  if (!materialIds.includes(material as MaterialId)) throw new TypeError("Recipe uses an unknown material.");\n  return { material: material as MaterialId, name: recipe.name.trim(), generator: recipe.generator as GeneratorId, seed: recipe.seed as number, density: recipe.density as number, influence: recipe.influence as number, palette: recipe.palette as PaletteId, animation: animation as AnimationMode };
}
