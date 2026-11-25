export type SceneRenderDocument = {
  projection: "perspective" | "orthographic";
  focusDistance: number;
  aperture: number;
  bloom: number;
  vignette: number;
  chromaticAberration: number;
  toneMapping: "aces" | "linear" | "neutral" | "none";
  quality: "draft" | "studio" | "ultra";
};

export const DEFAULT_SCENE_RENDER: SceneRenderDocument = {
  projection: "perspective",
  focusDistance: 5,
  aperture: 0.00008,
  bloom: 0.28,
  vignette: 0.22,
  chromaticAberration: 0,
  toneMapping: "aces",
  quality: "studio",
};

const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function normalizeSceneRender(input: unknown): SceneRenderDocument {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    projection: value.projection === "orthographic" ? "orthographic" : "perspective",
    focusDistance: clamp(value.focusDistance, 0.5, 20, DEFAULT_SCENE_RENDER.focusDistance),
    aperture: clamp(value.aperture, 0, 0.0002, DEFAULT_SCENE_RENDER.aperture),
    bloom: clamp(value.bloom, 0, 2, DEFAULT_SCENE_RENDER.bloom),
    vignette: clamp(value.vignette, 0, 1, DEFAULT_SCENE_RENDER.vignette),
    chromaticAberration: clamp(value.chromaticAberration, 0, 0.012, DEFAULT_SCENE_RENDER.chromaticAberration),
    toneMapping: value.toneMapping === "linear" || value.toneMapping === "neutral" || value.toneMapping === "none" ? value.toneMapping : "aces",
    quality: value.quality === "draft" || value.quality === "ultra" ? value.quality : "studio",
  };
}

export const SCENE_RENDER_QUALITY = [
  { id: "draft", name: "Draft", detail: "Fast iteration · 1× pixel ratio" },
  { id: "studio", name: "Studio", detail: "Balanced detail · 1.5× pixel ratio" },
  { id: "ultra", name: "Ultra", detail: "High fidelity · 2× pixel ratio" },
] as const;
