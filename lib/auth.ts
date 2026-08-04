import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Member, Role } from "@/lib/types";

export function homeForRole(role: Role | null | undefined): string {
  if (role === "caretaker") return "/caretaker/dashboard";
  if (role === "patient") return "/patient/today";
  return "/onboarding";
}

/** The signed-in member row, or null if there is no session / no member yet. */
export async function getMemberContext(): Promise<{
  userId: string;
  email: string | null;
  member: Member | null;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("mt_members")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? null, member: (member as Member) ?? null };
}

/**
 * Guard for the protected route-group layouts. Ensures there's a session and a
 * member row, optionally of a specific role. Redirects otherwise and returns a
 * fully-resolved member so pages can rely on it.
 */
export async function requireMember(expectedRole?: Role): Promise<{
  userId: string;
  email: string | null;
  member: Member;
}> {
  const ctx = await getMemberContext();
  if (!ctx) redirect("/auth/sign-in");
  if (!ctx.member) redirect("/onboarding");
  if (expectedRole && ctx.member.role !== expectedRole) {
    redirect(homeForRole(ctx.member.role));
  }
  return { userId: ctx.userId, email: ctx.email, member: ctx.member };
}
