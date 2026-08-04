import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/utils";
import { buildDoseItems, type LogMap } from "@/lib/dose";
import { computePatientSummary, STATUS_META } from "@/lib/caretaker";
import { getReadings } from "@/lib/readings";
import type { Member, MedicationWithRelations } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { DoseList } from "@/components/patient/DoseList";
import { VitalsPanel } from "@/components/vitals/VitalsPanel";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: { patientId: string };
}) {
  const { member } = await requireMember("caretaker");
  const supabase = createClient();
  const now = new Date();
  const today = toDateKey(now);

  const { data: patient } = await supabase
    .from("mt_members")
    .select("*")
    .eq("id", params.patientId)
    .eq("family_group_id", member.family_group_id)
    .maybeSingle();
  if (!patient) notFound();
  const typedPatient = patient as Member;

  const [{ data: meds }, { data: logs }] = await Promise.all([
    supabase
      .from("mt_medications")
      .select("*, mt_schedules(*)")
      .eq("patient_id", typedPatient.id)
      .eq("is_active", true),
    supabase
      .from("mt_logs")
      .select("id,schedule_id,status,taken_at")
      .eq("patient_id", typedPatient.id)
      .eq("log_date", today),
  ]);

  const readings = await getReadings(typedPatient.id);
  const typedMeds = (meds ?? []) as MedicationWithRelations[];
  const items = buildDoseItems(typedMeds, now);
  const initialLogs = Object.fromEntries(
    (logs ?? []).map((l) => [l.schedule_id, l]),
  ) as LogMap;
  const logsBySchedule = Object.fromEntries(
    (logs ?? []).map((l) => [l.schedule_id, { status: l.status }]),
  );
  const summary = computePatientSummary(typedPatient, typedMeds, logsBySchedule, now);
  const meta = STATUS_META[summary.status];

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-max-width-content flex-col">
      <PageHeader
        title={typedPatient.display_name}
        backHref="/caretaker/patients"
        right={
          <Link
            href={`/caretaker/medications?patient=${typedPatient.id}`}
            aria-label="Manage medications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low"
          >
            <Icon name="edit_note" />
          </Link>
        }
      />
      <main className="flex-1 space-y-8 px-margin-mobile pb-16 pt-4">
        <p className="-mt-2 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">
          Viewing as caretaker
        </p>

        {/* Today overview */}
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant">
                Today&apos;s adherence
              </span>
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
                {summary.percent}%
              </span>
            </div>
            <Chip tone={meta.tone} icon={meta.icon}>
              {meta.label}
            </Chip>
          </div>
          <ProgressBar
            value={summary.percent}
            tone={summary.status === "attention" ? "warning" : "success"}
          />
          <p className="font-body-md text-body-md text-on-surface-variant">
            {summary.taken} of {summary.due} doses taken
            {summary.missed > 0 ? ` · ${summary.missed} missed` : ""}
          </p>
        </Card>

        {/* Health readings — trends + logging */}
        <VitalsPanel patientId={typedPatient.id} readings={readings} />

        <Link
          href={`/caretaker/medications?patient=${typedPatient.id}`}
          className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low"
        >
          <span className="flex items-center gap-3 font-button-text text-button-text text-primary">
            <Icon name="medication" /> Manage medications
          </span>
          <Icon name="chevron_right" className="text-on-surface-variant" />
        </Link>

        <div>
          <h2 className="mb-4 font-headline-md text-headline-md text-primary">Daily schedule</h2>
          <DoseList
            patientId={typedPatient.id}
            today={today}
            items={items}
            initialLogs={initialLogs}
          />
        </div>
      </main>
    </div>
  );
}
