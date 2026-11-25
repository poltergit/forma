import { z } from "zod";

export const PLAYGROUND_MOTION_HANDOFF_KEY = "forma:atelier:playground-to-motion:v1";
export const ARCHIVE_IMPRINTS_KEY = "forma:archive:imprints:v1";

const generatorSchema = z.enum(["displacement", "orbital-bloom", "woven-lattice"]);
const paletteSchema = z.enum(["atelier", "citrus", "nocturne", "mineral"]);
const materialSchema = z.enum(["paper", "ink", "metal", "glass", "liquid", "ceramic"]);
const animationSchema = z.enum(["still", "drift", "pulse"]);
const timestampSchema = z.string().max(40).refine((value) => !Number.isNaN(Date.parse(value)), "Expected a valid timestamp");

export const playgroundMotionHandoffSchema = z.object({
  version: z.literal(1),
  source: z.literal("playground"),
  title: z.string().trim().min(1).max(48),
  generator: generatorSchema,
  seed: z.number().int().min(0).max(9_999_999),
  density: z.number().int().min(12).max(96),
  influence: z.number().int().min(0).max(100),
  palette: paletteSchema,
  animation: animationSchema,
  material: materialSchema,
  createdAt: timestampSchema,
}).strict();

export type PlaygroundMotionHandoff = z.infer<typeof playgroundMotionHandoffSchema>;

const imprintParametersSchema = z.record(z.string(), z.union([z.string().max(80), z.number().finite()]));
export const archiveImprintSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().trim().min(1).max(48),
  room: z.enum(["OPEN FIELD", "FORCE ROOM", "WORKBENCH"]),
  detail: z.string().trim().min(1).max(180),
  href: z.string().regex(/^\/(playground|motion-lab|scene-studio)(\?.*)?$/),
  createdAt: timestampSchema,
  parameters: imprintParametersSchema,
}).strict();

export type ArchiveImprint = z.infer<typeof archiveImprintSchema>;

export function createPlaygroundMotionHandoff(input: Omit<PlaygroundMotionHandoff, "version" | "source" | "createdAt"> & { createdAt?: string }): PlaygroundMotionHandoff {
  return playgroundMotionHandoffSchema.parse({ ...input, version: 1, source: "playground", createdAt: input.createdAt ?? new Date().toISOString() });
}

export function parsePlaygroundMotionHandoff(input: unknown): PlaygroundMotionHandoff | null {
  const result = playgroundMotionHandoffSchema.safeParse(input);
  return result.success ? result.data : null;
}

export function parseArchiveImprints(input: unknown): ArchiveImprint[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap((item) => {
    const result = archiveImprintSchema.safeParse(item);
    return result.success ? [result.data] : [];
  }).slice(0, 40);
}

export function createArchiveImprint(input: ArchiveImprint): ArchiveImprint {
  return archiveImprintSchema.parse(input);
}

export function readArchiveImprints(): ArchiveImprint[] {
  try {
    return parseArchiveImprints(JSON.parse(window.localStorage.getItem(ARCHIVE_IMPRINTS_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function saveArchiveImprint(imprint: ArchiveImprint): ArchiveImprint[] {
  const validated = archiveImprintSchema.parse(imprint);
  const next = [validated, ...readArchiveImprints().filter((item) => item.id !== validated.id)].slice(0, 40);
  // Keep quota/security failures visible to the calling instrument so it can report the
  // failure instead of claiming that a trace was preserved.
  window.localStorage.setItem(ARCHIVE_IMPRINTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("forma:archive-updated"));
  return next;
}

export function readPlaygroundMotionHandoff(): PlaygroundMotionHandoff | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PLAYGROUND_MOTION_HANDOFF_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  // A handoff is a one-time message. Attempt removal independently so blocked storage
  // cannot turn a malformed or unreadable handoff into an uncaught runtime error.
  try {
    window.localStorage.removeItem(PLAYGROUND_MOTION_HANDOFF_KEY);
  } catch {
    // The validated payload can still be consumed for this visit.
  }

  try {
    return parsePlaygroundMotionHandoff(JSON.parse(raw));
  } catch {
    return null;
  }
}
