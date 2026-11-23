import { z } from "zod";

export const motionModeSchema = z.enum(["orbit", "pulse", "shift", "stagger"]);
export const motionEasingSchema = z.enum([
  "ease-in-out",
  "linear",
  "cubic-bezier(.2,.8,.2,1)",
  "steps(5,end)",
]);

export const motionRecipeSchema = z.object({
  schema: z.literal("forma.motion-recipe"),
  version: z.literal(1),
  generator: z.literal("motion-lab.basic-motion"),
  generatorVersion: z.literal("1.0.0"),
  parameters: z.object({
    behavior: motionModeSchema,
    durationSeconds: z.number().finite().min(1).max(8),
    intensity: z.number().int().min(10).max(100),
    easing: motionEasingSchema,
  }).strict(),
}).strict();

export type MotionMode = z.infer<typeof motionModeSchema>;
export type MotionEasing = z.infer<typeof motionEasingSchema>;
export type MotionRecipe = z.infer<typeof motionRecipeSchema>;

export function createMotionRecipe(
  behavior: MotionMode,
  durationSeconds: number,
  intensity: number,
  easing: MotionEasing,
): MotionRecipe {
  return motionRecipeSchema.parse({
    schema: "forma.motion-recipe",
    version: 1,
    generator: "motion-lab.basic-motion",
    generatorVersion: "1.0.0",
    parameters: { behavior, durationSeconds, intensity, easing },
  });
}
