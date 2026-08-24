import type { Reading, ReadingType } from "@/lib/types";

/**
 * Vitals domain logic — the "rules + trends" intelligence layer.
 *
 * Everything here is deterministic and explainable: per-type reference ranges
 * classify a reading, and a simple trend compares the recent window to the
 * earlier one. It is *informational*, not a diagnosis — ranges are general
 * wellness guidance and the UI says so.
 */

export type VitalStatus = "normal" | "low" | "elevated" | "high";

export interface VitalConfig {
  type: ReadingType;
  label: string;
  short: string;
  icon: string;
  unit: string;
  hasSecondary: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
  step: number;
  min: number;
  max: number;
  /** Trend sentiment: true = up is worse, false = down is worse, null = neutral. */
  higherIsWorse: boolean | null;
  classify: (primary: number, secondary?: number | null) => VitalStatus;
  format: (primary: number, secondary?: number | null) => string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const VITALS: VitalConfig[] = [
  {
    type: "bp", label: "Blood pressure", short: "BP", icon: "monitor_heart", unit: "mmHg",
    hasSecondary: true, primaryLabel: "Systolic", secondaryLabel: "Diastolic",
    step: 1, min: 60, max: 260, higherIsWorse: true,
    classify: (s, d) => {
      const dia = d ?? 0;
      if (s < 90 || dia < 60) return "low";
      if (s >= 140 || dia >= 90) return "high";
      if (s >= 120 || dia >= 80) return "elevated";
      return "normal";
    },
    format: (s, d) => `${Math.round(s)}/${Math.round(d ?? 0)}`,
  },
  {
    type: "glucose", label: "Blood glucose", short: "Glucose", icon: "glucose", unit: "mg/dL",
    hasSecondary: false, primaryLabel: "Value",
    step: 1, min: 30, max: 500, higherIsWorse: true,
    classify: (v) => (v < 70 ? "low" : v >= 180 ? "high" : v >= 140 ? "elevated" : "normal"),
    format: (v) => `${Math.round(v)}`,
  },
  {
    type: "temperature", label: "Temperature", short: "Temp", icon: "thermostat", unit: "°C",
    hasSecondary: false, primaryLabel: "Value",
    step: 0.1, min: 34, max: 43, higherIsWorse: true,
    classify: (v) => (v < 35.5 ? "low" : v >= 38 ? "high" : v >= 37.3 ? "elevated" : "normal"),
    format: (v) => `${round1(v)}`,
  },
  {
    type: "weight", label: "Weight", short: "Weight", icon: "monitor_weight", unit: "kg",
    hasSecondary: false, primaryLabel: "Value",
    step: 0.1, min: 2, max: 400, higherIsWorse: null,
    classify: () => "normal",
    format: (v) => `${round1(v)}`,
  },
  {
    type: "heart_rate", label: "Heart rate", short: "Pulse", icon: "cardiology", unit: "bpm",
    hasSecondary: false, primaryLabel: "Value",
    step: 1, min: 30, max: 220, higherIsWorse: true,
    classify: (v) => (v < 60 ? "low" : v > 100 ? "high" : "normal"),
    format: (v) => `${Math.round(v)}`,
  },
  {
    type: "spo2", label: "Oxygen (SpO₂)", short: "SpO₂", icon: "respiratory_rate", unit: "%",
    hasSecondary: false, primaryLabel: "Value",
    step: 1, min: 50, max: 100, higherIsWorse: false,
    classify: (v) => (v < 90 ? "high" : v < 95 ? "low" : "normal"),
    format: (v) => `${Math.round(v)}`,
  },
];

export function vitalConfig(type: string): VitalConfig | undefined {
  return VITALS.find((v) => v.type === type);
}

export const STATUS_META: Record<
  VitalStatus,
  { label: string; tone: "success" | "warning" | "danger"; icon: string }
> = {
  normal: { label: "Normal", tone: "success", icon: "check_circle" },
  elevated: { label: "Elevated", tone: "warning", icon: "trending_up" },
  low: { label: "Low", tone: "warning", icon: "trending_down" },
  high: { label: "High", tone: "danger", icon: "priority_high" },
};

export interface VitalSummary {
  config: VitalConfig;
  latest: Reading | null;
  status: VitalStatus | null;
  count: number;
  average: number | null;
  direction: "up" | "down" | "flat" | null;
  /** Primary values, oldest → newest, for the sparkline. */
  values: number[];
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Compare the recent third to the earliest third to get a trend direction. */
function trendDirection(values: number[]): "up" | "down" | "flat" | null {
  if (values.length < 3) return null;
  const third = Math.max(1, Math.floor(values.length / 3));
  const diff = mean(values.slice(-third)) - mean(values.slice(0, third));
  const deadband = Math.max(Math.abs(mean(values)) * 0.02, 0.1);
  if (Math.abs(diff) <= deadband) return "flat";
  return diff > 0 ? "up" : "down";
}

const num = (v: number | null) => (v == null ? null : Number(v));

/** Build a per-type summary from a patient's readings (any order). */
export function summarize(config: VitalConfig, readings: Reading[]): VitalSummary {
  const rows = readings
    .filter((r) => r.type === config.type)
    .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());
  const values = rows.map((r) => Number(r.value_primary));
  const latest = rows.length ? rows[rows.length - 1] : null;
  return {
    config,
    latest,
    status: latest ? config.classify(Number(latest.value_primary), num(latest.value_secondary)) : null,
    count: rows.length,
    average: values.length ? mean(values) : null,
    direction: trendDirection(values),
    values,
  };
}

/** Summaries for every vital type that has at least one reading. */
export function buildSummaries(readings: Reading[]): VitalSummary[] {
  return VITALS.map((c) => summarize(c, readings)).filter((s) => s.count > 0);
}
