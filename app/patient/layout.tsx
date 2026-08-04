import { requireMember } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { PATIENT_NAV } from "@/components/BottomNav";
import { PwaManager } from "@/components/pwa/PwaManager";

export const dynamic = "force-dynamic";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const { member } = await requireMember("patient");

  return (
    <AppShell navItems={PATIENT_NAV} userName={member.display_name} settingsHref="/patient/settings">
      {children}
      <PwaManager memberId={member.id} />
    </AppShell>
  );
}
