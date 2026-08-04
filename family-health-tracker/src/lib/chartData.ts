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
