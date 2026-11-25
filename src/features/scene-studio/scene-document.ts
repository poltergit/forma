export type SceneObjectDocument = {
  id: number; name: string; kind: "box" | "sphere" | "torus"; color: string;
  roughness: number; metalness: number; emissive: string;
  transmission: number; thickness: number; ior: number; clearcoat: number;
  clearcoatRoughness: number; opacity: number;
  position: [number, number, number]; rotation: [number, number, number]; scale: number; visible: boolean;
};
export type SceneDocument = { id: string; name: string; camera: "perspective" | "front" | "top" | "side"; objects: SceneObjectDocument[]; updatedAt: string; revision?: number };
export const SCENE_STORAGE_KEY = "forma:scene-studio:compositions:v1";
const physicalDefaults = { transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0, clearcoatRoughness: 0, opacity: 1 };
function isVector(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every((part) => typeof part === "number" && Number.isFinite(part));
}
function isSceneObject(value: unknown): value is SceneObjectDocument {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const validPhysical = Object.entries(physicalDefaults).every(([key]) => {
    const value = item[key];
    if (value === undefined) return true;
    if (typeof value !== "number" || !Number.isFinite(value)) return false;
    return key === "thickness" ? value >= 0 && value <= 5 : key === "ior" ? value >= 1 && value <= 2.333 : value >= 0 && value <= 1;
  });
  return Number.isInteger(item.id) && typeof item.name === "string" && item.name.trim().length > 0 && item.name.length <= 80 &&
    ["box", "sphere", "torus"].includes(String(item.kind)) && typeof item.color === "string" && /^#[\da-f]{6}$/i.test(item.color) &&
    typeof item.emissive === "string" && /^#[\da-f]{6}$/i.test(item.emissive) &&
    typeof item.roughness === "number" && item.roughness >= 0 && item.roughness <= 1 &&
    typeof item.metalness === "number" && item.metalness >= 0 && item.metalness <= 1 && validPhysical &&
    isVector(item.position) && isVector(item.rotation) && typeof item.scale === "number" && Number.isFinite(item.scale) && item.scale > 0 && item.scale <= 100 &&
    typeof item.visible === "boolean";
}
function normalizeSceneObject(item: Record<string, unknown>): SceneObjectDocument {
  return { ...item, ...Object.fromEntries(Object.entries(physicalDefaults).map(([key, fallback]) => [key, item[key] ?? fallback])) } as unknown as SceneObjectDocument;
}
export function parseSceneDocument(input: unknown): Omit<SceneDocument, "id" | "updatedAt"> {
  if (!input || typeof input !== "object") throw new Error("This file is not a FORMA scene.");
  const data = input as Record<string, unknown>;
  if (data.format !== "forma-scene" || data.version !== 1) throw new Error("Unsupported FORMA scene format or version.");
  if (typeof data.name !== "string" || !data.name.trim()) throw new Error("The scene needs a name.");
  if (!["perspective", "front", "top", "side"].includes(String(data.camera))) throw new Error("The scene camera is invalid.");
  if (!Array.isArray(data.objects) || data.objects.length < 1 || data.objects.length > 250 || !data.objects.every(isSceneObject)) throw new Error("The scene contains invalid objects. Import a valid FORMA JSON export.");
  return { name: data.name.slice(0, 80), camera: data.camera as SceneDocument["camera"], objects: data.objects.map((item) => normalizeSceneObject(item as Record<string, unknown>)) };
}
export function readSceneLibrary(raw: string | null): SceneDocument[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is SceneDocument => {
      if (!entry || typeof entry !== "object") return false;
      const item = entry as Record<string, unknown>;
      return typeof item.id === "string" && typeof item.name === "string" && typeof item.updatedAt === "string" &&
        ["perspective", "front", "top", "side"].includes(String(item.camera)) && Array.isArray(item.objects) &&
        item.objects.length > 0 && item.objects.length <= 250 && item.objects.every(isSceneObject);
    }).map((entry) => ({ ...entry, objects: entry.objects.map((item) => normalizeSceneObject(item as unknown as Record<string, unknown>)) })).slice(0, 100);
  } catch { return []; }
}
