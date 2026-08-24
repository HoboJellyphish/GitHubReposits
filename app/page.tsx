import { redirect } from "next/navigation";
import { getMemberContext, homeForRole } from "@/lib/auth";
import { LandingPage } from "@/components/marketing/LandingPage";

export const dynamic = "force-dynamic";

/**
 * Public landing page. Signed-in users are routed straight into the app
 * (caretaker dashboard / patient today, or onboarding if not set up yet);
 * everyone else sees the marketing page with sign-in / get-started CTAs.
 */
export default async function RootPage() {
  const ctx = await getMemberContext();
  if (ctx) redirect(homeForRole(ctx.member?.role));
  return <LandingPage />;
}
