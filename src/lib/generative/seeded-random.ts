export function createSeededRandom(seed: number): () => number {
  if (!Number.isFinite(seed)) {
    throw new RangeError("A finite seed is required.");
  }

  let value = Math.trunc(seed) >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
