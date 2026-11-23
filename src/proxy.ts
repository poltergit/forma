import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseEnvironment } from "@/lib/env/public";

export async function proxy(request: NextRequest) {
  const environment = getPublicSupabaseEnvironment();

  // The public foundation remains usable before a Supabase project is
  // configured. Authenticated features will show an explicit setup state.
  if (!environment.configured) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    environment.value.NEXT_PUBLIC_SUPABASE_URL,
    environment.value.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // getClaims validates the access token and allows the SSR client to refresh
  // an expired session. Authorization must still be enforced by the server
  // and PostgreSQL RLS at each protected data boundary.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
