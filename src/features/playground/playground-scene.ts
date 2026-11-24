import { createSeededRandom } from "@/lib/generative/seeded-random";

export type GeneratorId = "displacement" | "orbital-bloom" | "woven-lattice";
export type FieldPoint = { x: number; y: number; depth: number; size: number; tone: number };
export const PLAYGROUND_SCENE_HANDOFF_KEY = "forma:scene-studio:incoming-playground:v1";
export const PLAYGROUND_RECIPE_KEY = "forma:playground:recipes:v1";
const GENERATOR_IDS: GeneratorId[] = ["displacement", "orbital-bloom", "woven-lattice"];

export const GENERATORS: Array<{ id: GeneratorId; number: string; name: string; note: string }> = [
  { id: "displacement", number: "001", name: "Displacement field", note: "A responsive field pushed outward by your cursor." },
  { id: "orbital-bloom", number: "002", name: "Orbital bloom", note: "A radial system of petals, rings, and rotating order." },
  { id: "woven-lattice", number: "003", name: "Woven lattice", note: "A jittered grid that folds into a connected mesh." },
];

export type PlaygroundRecipe = {
  id: string; name: string; generator: GeneratorId; seed: number; density: number; influence: number; palette?: string; createdAt: string;
};

export function createGeneratorPoints(seed: number, amount: number, generator: GeneratorId): FieldPoint[] {
  if (!GENERATOR_IDS.includes(generator)) throw new RangeError("Unknown Playground instrument.");
  if (!Number.isInteger(seed) || seed < 0 || seed > 9_999_999) throw new RangeError("Seed must be an integer from 0 to 9,999,999.");
  if (!Number.isInteger(amount) || amount < 12 || amount > 96) throw new RangeError("Density must be an integer between 12 and 96.");
  const next = createSeededRandom(seed);
  const points = Array.from({ length: amount }, () => ({
    x: next(), y: next(), depth: next(), size: 0.45 + next() * 0.9, tone: Math.floor(next() * 3),
  }));

  if (generator === "orbital-bloom") {
    return points.map((point, index) => {
      const progress = (index + 0.5) / amount;
      const angle = progress * Math.PI * 5.5 + (index % 5) * 0.14 + (point.x - 0.5) * 0.28;
      const radius = 0.06 + Math.sqrt(progress) * 0.43;
      return { ...point, x: 0.5 + Math.cos(angle) * radius, y: 0.5 + Math.sin(angle) * radius, depth: 0.2 + progress * 0.8 };
    });
  }

  if (generator === "woven-lattice") {
    const columns = Math.ceil(Math.sqrt(amount));
    return points.map((point, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const rows = Math.ceil(amount / columns);
      return { ...point, x: (column + 0.5 + (point.x - 0.5) * 0.34) / columns, y: (row + 0.5 + (point.y - 0.5) * 0.34) / rows };
    });
  }

  return points;
}

export function createPoints(seed: number, amount: number): FieldPoint[] {
  return createGeneratorPoints(seed, amount, "displacement");
}

export function createPlaygroundScene(seed: number, density: number, influence: number, generator: GeneratorId = "displacement", paletteColors?: [string, string, string]) {
  if (!Number.isFinite(influence) || influence < 0 || influence > 100) throw new RangeError("Influence must be between 0 and 100.");
  const palette = paletteColors ?? ["#f05b3e", "#243bd6", "#c6d83b"];
  const kinds = ["box", "sphere", "torus"] as const;
  const objects = createGeneratorPoints(seed, density, generator).map((point, index) => {
    const spread = generator === "orbital-bloom" ? 7 : generator === "woven-lattice" ? 6.4 : 6;
    return {
      id: index + 1,
      name: `${generator === "orbital-bloom" ? "Bloom" : generator === "woven-lattice" ? "Weave" : "Field"} / ${String(index + 1).padStart(3, "0")}`,
      kind: kinds[point.tone], color: palette[point.tone], roughness: 0.28, metalness: 0.12, emissive: "#000000",
      position: [Number(((point.x - 0.5) * spread).toFixed(3)), Number(((0.5 - point.y) * 4.5).toFixed(3)), Number(((point.depth - 0.5) * (1.2 + influence / 45)).toFixed(3))] as [number, number, number],
      rotation: [Number((point.depth * 0.6).toFixed(3)), Number((point.x * Math.PI).toFixed(3)), Number((point.y * 0.5).toFixed(3))] as [number, number, number],
      scale: Number((0.3 + point.size * 0.18 + influence / 500).toFixed(3)), visible: true,
    };
  });
  const label = GENERATORS.find((item) => item.id === generator)?.name ?? "Generative study";
  return {
    format: "forma-scene", version: 1, name: `${label} / ${String(seed).padStart(3, "0")}`,
    camera: "perspective" as const, objects,
    generator: { id: generator, version: "1.0.0", seed: String(seed), parameters: { density, influence } },
  };
}
