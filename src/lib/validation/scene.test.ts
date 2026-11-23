import { describe, expect, it } from "vitest";
import { sceneColorSchema, vector3Schema } from "./scene";

describe("scene boundary schemas", () => {
  it("accepts finite vectors inside the editor range", () => {
    expect(vector3Schema.safeParse({ x: 0, y: -2.5, z: 100 }).success).toBe(true);
  });

  it("rejects non-finite and out-of-range vector values", () => {
    expect(vector3Schema.safeParse({ x: Number.NaN, y: 0, z: 0 }).success).toBe(false);
    expect(vector3Schema.safeParse({ x: 1001, y: 0, z: 0 }).success).toBe(false);
  });

  it("accepts six-digit hex colors only", () => {
    expect(sceneColorSchema.safeParse("#C7F36B").success).toBe(true);
    expect(sceneColorSchema.safeParse("lime").success).toBe(false);
  });
});
