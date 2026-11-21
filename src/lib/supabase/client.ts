"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseEnvironment } from "@/lib/env/public";

export function createSupabaseBrowserClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } =
    requirePublicSupabaseEnvironment();

  return createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
