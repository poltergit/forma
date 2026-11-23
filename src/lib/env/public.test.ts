import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublicSupabaseEnvironment,
  requirePublicSupabaseEnvironment,
} from "./public";

describe("public Supabase environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports missing configuration without throwing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(getPublicSupabaseEnvironment()).toEqual({
      configured: false,
      missing: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      ],
    });
  });

  it("returns validated public configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://forma-test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");

    expect(getPublicSupabaseEnvironment()).toEqual({
      configured: true,
      value: {
        NEXT_PUBLIC_SUPABASE_URL: "https://forma-test.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      },
    });
  });

  it("fails loudly when a required public value is invalid", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(requirePublicSupabaseEnvironment).toThrow(
      "Supabase is not configured.",
    );
  });
});
