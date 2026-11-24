import { createSeededRandom } from "@/lib/generative/seeded-random";

export type FieldPoint = { x: number; y: number; depth: number; size: number; tone: number };
export const PLAYGROUND_SCENE_HANDOFF_KEY = "forma:scene-studio:incoming-playground:v1";

export function createPoints(seed: number, amount: number): FieldPoint[] {
  const next = createSeededRandom(seed);
  return Array.from({ length: amount }, () => ({
    x: next(), y: next(), depth: next(), size: 0.45 + next() * 0.9, tone: Math.floor(next() * 3),
  }));
}

export function createPlaygroundScene(seed: number, density: number, influence: number) {
  if (!Number.isInteger(density) || density < 1 || density > 96) throw new RangeError("Density must be an integer between 1 and 96.");
  if (!Number.isFinite(influence) || influence < 0 || influence > 100) throw new RangeError("Influence must be between 0 and 100.");
  const palette = ["#f05b3e", "#243bd6", "#c6d83b"];
  const kinds = ["box", "sphere", "torus"] as const;
  const objects = createPoints(seed, density).map((point, index) => ({
    id: index + 1,
    name: `Field / ${String(index + 1).padStart(3, "0")}`,
    kind: kinds[point.tone],
    color: palette[point.tone],
    roughness: 0.28,
    metalness: 0.12,
    emissive: "#000000",
    position: [Number(((point.x - 0.5) * 6).toFixed(3)), Number(((0.5 - point.y) * 4.5).toFixed(3)), Number(((point.depth - 0.5) * 2.4).toFixed(3))] as [number, number, number],
    rotation: [Number((point.depth * 0.6).toFixed(3)), Number((point.x * Math.PI).toFixed(3)), Number((point.y * 0.5).toFixed(3))] as [number, number, number],
    scale: Number((0.3 + point.size * 0.18).toFixed(3)),
    visible: true,
  }));
  return {
    format: "forma-scene",
    version: 1,
    name: `Displacement field / ${String(seed).padStart(3, "0")}`,
    camera: "perspective" as const,
    objects,
    generator: { id: "displacement-field", version: "1.0.0", seed: String(seed), parameters: { density, influence } },
  };
}
