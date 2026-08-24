import { TIME_SLOT_ORDER } from "@/lib/constants";
import { isScheduleDueOn } from "@/lib/utils";
import type { Log, MedicationWithRelations, TimeLabel } from "@/lib/types";

/** A single scheduled dose for a given day, flattened for rendering. */
export interface DoseItem {
  scheduleId: string;
  medicationId: string;
  name: string;
  form: string;
  dosageLabel: string;
  timeLabel: TimeLabel;
  scheduledTime: string;
  quantity: number;
}

export function dosageLabel(
  med: Pick<MedicationWithRelations, "dosage_amount" | "dosage_unit" | "form">,
): string {
  const amount =
    med.dosage_amount != null ? `${med.dosage_amount}${med.dosage_unit ?? ""}` : "";
  const form = med.form ? med.form.charAt(0).toUpperCase() + med.form.slice(1) : "";
  return [amount, form].filter(Boolean).join(" ");
}

/** Flatten active medications + schedules into the doses due on `date`. */
export function buildDoseItems(meds: MedicationWithRelations[], date: Date): DoseItem[] {
  const items: DoseItem[] = [];

  for (const med of meds) {
    for (const schedule of med.mt_schedules ?? []) {
      if (schedule.is_active === false) continue;
      if (!isScheduleDueOn(schedule, date)) continue;
      items.push({
        scheduleId: schedule.id,
        medicationId: med.id,
        name: med.name,
        form: (med.form as string) ?? "tablet",
        dosageLabel: dosageLabel(med),
        timeLabel: (schedule.time_label as TimeLabel) ?? "morning",
        scheduledTime: schedule.scheduled_time,
        quantity: Number(schedule.quantity) || 1,
      });
    }
  }

  // Sort by slot order, then by scheduled time.
  items.sort((a, b) => {
    const slot = TIME_SLOT_ORDER.indexOf(a.timeLabel) - TIME_SLOT_ORDER.indexOf(b.timeLabel);
    if (slot !== 0) return slot;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  return items;
}

/** Group dose items by their time-of-day slot. */
export function groupBySlot(items: DoseItem[]): Record<TimeLabel, DoseItem[]> {
  const groups = { morning: [], afternoon: [], evening: [], night: [] } as Record<
    TimeLabel,
    DoseItem[]
  >;
  for (const item of items) {
    (groups[item.timeLabel] ?? groups.morning).push(item);
  }
  return groups;
}

export type LogMap = Record<string, Pick<Log, "id" | "status" | "taken_at">>;
