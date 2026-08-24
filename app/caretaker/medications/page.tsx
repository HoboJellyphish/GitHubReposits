import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { getMedications, getPatients } from "@/lib/queries";
import { formIcon, slotMeta, FREQUENCIES } from "@/lib/constants";
import { dosageLabel } from "@/lib/dose";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/Icon";
import type { MedicationWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Medications" };

function scheduleSummary(med: MedicationWithRelations): string {
  const active = (med.mt_schedules ?? []).filter((s) => s.is_active !== false);
  const freq = FREQUENCIES.find((f) => f.key === active[0]?.frequency)?.label ?? "Daily";
  const slots = active.map((s) => slotMeta(s.time_label).label).join(", ");
  return [freq, slots].filter(Boolean).join(" · ");
}

export default async function MedicationsPage({
  searchParams,
}: {
  searchParams: { patient?: string };
}) {
  const { member } = await requireMember("caretaker");
  const patientId = searchParams.patient;

  const [patients, meds] = await Promise.all([
    getPatients(member.family_group_id),
    getMedications(member.family_group_id, patientId),
  ]);

  const patient = patientId ? patients.find((p) => p.id === patientId) : undefined;
  const backHref = patient ? `/caretaker/patients/${patient.id}` : "/caretaker/dashboard";
  const addHref = patientId
    ? `/caretaker/medications/add?patient=${patientId}`
    : "/caretaker/medications/add";

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-max-width-content flex-col">
      <PageHeader
        title={patient ? `${patient.display_name}'s meds` : "Medications"}
        backHref={backHref}
        right={
          <Link
            href={addHref}
            aria-label="Add medication"
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low"
          >
            <Icon name="add" />
          </Link>
        }
      />
      <main className="flex-1 space-y-4 px-margin-mobile pb-16 pt-4">
        {meds.length === 0 ? (
          <EmptyState
            icon="medication"
            title="No medications yet"
            description={
              patients.length === 0
                ? "Add a patient first, then add their medications."
                : "Add the first medication to start tracking doses."
            }
            action={
              patients.length === 0 ? (
                <Link href="/caretaker/patients">
                  <Button icon="person_add" fullWidth={false}>
                    Add a patient
                  </Button>
                </Link>
              ) : (
                <Link href={addHref}>
                  <Button icon="add" fullWidth={false}>
                    Add medication
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <>
            {meds.map((med) => (
              <Link
                key={med.id}
                href={`/caretaker/medications/${med.id}`}
                className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-4 soft-elevation transition-transform active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                  <Icon name={formIcon(med.form)} filled />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-button-text text-button-text text-primary">
                    {med.name}
                  </h3>
                  <p className="truncate font-label-md text-label-md text-on-surface-variant">
                    {[dosageLabel(med), scheduleSummary(med)].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <Icon name="chevron_right" className="text-on-surface-variant" />
              </Link>
            ))}
            <div className="pt-2">
              <Link href={addHref}>
                <Button variant="secondary" icon="add">
                  Add medication
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
