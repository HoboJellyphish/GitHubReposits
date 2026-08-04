import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@/lib/types";

type CookiesToSet = { name: string; value: string; options: CookieOptions }[];

const PROTECTED_PREFIXES = ["/patient", "/caretaker", "/onboarding"];

// Auth pages an already-signed-in user shouldn't see (kept off the list:
// /auth/callback and /auth/update-password, which require the fresh session).
const BOUNCE_IF_AUTHED = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password"];

function homeForRole(role: Role | null): string {
  if (role === "caretaker") return "/caretaker/dashboard";
  if (role === "patient") return "/patient/today";
  return "/onboarding";
}

/**
 * Runs in middleware (Edge runtime). Refreshes the Supabase auth session on
 * every request and enforces the high-level routing rules:
 *
 *  - Unauthenticated users hitting a protected route → /auth/sign-in
 *  - Authenticated users hitting an auth page or "/" → their role home
 *    (or /onboarding when they have no member record yet)
 *
 * Fine-grained role enforcement (patient vs caretaker) lives in the route-group
 * layouts so middleware stays a light single round-trip.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const shouldBounce = pathname === "/" || BOUNCE_IF_AUTHED.includes(pathname);

  // Not signed in → block protected areas.
  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Signed in and landing on a sign-in/up page or the root → go to role home.
  if (shouldBounce) {
    const { data: member } = await supabase
      .from("mt_members")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const url = request.nextUrl.clone();
    url.pathname = homeForRole((member?.role as Role | undefined) ?? null);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
