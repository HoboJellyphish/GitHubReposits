// Parses an Apple Health "export.xml" file entirely on-device. Real exports
// can be hundreds of MB for a longtime user, so this streams the file in
// chunks and scans for `<Record .../>` tags with a regex rather than
// building a full DOM — a real XML parser would need to hold the whole
// document in memory, which risks crashing a mobile WebView on a large
// export. This only recognizes simple self-closing Record tags (the large
// majority of quantity records); records with nested <MetadataEntry>
// children are skipped rather than guessed at.
import type { AnyLogEntry, TrackerId } from "@/types";

const RECORD_RE = /<Record\b[^>]*\/>/g;
const ATTR_RE = /(\w+)="([^"]*)"/g;

function parseAttrs(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let m: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(tag))) attrs[m[1]] = m[2];
  return attrs;
}

async function* iterateRecordTags(file: File): AsyncGenerator<string> {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let lastIndex = 0;
      RECORD_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = RECORD_RE.exec(buffer))) {
        yield match[0];
        lastIndex = RECORD_RE.lastIndex;
      }
      buffer = buffer.slice(lastIndex);
      // Guard against unbounded growth if a huge run of text has no Record
      // tags in it (e.g. a big <MetadataEntry> block) — we only ever need
      // the tail in case a tag is split across a chunk boundary.
      if (buffer.length > 2_000_000) buffer = buffer.slice(-200_000);
    }
  } finally {
    reader.releaseLock();
  }
}

export type ImportableMetric = "heartRate" | "weight" | "bloodPressure" | "glucose" | "water" | "steps";

export const APPLE_HEALTH_TYPE_MAP: Record<string, ImportableMetric> = {
  HKQuantityTypeIdentifierHeartRate: "heartRate",
  HKQuantityTypeIdentifierBodyMass: "weight",
  HKQuantityTypeIdentifierBloodPressureSystolic: "bloodPressure",
  HKQuantityTypeIdentifierBloodPressureDiastolic: "bloodPressure",
  HKQuantityTypeIdentifierBloodGlucose: "glucose",
  HKQuantityTypeIdentifierDietaryWater: "water",
  HKQuantityTypeIdentifierStepCount: "steps",
};

export interface AppleHealthScanResult {
  countsByMetric: Partial<Record<ImportableMetric, number>>;
  earliestDate: string | null;
  latestDate: string | null;
  totalRecognizedRecords: number;
}

function convertToUnit(value: number, fromUnit: string, metric: ImportableMetric): number {
  const unit = fromUnit.toLowerCase();
  if (metric === "weight") {
    if (unit === "lb") return value * 0.453592;
    if (unit === "g") return value / 1000;
    return value; // kg
  }
  if (metric === "water") {
    if (unit === "floz" || unit === "fl_oz") return value * 29.5735;
    if (unit === "l") return value * 1000;
    return value; // mL
  }
  if (metric === "glucose") {
    if (unit === "mmol/l" || unit === "mmol<l") return value * 18.0182;
    return value; // mg/dL
  }
  return value;
}

/** First pass: count what's in the file and the date range it covers, so
 * the user can see what they're about to import before committing to it. */
export async function scanAppleHealthExport(file: File): Promise<AppleHealthScanResult> {
  const countsByMetric: Partial<Record<ImportableMetric, number>> = {};
  let earliest: string | null = null;
  let latest: string | null = null;
  let total = 0;

  for await (const tag of iterateRecordTags(file)) {
    const attrs = parseAttrs(tag);
    const metric = APPLE_HEALTH_TYPE_MAP[attrs.type];
    if (!metric || !attrs.startDate) continue;
    total++;
    countsByMetric[metric] = (countsByMetric[metric] ?? 0) + 1;
    if (!earliest || attrs.startDate < earliest) earliest = attrs.startDate;
    if (!latest || attrs.startDate > latest) latest = attrs.startDate;
  }

  return { countsByMetric, earliestDate: earliest, latestDate: latest, totalRecognizedRecords: total };
}

export interface ImportOptions {
  metrics: Set<ImportableMetric>;
  since?: Date;
  until?: Date;
}

/** Second pass: actually build log entries for the metrics/date range the
 * user chose. Step counts are summed per day rather than imported as
 * hundreds of tiny raw records; blood pressure only imports when a
 * systolic and diastolic record share the same timestamp (how Apple Health
 * records a single reading), otherwise it's dropped rather than guessed. */
export async function parseAppleHealthExport(
  file: File,
  profileId: string,
  options: ImportOptions,
): Promise<Omit<AnyLogEntry, "id" | "createdAt" | "updatedAt">[]> {
  const entries: Omit<AnyLogEntry, "id" | "createdAt" | "updatedAt">[] = [];
  const stepsByDay = new Map<string, number>();
  const bpSystolicByTime = new Map<string, number>();
  const bpDiastolicByTime = new Map<string, number>();

  const inRange = (dateStr: string) => {
    const t = new Date(dateStr).getTime();
    if (options.since && t < options.since.getTime()) return false;
    if (options.until && t > options.until.getTime()) return false;
    return true;
  };

  for await (const tag of iterateRecordTags(file)) {
    const attrs = parseAttrs(tag);
    const metric = APPLE_HEALTH_TYPE_MAP[attrs.type];
    if (!metric || !options.metrics.has(metric) || !attrs.startDate || !inRange(attrs.startDate)) continue;
    const rawValue = Number(attrs.value);
    if (Number.isNaN(rawValue)) continue;

    switch (metric) {
      case "heartRate":
        entries.push({
          profileId,
          trackerId: "heartRate" as TrackerId,
          timestamp: new Date(attrs.startDate).toISOString(),
          source: "import",
          data: { bpm: Math.round(rawValue), context: "unknown" },
        });
        break;
      case "weight":
        entries.push({
          profileId,
          trackerId: "weight" as TrackerId,
          timestamp: new Date(attrs.startDate).toISOString(),
          source: "import",
          data: { kg: Math.round(convertToUnit(rawValue, attrs.unit ?? "kg", "weight") * 10) / 10 },
        });
        break;
      case "glucose":
        entries.push({
          profileId,
          trackerId: "glucose" as TrackerId,
          timestamp: new Date(attrs.startDate).toISOString(),
          source: "import",
          data: { mgdl: Math.round(convertToUnit(rawValue, attrs.unit ?? "mg/dL", "glucose")) },
        });
        break;
      case "water":
        entries.push({
          profileId,
          trackerId: "water" as TrackerId,
          timestamp: new Date(attrs.startDate).toISOString(),
          source: "import",
          data: { ml: Math.round(convertToUnit(rawValue, attrs.unit ?? "mL", "water")) },
        });
        break;
      case "steps": {
        const dayKey = attrs.startDate.slice(0, 10);
        stepsByDay.set(dayKey, (stepsByDay.get(dayKey) ?? 0) + rawValue);
        break;
      }
      case "bloodPressure": {
        const target = attrs.type === "HKQuantityTypeIdentifierBloodPressureSystolic" ? bpSystolicByTime : bpDiastolicByTime;
        target.set(attrs.startDate, rawValue);
        break;
      }
    }
  }

  for (const [dayKey, total] of stepsByDay) {
    entries.push({
      profileId,
      trackerId: "steps" as TrackerId,
      timestamp: new Date(`${dayKey}T12:00:00`).toISOString(),
      source: "import",
      data: { count: Math.round(total) },
    });
  }

  for (const [ts, systolic] of bpSystolicByTime) {
    const diastolic = bpDiastolicByTime.get(ts);
    if (diastolic === undefined) continue;
    entries.push({
      profileId,
      trackerId: "bloodPressure" as TrackerId,
      timestamp: new Date(ts).toISOString(),
      source: "import",
      data: { systolic: Math.round(systolic), diastolic: Math.round(diastolic) },
    });
  }

  return entries;
}
