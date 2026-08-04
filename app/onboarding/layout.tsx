import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberContext, homeForRole } from "@/lib/auth";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getMemberContext();
  if (!ctx) redirect("/auth/sign-in");
  // Already set up → straight to the app.
  if (ctx.member) redirect(homeForRole(ctx.member.role));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="sticky top-0 z-10 w-full bg-background">
        <div className="mx-auto flex h-14 w-full max-w-max-width-content items-center justify-center px-margin-mobile">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Icon name="medication" filled className="text-[28px]" />
            <span className="font-headline-md text-headline-md tracking-tight">MedTrak</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-max-width-content flex-grow px-margin-mobile pb-16 pt-8">
        {children}
      </main>
    </div>
  );
}
