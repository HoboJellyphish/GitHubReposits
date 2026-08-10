import type { TrackerId } from "@/types";
import { CHART_CONFIG } from "./chartData";

/**
 * Trackers with a single (or systolic/diastolic pair) numeric value simple
 * enough to transcribe from a document — distinct from trackers whose
 * entries carry a richer shape (sleep sessions, meal photos, symptom
 * descriptions) that a generic "value" field can't represent.
 */
export const READING_TRACKER_IDS: TrackerId[] = ["heartRate", "weight", "bloodPressure", "glucose", "mood", "water", "steps"];

export function isDualValueReading(trackerId: TrackerId): boolean {
  return CHART_CONFIG[trackerId]?.kind === "dual-line";
}

export function buildReadingEntryData(trackerId: TrackerId, value: number, value2?: number): Record<string, unknown> {
  switch (trackerId) {
    case "heartRate":
      return { bpm: value, context: "unknown" };
    case "weight":
      return { kg: value };
    case "bloodPressure":
      return { systolic: value, diastolic: value2 ?? 0 };
    case "glucose":
      return { mgdl: value };
    case "mood":
      return { rating: value };
    case "water":
      return { ml: value };
    case "steps":
      return { count: value };
    default:
      return {};
  }
}
