import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPatients, normalizeMed } from "@/lib/queries";
import { toTimeInputValue } from "@/lib/utils";
import { TIME_SLOTS } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";
import {
  MedicationForm,
  type MedicationFormInitial,
} from "@/components/caretaker/MedicationForm";
import type { Frequency, TimeLabel } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit medication" };

export default async function EditMedicationPage({
  params,
}: {
  params: { medId: string };
}) {
  const { member } = await requireMember("caretaker");
  const supabase = createClient();

  const { data: medData } = await supabase
    .from("mt_medications")
    .select("*, mt_schedules(*), mt_inventory(*)")
    .eq("id", params.medId)
    .eq("family_group_id", member.family_group_id)
    .maybeSingle();
  if (!medData) notFound();
  const med = normalizeMed(medData as Record<string, unknown>);

  const patients = await getPatients(member.family_group_id);
  const schedules = med.mt_schedules ?? [];
  const first = schedules[0];

  const slots = {} as MedicationFormInitial["slots"];
  for (const slot of TIME_SLOTS) {
    const existing = schedules.find((s) => s.time_label === slot.key);
    slots[slot.key as TimeLabel] = existing
      ? { enabled: existing.is_active !== false, time: toTimeInputValue(existing.scheduled_time) }
      : { enabled: false, time: slot.defaultTime };
  }

  const inventory = med.mt_inventory?.[0];
  const initial: MedicationFormInitial = {
    id: med.id,
    patientId: med.patient_id,
    name: med.name,
    form: (med.form as string) ?? "tablet",
    dosageAmount: med.dosage_amount,
    dosageUnit: med.dosage_unit ?? "mg",
    notes: med.notes ?? "",
    frequency: (first?.frequency as Frequency) ?? "daily",
    specificDays: first?.specific_days ?? [1, 3, 5],
    quantity: Number(first?.quantity) || 1,
    slots,
    inventoryQuantity: inventory?.quantity_remaining ?? null,
    lowStockThresholdDays: inventory?.low_stock_threshold_days ?? 7,
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-max-width-content flex-col">
      <PageHeader
        title="Edit medication"
        backHref={`/caretaker/medications?patient=${med.patient_id}`}
      />
      <main className="flex-1 px-margin-mobile pt-4">
        <MedicationForm patients={patients} initial={initial} />
      </main>
    </div>
  );
}
