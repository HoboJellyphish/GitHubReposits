import type { AnyLogEntry, TrackerId } from "@/types";

/** Minimal but correct CSV parsing — handles quoted fields, embedded
 * commas, and escaped quotes ("") without pulling in a dependency. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export type CsvTracker = "heartRate" | "weight" | "glucose" | "water" | "steps" | "mood" | "bloodPressure";

export interface CsvMapping {
  tracker: CsvTracker;
  dateColumn: number;
  valueColumn: number;
  /** Only used for bloodPressure, where two numbers are needed per row. */
  secondValueColumn?: number;
}

function buildData(tracker: CsvTracker, value: number, value2?: number): Record<string, unknown> {
  switch (tracker) {
    case "heartRate":
      return { bpm: Math.round(value), context: "unknown" };
    case "weight":
      return { kg: value };
    case "glucose":
      return { mgdl: Math.round(value) };
    case "water":
      return { ml: Math.round(value) };
    case "steps":
      return { count: Math.round(value) };
    case "mood":
      return { rating: Math.round(value) };
    case "bloodPressure":
      return { systolic: Math.round(value), diastolic: Math.round(value2 ?? 0) };
  }
}

export interface CsvImportResult {
  entries: Omit<AnyLogEntry, "id" | "createdAt" | "updatedAt">[];
  skipped: number;
}

export function buildEntriesFromCsv(rows: string[][], hasHeader: boolean, mapping: CsvMapping, profileId: string): CsvImportResult {
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const entries: Omit<AnyLogEntry, "id" | "createdAt" | "updatedAt">[] = [];
  let skipped = 0;

  for (const row of dataRows) {
    const dateStr = row[mapping.dateColumn]?.trim();
    const valueStr = row[mapping.valueColumn]?.trim();
    const value = Number(valueStr);
    const date = dateStr ? new Date(dateStr) : null;
    if (!dateStr || !date || Number.isNaN(date.getTime()) || !valueStr || Number.isNaN(value)) {
      skipped++;
      continue;
    }
    let value2: number | undefined;
    if (mapping.tracker === "bloodPressure") {
      const value2Str = mapping.secondValueColumn !== undefined ? row[mapping.secondValueColumn]?.trim() : undefined;
      value2 = value2Str ? Number(value2Str) : NaN;
      if (Number.isNaN(value2)) {
        skipped++;
        continue;
      }
    }
    entries.push({
      profileId,
      trackerId: mapping.tracker as TrackerId,
      timestamp: date.toISOString(),
      source: "import",
      data: buildData(mapping.tracker, value, value2) as never,
    });
  }

  return { entries, skipped };
}
