import { describe, expect, it } from "vitest";
import { createPoints } from "./playground-experience";

describe("createPoints", () => {
  it("reproduces the same composition for the same seed", () => {
    expect(createPoints(42, 12)).toEqual(createPoints(42, 12));
  });

  it("produces a different composition for a different seed", () => {
    expect(createPoints(42, 12)).not.toEqual(createPoints(43, 12));
  });

  it("respects the requested point count", () => {
    expect(createPoints(42, 7)).toHaveLength(7);
  });
});
