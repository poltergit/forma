export type SceneObjectDocument = {
  id: number;
  name: string;
  kind: "box" | "sphere" | "torus";
  color: string;
  roughness: number;
  metalness: number;
  emissive: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  visible: boolean;
};

export type SceneDocument = {
  id: string;
  name: string;
  camera: "perspective" | "front" | "top" | "side";
  objects: SceneObjectDocument[];
  updatedAt: string;
  revision?: number;
};

export const SCENE_STORAGE_KEY = "forma:scene-studio:compositions:v1";

function isVector(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every((part) => typeof part === "number" && Number.isFinite(part));
}

function isSceneObject(value: unknown): value is SceneObjectDocument {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return Number.isInteger(item.id) && typeof item.name === "string" &&
    ["box", "sphere", "torus"].includes(String(item.kind)) &&
    typeof item.color === "string" && /^#[\da-f]{6}$/i.test(item.color) &&
    typeof item.emissive === "string" && /^#[\da-f]{6}$/i.test(item.emissive) &&
    typeof item.roughness === "number" && item.roughness >= 0 && item.roughness <= 1 &&
    typeof item.metalness === "number" && item.metalness >= 0 && item.metalness <= 1 &&
    isVector(item.position) && isVector(item.rotation) &&
    typeof item.scale === "number" && Number.isFinite(item.scale) && item.scale > 0 && item.scale <= 100 &&
    typeof item.visible === "boolean";
}

export function parseSceneDocument(input: unknown): Omit<SceneDocument, "id" | "updatedAt"> {
  if (!input || typeof input !== "object") throw new Error("This file is not a FORMA scene.");
  const data = input as Record<string, unknown>;
  if (data.format !== "forma-scene" || data.version !== 1) throw new Error("Unsupported FORMA scene format or version.");
  if (typeof data.name !== "string" || !data.name.trim()) throw new Error("The scene needs a name.");
  if (!["perspective", "front", "top", "side"].includes(String(data.camera))) throw new Error("The scene camera is invalid.");
  if (!Array.isArray(data.objects) || data.objects.length < 1 || data.objects.length > 250 || !data.objects.every(isSceneObject)) {
    throw new Error("The scene contains invalid objects. Import a valid FORMA JSON export.");
  }
  return { name: data.name.slice(0, 80), camera: data.camera as SceneDocument["camera"], objects: data.objects };
}

export function readSceneLibrary(raw: string | null): SceneDocument[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is SceneDocument => {
      if (!entry || typeof entry !== "object") return false;
      const item = entry as Record<string, unknown>;
      return typeof item.id === "string" && typeof item.name === "string" &&
        typeof item.updatedAt === "string" && ["perspective", "front", "top", "side"].includes(String(item.camera)) &&
        Array.isArray(item.objects) && item.objects.length > 0 && item.objects.every(isSceneObject);
    }).slice(0, 100);
  } catch {
    return [];
  }
}
