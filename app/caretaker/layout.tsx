import { requireMember } from "@/lib/auth";
import { PwaManager } from "@/components/pwa/PwaManager";

export const dynamic = "force-dynamic";

export default async function CaretakerLayout({ children }: { children: React.ReactNode }) {
  // Guard the whole caretaker area (role enforcement + redirect to onboarding).
  const { member } = await requireMember("caretaker");

  return (
    <div className="min-h-[100dvh] bg-background">
      {children}
      <PwaManager memberId={member.id} />
    </div>
  );
}
