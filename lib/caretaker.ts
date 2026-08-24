import { buildDoseItems } from "@/lib/dose";
import { dailyConsumption, doseStatus, stockStatus } from "@/lib/utils";
import type { MedicationWithRelations, Member } from "@/lib/types";

export type PatientStatus = "ontrack" | "attention" | "progress" | "none";

export interface PatientSummary {
  patient: Member;
  due: number;
  taken: number;
  missed: number;
  percent: number;
  status: PatientStatus;
}

type LogLite = { status: string };

/** Today's adherence summary for one patient. */
export function computePatientSummary(
  patient: Member,
  meds: MedicationWithRelations[],
  logsBySchedule: Record<string, LogLite>,
  now: Date,
): PatientSummary {
  const due = buildDoseItems(meds, now);
  let taken = 0;
  let missed = 0;
  for (const d of due) {
    const st = doseStatus(d.scheduledTime, logsBySchedule[d.scheduleId], now, true);
    if (st === "taken") taken++;
    else if (st === "missed") missed++;
  }

  let status: PatientStatus = "none";
  if (due.length > 0) {
    if (taken === due.length) status = "ontrack";
    else if (missed > 0) status = "attention";
    else status = "progress";
  }

  return {
    patient,
    due: due.length,
    taken,
    missed,
    percent: due.length ? Math.round((taken / due.length) * 100) : 0,
    status,
  };
}

export interface StockAlert {
  med: MedicationWithRelations;
  patientName: string;
  daysRemaining: number | null;
  level: "ok" | "warning" | "critical" | "unknown";
}

/** Days-of-supply status for a single medication. */
export function medStock(med: MedicationWithRelations, patientName: string): StockAlert {
  const inventory = med.mt_inventory?.[0];
  if (!inventory) {
    return { med, patientName, daysRemaining: null, level: "unknown" };
  }
  const perDay = dailyConsumption(med.mt_schedules ?? []);
  const { daysRemaining, level } = stockStatus(inventory, perDay);
  return { med, patientName, daysRemaining, level };
}

export const STATUS_META: Record<
  PatientStatus,
  { label: string; tone: "success" | "warning" | "neutral" | "info"; icon: string }
> = {
  ontrack: { label: "On track", tone: "success", icon: "check_circle" },
  attention: { label: "Attention", tone: "warning", icon: "priority_high" },
  progress: { label: "In progress", tone: "info", icon: "schedule" },
  none: { label: "No doses", tone: "neutral", icon: "remove" },
};
