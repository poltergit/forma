import { beforeEach, describe, expect, it } from "vitest";
import {
  createArchiveImprint, createPlaygroundMotionHandoff, parseArchiveImprints,
  parsePlaygroundMotionHandoff,
} from "./atelier-bridge";

describe("atelier bridge", () => {
  it("creates a bounded Playground-to-Motion handoff", () => {
    const handoff = createPlaygroundMotionHandoff({
      title: "Orbit field", generator: "orbital-bloom", seed: 42, density: 64,
      influence: 75, palette: "citrus", animation: "drift", material: "glass",
    });
    expect(parsePlaygroundMotionHandoff(handoff)).toEqual(handoff);
  });

  it("rejects malformed or out-of-range handoffs", () => {
    expect(parsePlaygroundMotionHandoff({ version: 1, source: "playground", title: "Bad", generator: "noise", seed: -1 })).toBeNull();
  });

  it("validates archive imprints and ignores corrupt stored entries", () => {
    const imprint = createArchiveImprint({
      id: "field-42", title: "Orbit field", room: "OPEN FIELD", detail: "64 forms · 75% influence",
      href: "/playground?generator=orbital-bloom&seed=42", createdAt: new Date(0).toISOString(),
      parameters: { generator: "orbital-bloom", seed: 42, density: 64, influence: 75 },
    });
    expect(parseArchiveImprints([imprint, { ...imprint, href: "https://example.com" }])).toEqual([imprint]);
  });

  it("caps archive records at forty", () => {
    const records = Array.from({ length: 45 }, (_, index) => ({
      id: String(index), title: "Study", room: "OPEN FIELD", detail: "A saved field",
      href: "/playground", createdAt: new Date(0).toISOString(), parameters: { seed: index },
    }));
    expect(parseArchiveImprints(records)).toHaveLength(40);
  });
});
