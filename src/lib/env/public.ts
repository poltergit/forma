import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type PublicSupabaseEnvironment = z.infer<typeof publicEnvSchema>;

export function getPublicSupabaseEnvironment():
  | { configured: true; value: PublicSupabaseEnvironment }
  | { configured: false; missing: string[] } {
  const candidate = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };

  const parsed = publicEnvSchema.safeParse(candidate);

  if (parsed.success) {
    return { configured: true, value: parsed.data };
  }

  return {
    configured: false,
    missing: parsed.error.issues.map((issue) => issue.path.join(".")),
  };
}

export function requirePublicSupabaseEnvironment(): PublicSupabaseEnvironment {
  const result = getPublicSupabaseEnvironment();

  if (!result.configured) {
    throw new Error(
      `Supabase is not configured. Missing or invalid: ${result.missing.join(", ")}. Copy .env.example and add the public project values.`,
    );
  }

  return result.value;
}
