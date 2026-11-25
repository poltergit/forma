import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ARCHIVE_IMPRINTS_KEY, PLAYGROUND_MOTION_HANDOFF_KEY,
  createArchiveImprint, createPlaygroundMotionHandoff, parseArchiveImprints,
  parsePlaygroundMotionHandoff, readArchiveImprints, readPlaygroundMotionHandoff, saveArchiveImprint,
} from "./atelier-bridge";

describe("atelier bridge", () => {
  beforeEach(() => window.localStorage.clear());

  it("creates a bounded Playground-to-Motion handoff", () => {
    const handoff = createPlaygroundMotionHandoff({
      title: "Orbit field", generator: "orbital-bloom", seed: 42, density: 64,
      influence: 75, palette: "citrus", animation: "drift", material: "glass",
    });
    expect(parsePlaygroundMotionHandoff(handoff)).toEqual(handoff);
  });

  it("rejects malformed, out-of-range, and invalid-date handoffs", () => {
    expect(parsePlaygroundMotionHandoff({ version: 1, source: "playground", title: "Bad", generator: "noise", seed: -1 })).toBeNull();
    expect(parsePlaygroundMotionHandoff({
      ...createPlaygroundMotionHandoff({ title: "Bad date", generator: "displacement", seed: 1, density: 12, influence: 0, palette: "atelier", animation: "still", material: "paper" }),
      createdAt: "not-a-date",
    })).toBeNull();
  });

  it("validates archive imprints and ignores corrupt stored entries", () => {
    const imprint = createArchiveImprint({
      id: "field-42", title: "Orbit field", room: "OPEN FIELD", detail: "64 forms · 75% influence",
      href: "/playground?generator=orbital-bloom&seed=42", createdAt: new Date(0).toISOString(),
      parameters: { generator: "orbital-bloom", seed: 42, density: 64, influence: 75 },
    });
    expect(parseArchiveImprints([imprint, { ...imprint, href: "https://example.com" }])).toEqual([imprint]);
    expect(parseArchiveImprints([{ ...imprint, createdAt: "yesterday" }])).toEqual([]);
  });

  it("caps archive records at forty", () => {
    const records = Array.from({ length: 45 }, (_, index) => ({
      id: String(index), title: "Study", room: "OPEN FIELD", detail: "A saved field",
      href: "/playground", createdAt: new Date(0).toISOString(), parameters: { seed: index },
    }));
    expect(parseArchiveImprints(records)).toHaveLength(40);
  });

  it("round-trips an archive imprint and emits an update event", () => {
    const listener = vi.fn();
    window.addEventListener("forma:archive-updated", listener);
    const imprint = createArchiveImprint({
      id: "round-trip", title: "A trace", room: "FORCE ROOM", detail: "A motion score",
      href: "/motion-lab?mode=orbit", createdAt: new Date(0).toISOString(),
      parameters: { mode: "orbit", duration: 4 },
    });
    expect(saveArchiveImprint(imprint)).toEqual([imprint]);
    expect(readArchiveImprints()).toEqual([imprint]);
    expect(window.localStorage.getItem(ARCHIVE_IMPRINTS_KEY)).toContain("round-trip");
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("forma:archive-updated", listener);
  });

  it("fails safely when archive storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    expect(readArchiveImprints()).toEqual([]);
  });

  it("consumes a valid handoff once", () => {
    const handoff = createPlaygroundMotionHandoff({
      title: "Orbit field", generator: "orbital-bloom", seed: 42, density: 64,
      influence: 75, palette: "citrus", animation: "drift", material: "glass",
    });
    window.localStorage.setItem(PLAYGROUND_MOTION_HANDOFF_KEY, JSON.stringify(handoff));
    expect(readPlaygroundMotionHandoff()).toEqual(handoff);
    expect(window.localStorage.getItem(PLAYGROUND_MOTION_HANDOFF_KEY)).toBeNull();
    expect(readPlaygroundMotionHandoff()).toBeNull();
  });

  it("does not throw when handoff storage access is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    expect(readPlaygroundMotionHandoff()).toBeNull();
  });
});
