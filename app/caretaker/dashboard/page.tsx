import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getMedications, getPatients } from "@/lib/queries";
import { toDateKey } from "@/lib/utils";
import { computePatientSummary, medStock } from "@/lib/caretaker";
import type { MedicationWithRelations } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { CARETAKER_NAV } from "@/components/BottomNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/Icon";
import { PatientCard } from "@/components/caretaker/PatientCard";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { member } = await requireMember("caretaker");
  const supabase = createClient();
  const now = new Date();
  const today = toDateKey(now);

  const [patients, meds] = await Promise.all([
    getPatients(member.family_group_id),
    getMedications(member.family_group_id),
  ]);

  const patientIds = patients.map((p) => p.id);
  let logs: { schedule_id: string; status: string; patient_id: string }[] = [];
  if (patientIds.length) {
    const { data } = await supabase
      .from("mt_logs")
      .select("schedule_id,status,patient_id")
      .eq("log_date", today)
      .in("patient_id", patientIds);
    logs = data ?? [];
  }

  const logsByPatient: Record<string, Record<string, { status: string }>> = {};
  for (const l of logs) (logsByPatient[l.patient_id] ??= {})[l.schedule_id] = { status: l.status };

  const medsByPatient: Record<string, MedicationWithRelations[]> = {};
  for (const m of meds) (medsByPatient[m.patient_id] ??= []).push(m);

  const nameById = Object.fromEntries(patients.map((p) => [p.id, p.display_name]));

  const summaries = patients.map((p) =>
    computePatientSummary(p, medsByPatient[p.id] ?? [], logsByPatient[p.id] ?? {}, now),
  );

  const alerts = meds
    .map((m) => medStock(m, nameById[m.patient_id] ?? ""))
    .filter((a) => a.level === "warning" || a.level === "critical");

  return (
    <AppShell
      navItems={CARETAKER_NAV}
      userName={member.display_name}
      settingsHref="/caretaker/settings"
    >
      <RealtimeRefresher channel="dashboard" tables={["mt_logs", "mt_inventory"]} />

      {alerts.length > 0 && (
        <Link
          href="/caretaker/inventory"
          className="mb-6 flex items-center justify-between rounded-xl bg-error px-4 py-3 text-on-error active:opacity-90"
        >
          <div className="flex items-center gap-3">
            <Icon name="warning" filled className="text-[20px]" />
            <span className="font-label-md text-label-md">
              {alerts.length} medication{alerts.length > 1 ? "s" : ""} running low — tap to review
            </span>
          </div>
          <Icon name="chevron_right" />
        </Link>
      )}

      <div className="mb-6 flex flex-col gap-1">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          Today&apos;s overview
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Track your patients&apos; daily adherence
        </p>
      </div>

      {summaries.length === 0 ? (
        <EmptyState
          icon="group_add"
          title="No patients yet"
          description="Add a patient to manage, or share your invite code so they can join."
          action={
            <Link href="/caretaker/patients">
              <Button icon="person_add" fullWidth={false}>
                Add a patient
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2 xl:grid-cols-3">
          {summaries.map((s) => (
            <PatientCard key={s.patient.id} summary={s} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
