import { z } from "zod";

export const vector3Schema = z.object({
  x: z.number().finite().min(-1000).max(1000),
  y: z.number().finite().min(-1000).max(1000),
  z: z.number().finite().min(-1000).max(1000),
});

export const sceneColorSchema = z.string().regex(/^#[\da-fA-F]{6}$/);

export type Vector3Input = z.infer<typeof vector3Schema>;
