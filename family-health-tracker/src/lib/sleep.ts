import type { AnyLogEntry, LogEntry } from "@/types";

export function latestSleepEntry(entries: AnyLogEntry[]): LogEntry<"sleep"> | null {
  const sleepEntries = entries.filter((e): e is LogEntry<"sleep"> => e.trackerId === "sleep");
  if (sleepEntries.length === 0) return null;
  return sleepEntries.reduce((latest, e) => (new Date(e.timestamp) > new Date(latest.timestamp) ? e : latest));
}

export function currentSleepState(entries: AnyLogEntry[]): "asleep" | "awake" | "unknown" {
  const latest = latestSleepEntry(entries);
  return latest?.data.state ?? "unknown";
}
