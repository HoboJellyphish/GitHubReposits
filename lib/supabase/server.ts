import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookiesToSet = { name: string; value: string; options: CookieOptions }[];

/**
 * Server Supabase client for Server Components, Server Actions and Route
 * Handlers. Uses the request cookie store so auth state stays in sync.
 *
 * (Next.js 14: `cookies()` is synchronous.)
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `set` throws when called from a Server Component (read-only
            // cookies). The middleware refreshes the session, so this is safe
            // to ignore here.
          }
        },
      },
    },
  );
}
