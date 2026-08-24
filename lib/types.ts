/**
 * Database types for the MedTrak schema (all tables use the `mt_` prefix).
 *
 * These mirror the deployed Supabase schema. They are hand-authored (the schema
 * lives in a Supabase project that isn't reachable from this workspace's MCP
 * connection) and typed defensively so reads/writes stay robust.
 */

export type Role = "patient" | "caretaker";

export type MedicationForm = "tablet" | "capsule" | "syrup" | "injection" | "other";

export type TimeLabel = "morning" | "afternoon" | "evening" | "night";

export type Frequency = "daily" | "alternate_days" | "weekly";

export type LogStatus = "pending" | "taken" | "missed" | "skipped";

export type ReadingType = "bp" | "glucose" | "temperature" | "weight" | "heart_rate" | "spo2";

export interface FamilyGroup {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  user_id: string | null;
  family_group_id: string;
  role: Role;
  display_name: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  family_group_id: string;
  name: string;
  form: MedicationForm | string;
  dosage_amount: number | null;
  dosage_unit: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface Schedule {
  id: string;
  medication_id: string;
  time_label: TimeLabel | string;
  /** Postgres `time` value, e.g. "08:00:00". */
  scheduled_time: string;
  quantity: number;
  frequency: Frequency | string;
  /** 0 = Sunday … 6 = Saturday. Used when frequency = "weekly". */
  specific_days: number[] | null;
  is_active: boolean;
}

export interface Inventory {
  id: string;
  medication_id: string;
  quantity_remaining: number;
  unit: string | null;
  low_stock_threshold_days: number;
  last_restocked_at: string | null;
}

export interface Log {
  id: string;
  schedule_id: string;
  patient_id: string;
  confirmed_by_id: string | null;
  /** Postgres `date`, e.g. "2026-06-27". */
  log_date: string;
  status: LogStatus | string;
  taken_at: string | null;
  quantity_taken: number | null;
  notes: string | null;
}

export interface NotificationPrefs {
  id: string;
  member_id: string;
  push_enabled: boolean;
  push_endpoint: string | null;
  push_p256dh: string | null;
  push_auth: string | null;
  reminder_minutes: number | null;
  missed_dose_alerts: boolean;
  low_stock_alerts: boolean;
}

/** A vitals reading (blood pressure, glucose, temperature, weight, etc.). */
export interface Reading {
  id: string;
  patient_id: string;
  family_group_id: string;
  recorded_by_id: string | null;
  type: ReadingType | string;
  /** Systolic for blood pressure; the single value for every other type. */
  value_primary: number;
  /** Diastolic for blood pressure; null otherwise. */
  value_secondary: number | null;
  unit: string | null;
  notes: string | null;
  taken_at: string;
  created_at: string;
}

/* ---- Composite shapes used across the UI -------------------------------- */

export interface MedicationWithRelations extends Medication {
  mt_schedules: Schedule[];
  mt_inventory: Inventory[];
}

export interface ScheduleWithMedication extends Schedule {
  mt_medications: Medication;
}
