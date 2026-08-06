import type { AnyLogEntry, TrackerId } from "@/types";
import { dayKey, formatDayShort, formatTime } from "@/lib/format";

export type ChartKind = "line" | "dual-line" | "bar-sum" | "bar-count";

export interface ChartSeriesConfig {
  kind: ChartKind;
  unit?: string;
  primaryLabel: string;
  secondaryLabel?: string;
}

export interface ChartPoint {
  key: string;
  label: string;
  timestamp: string;
  value: number | null;
  value2?: number | null;
}

export const CHART_CONFIG: Partial<Record<TrackerId, ChartSeriesConfig>> = {
  heartRate: { kind: "line", unit: "bpm", primaryLabel: "Heart rate" },
  sleep: { kind: "bar-sum", unit: "hrs", primaryLabel: "Sleep duration" },
  weight: { kind: "line", unit: "kg", primaryLabel: "Weight" },
  bloodPressure: { kind: "dual-line", unit: "mmHg", primaryLabel: "Systolic", secondaryLabel: "Diastolic" },
  glucose: { kind: "line", unit: "mg/dL", primaryLabel: "Glucose" },
  mood: { kind: "line", unit: "/5", primaryLabel: "Mood" },
  water: { kind: "bar-sum", unit: "mL", primaryLabel: "Water intake" },
  meals: { kind: "bar-count", primaryLabel: "Meals logged" },
  symptoms: { kind: "bar-count", primaryLabel: "Symptoms logged" },
};

function numericValue(entry: AnyLogEntry): { primary: number | null; secondary?: number | null } {
  const d = entry.data as Record<string, unknown>;
  switch (entry.trackerId) {
    case "heartRate":
      return { primary: Number(d.bpm) };
    case "sleep":
      return d.state === "awake" && typeof d.durationMinutes === "number" ? { primary: d.durationMinutes / 60 } : { primary: null };
    case "weight":
      return { primary: Number(d.kg) };
    case "bloodPressure":
      return { primary: Number(d.systolic), secondary: Number(d.diastolic) };
    case "glucose":
      return { primary: Number(d.mgdl) };
    case "mood":
      return { primary: Number(d.rating) };
    case "water":
      return { primary: Number(d.ml) };
    default:
      return { primary: 1 };
  }
}

export function filterByRange(entries: AnyLogEntry[], start: Date, end: Date): AnyLogEntry[] {
  return entries.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
}

export function buildTrendPoints(trackerId: TrackerId, entries: AnyLogEntry[], granularity: "raw" | "daily"): ChartPoint[] {
  const config = CHART_CONFIG[trackerId];
  if (!config) return [];
  const relevant = entries.filter((e) => e.trackerId === trackerId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (granularity === "raw") {
    return relevant
      .map((e) => {
        const { primary, secondary } = numericValue(e);
        return {
          key: e.id,
          label: formatTime(e.timestamp),
          timestamp: e.timestamp,
          value: primary,
          value2: secondary ?? undefined,
        };
      })
      .filter((p) => p.value !== null);
  }

  const buckets = new Map<string, { sum: number; sum2: number; count: number; count2: number; timestamp: string }>();
  for (const e of relevant) {
    const { primary, secondary } = numericValue(e);
    if (primary === null) continue;
    const key = dayKey(e.timestamp);
    const bucket = buckets.get(key) ?? { sum: 0, sum2: 0, count: 0, count2: 0, timestamp: e.timestamp };
    bucket.sum += primary;
    bucket.count += 1;
    if (typeof secondary === "number") {
      bucket.sum2 += secondary;
      bucket.count2 += 1;
    }
    buckets.set(key, bucket);
  }

  const isSum = config.kind === "bar-sum" || config.kind === "bar-count";
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, b]) => ({
      key,
      label: formatDayShort(b.timestamp),
      timestamp: b.timestamp,
      value: isSum ? b.sum : b.sum / b.count,
      value2: b.count2 > 0 ? (isSum ? b.sum2 : b.sum2 / b.count2) : undefined,
    }));
}

export function periodAggregate(trackerId: TrackerId, entries: AnyLogEntry[]): number | null {
  const config = CHART_CONFIG[trackerId];
  if (!config) return null;
  const relevant = entries.filter((e) => e.trackerId === trackerId);
  const values = relevant.map((e) => numericValue(e).primary).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  const isSum = config.kind === "bar-sum" || config.kind === "bar-count";
  return isSum ? values.reduce((a, b) => a + b, 0) : values.reduce((a, b) => a + b, 0) / values.length;
}

export interface FamilySeriesRow {
  key: string;
  label: string;
  timestamp: string;
  [profileId: string]: string | number | null;
}

export function buildFamilyDailySeries(
  trackerId: TrackerId,
  profiles: { id: string }[],
  entriesByProfile: Record<string, AnyLogEntry[]>,
): FamilySeriesRow[] {
  const rowsByDay = new Map<string, FamilySeriesRow>();
  for (const profile of profiles) {
    const points = buildTrendPoints(trackerId, entriesByProfile[profile.id] ?? [], "daily");
    for (const point of points) {
      const row = rowsByDay.get(point.key) ?? { key: point.key, label: point.label, timestamp: point.timestamp };
      row[profile.id] = point.value;
      rowsByDay.set(point.key, row);
    }
  }
  return Array.from(rowsByDay.values()).sort((a, b) => (a.key < b.key ? -1 : 1));
}

export interface ProfileCorrelation {
  profileAId: string;
  profileBId: string;
  /** Pearson correlation coefficient, -1..1. Null when there isn't enough overlapping data. */
  r: number | null;
  /** Number of days where both profiles logged a value for this tracker. */
  pairedDays: number;
}

const MIN_PAIRED_DAYS = 3;

/**
 * Pearson correlation coefficient between two numeric series, using only
 * the days where both have a logged value (pairwise deletion).
 */
function pearson(a: number[], b: number[]): number | null {
  const n = a.length;
  if (n < MIN_PAIRED_DAYS) return null;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  if (varA === 0 || varB === 0) return null;
  const r = cov / Math.sqrt(varA * varB);
  return Math.max(-1, Math.min(1, r));
}

/**
 * Computes the Pearson correlation between every pair of family members for
 * a tracker, based on daily-aggregated values. Only days both profiles
 * logged data are used, so members with mismatched logging habits don't
 * silently skew the result toward zero.
 */
export function computeFamilyCorrelations(rows: FamilySeriesRow[], profileIds: string[]): ProfileCorrelation[] {
  const results: ProfileCorrelation[] = [];
  for (let i = 0; i < profileIds.length; i++) {
    for (let j = i + 1; j < profileIds.length; j++) {
      const idA = profileIds[i];
      const idB = profileIds[j];
      const a: number[] = [];
      const b: number[] = [];
      for (const row of rows) {
        const va = row[idA];
        const vb = row[idB];
        if (typeof va === "number" && typeof vb === "number") {
          a.push(va);
          b.push(vb);
        }
      }
      results.push({ profileAId: idA, profileBId: idB, r: pearson(a, b), pairedDays: a.length });
    }
  }
  return results;
}
