import { describe, expect, it } from "vitest";
import { createMotionRecipe, motionRecipeSchema } from "./motion-recipe";

describe("motion recipe", () => {
  it("creates a stable, serializable recipe from the selected parameters", () => {
    const recipe = createMotionRecipe("pulse", 2, 85, "cubic-bezier(.2,.8,.2,1)");
    expect(JSON.parse(JSON.stringify(recipe))).toEqual(recipe);
    expect(recipe.parameters).toEqual({
      behavior: "pulse",
      durationSeconds: 2,
      intensity: 85,
      easing: "cubic-bezier(.2,.8,.2,1)",
    });
  });

  it("rejects parameters outside the supported instrument bounds", () => {
    expect(() => createMotionRecipe("orbit", 9, 50, "linear")).toThrow();
    expect(() => createMotionRecipe("orbit", 4, 105, "linear")).toThrow();
  });

  it("rejects unknown fields in imported recipe data", () => {
    const recipe = createMotionRecipe("orbit", 4, 50, "ease-in-out");
    expect(motionRecipeSchema.safeParse({ ...recipe, executable: "not allowed" }).success).toBe(false);
  });
});
