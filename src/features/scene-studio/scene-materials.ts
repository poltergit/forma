import type { SceneObjectDocument } from "./scene-document";
export type SceneMaterialId = "paper" | "ink" | "metal" | "glass" | "liquid" | "ceramic";
export type PhysicalMaterial = Pick<SceneObjectDocument, "roughness" | "metalness" | "transmission" | "thickness" | "ior" | "clearcoat" | "clearcoatRoughness" | "opacity" | "emissive">;
export const SCENE_MATERIAL_PRESETS: Array<{ id: SceneMaterialId; name: string; descriptor: string }> = [
  { id: "paper", name: "Paper", descriptor: "Dry · diffuse" }, { id: "ink", name: "Ink", descriptor: "Dense · matte" },
  { id: "metal", name: "Metal", descriptor: "Reflective · hard" }, { id: "glass", name: "Glass", descriptor: "Optical · transmissive" },
  { id: "liquid", name: "Liquid", descriptor: "Fluid · coated" }, { id: "ceramic", name: "Ceramic", descriptor: "Glazed · polished" },
];
const presets: Record<SceneMaterialId, PhysicalMaterial> = {
  paper: { roughness:.94, metalness:.02, transmission:0, thickness:0, ior:1.5, clearcoat:0, clearcoatRoughness:0, opacity:1, emissive:"#000000" },
  ink: { roughness:.98, metalness:0, transmission:0, thickness:0, ior:1.5, clearcoat:0, clearcoatRoughness:0, opacity:1, emissive:"#000000" },
  metal: { roughness:.2, metalness:.88, transmission:0, thickness:0, ior:1.5, clearcoat:.22, clearcoatRoughness:.16, opacity:1, emissive:"#080808" },
  glass: { roughness:.035, metalness:0, transmission:1, thickness:.85, ior:1.48, clearcoat:.95, clearcoatRoughness:.025, opacity:1, emissive:"#080d18" },
  liquid: { roughness:.075, metalness:.12, transmission:.82, thickness:1.35, ior:1.36, clearcoat:1, clearcoatRoughness:.035, opacity:1, emissive:"#090d16" },
  ceramic: { roughness:.16, metalness:.025, transmission:0, thickness:0, ior:1.5, clearcoat:.82, clearcoatRoughness:.12, opacity:1, emissive:"#080604" },
};
export function getSceneMaterialPreset(id: SceneMaterialId): PhysicalMaterial { return { ...presets[id] }; }
export function applySceneMaterialPreset<T extends Pick<SceneObjectDocument, "roughness" | "metalness" | "emissive">>(target: T, id: SceneMaterialId): T & PhysicalMaterial {
  return { ...target, ...getSceneMaterialPreset(id) };
}
