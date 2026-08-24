import type { Frequency, MedicationForm, TimeLabel } from "@/lib/types";

/** The four day-parts a schedule can belong to, in display order. */
export const TIME_SLOTS: {
  key: TimeLabel;
  label: string;
  icon: string;
  defaultTime: string;
}[] = [
  { key: "morning", label: "Morning", icon: "wb_sunny", defaultTime: "08:00" },
  { key: "afternoon", label: "Afternoon", icon: "light_mode", defaultTime: "13:00" },
  { key: "evening", label: "Evening", icon: "wb_twilight", defaultTime: "18:30" },
  { key: "night", label: "Night", icon: "bedtime", defaultTime: "22:00" },
];

export const TIME_SLOT_ORDER: TimeLabel[] = TIME_SLOTS.map((s) => s.key);

export const MEDICATION_FORMS: { key: MedicationForm; label: string; icon: string }[] = [
  { key: "tablet", label: "Tablet", icon: "pill" },
  { key: "capsule", label: "Capsule", icon: "capture" },
  { key: "syrup", label: "Syrup", icon: "vaccines" },
  { key: "injection", label: "Injection", icon: "colorize" },
  { key: "other", label: "Other", icon: "medication" },
];

export const DOSAGE_UNITS = ["mg", "ml", "g", "mcg", "IU", "pills", "drops"];

export const FREQUENCIES: { key: Frequency; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "alternate_days", label: "Alternate Days" },
  { key: "weekly", label: "Weekly" },
];

/** 0 = Sunday … 6 = Saturday — matches JS `Date.getDay()`. */
export const WEEKDAYS = [
  { value: 0, short: "S", label: "Sun" },
  { value: 1, short: "M", label: "Mon" },
  { value: 2, short: "T", label: "Tue" },
  { value: 3, short: "W", label: "Wed" },
  { value: 4, short: "T", label: "Thu" },
  { value: 5, short: "F", label: "Fri" },
  { value: 6, short: "S", label: "Sat" },
];

export function formIcon(form: string | null | undefined): string {
  return MEDICATION_FORMS.find((f) => f.key === form)?.icon ?? "medication";
}

export function slotMeta(label: string) {
  return TIME_SLOTS.find((s) => s.key === label) ?? TIME_SLOTS[0];
}
