import { describe, expect, it } from "vitest";
import { createSeededRandom } from "./seeded-random";

describe("createSeededRandom", () => {
  it("reproduces a sequence for the same seed", () => {
    const first = createSeededRandom(27);
    const second = createSeededRandom(27);
    expect(Array.from({ length: 8 }, first)).toEqual(Array.from({ length: 8 }, second));
  });

  it("returns values in the half-open unit interval", () => {
    const random = createSeededRandom(2026);
    for (let index = 0; index < 64; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("rejects non-finite seeds", () => {
    expect(() => createSeededRandom(Number.NaN)).toThrow(RangeError);
  });
});
