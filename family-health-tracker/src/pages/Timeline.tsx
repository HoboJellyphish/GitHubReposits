import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { getTracker, ALL_TRACKER_IDS } from "@/lib/trackers";
import { getCategoryDef, formatFileSize } from "@/lib/documents";
import { formatDateTime } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Watch, Hand, FileText } from "lucide-react";
import type { AnyLogEntry, MedicalDocument, TrackerId } from "@/types";
import { LogEntryDialog } from "@/components/dialogs/LogEntryDialog";
import { SleepDialog } from "@/components/dialogs/SleepDialog";
import { DocumentViewerDialog } from "@/components/dialogs/DocumentViewerDialog";

function entrySummary(entry: AnyLogEntry): string {
  const d = entry.data as Record<string, unknown>;
  switch (entry.trackerId) {
    case "heartRate":
      return `${d.bpm} bpm (${d.context})`;
    case "sleep":
      return d.state === "asleep" ? "Went to sleep" : `Woke up${d.qualityRating ? ` · quality ${d.qualityRating}/5` : ""}`;
    case "meals":
      return `${d.mealType}${d.category ? ` · ${d.category}` : ""}`;
    case "weight":
      return `${d.kg} kg`;
    case "bloodPressure":
      return `${d.systolic}/${d.diastolic} mmHg`;
    case "glucose":
      return `${d.mgdl} mg/dL`;
    case "mood":
      return `Mood ${d.rating}/5`;
    case "symptoms":
      return `${d.description} · severity ${d.severity}/5`;
    case "water":
      return `${d.ml} mL`;
    case "steps":
      return `${d.count} steps`;
    default:
      return "Entry";
  }
}

const RANGE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

type Row = { kind: "entry"; timestamp: string; entry: AnyLogEntry } | { kind: "document"; timestamp: string; doc: MedicalDocument };

export function Timeline() {
  const { activeProfile, listLogEntries, listDocuments } = useAppData();
  const [trackerFilter, setTrackerFilter] = React.useState<TrackerId | "all" | "documents">("all");
  const [range, setRange] = React.useState("30");
  const [keyword, setKeyword] = React.useState("");
  const [editEntry, setEditEntry] = React.useState<AnyLogEntry | null>(null);
  const [viewingDoc, setViewingDoc] = React.useState<MedicalDocument | null>(null);

  if (!activeProfile) return null;

  const allEntries = listLogEntries(activeProfile.id);
  const allDocuments = listDocuments(activeProfile.id);

  const rows: Row[] = [
    ...allEntries.map((entry): Row => ({ kind: "entry", timestamp: entry.timestamp, entry })),
    ...allDocuments.map((doc): Row => ({ kind: "document", timestamp: doc.documentDate, doc })),
  ];

  const filtered = rows
    .filter((r) => {
      if (trackerFilter === "all") return true;
      if (trackerFilter === "documents") return r.kind === "document";
      return r.kind === "entry" && r.entry.trackerId === trackerFilter;
    })
    .filter((r) => {
      if (range === "all") return true;
      const days = Number(range);
      return Date.now() - new Date(r.timestamp).getTime() <= days * 24 * 60 * 60 * 1000;
    })
    .filter((r) => {
      if (!keyword.trim()) return true;
      const needle = keyword.trim().toLowerCase();
      if (r.kind === "entry") {
        const haystack = `${entrySummary(r.entry)} ${r.entry.note ?? ""} ${getTracker(r.entry.trackerId).label}`.toLowerCase();
        return haystack.includes(needle);
      }
      const haystack = `${r.doc.title} ${r.doc.note ?? ""} ${getCategoryDef(r.doc.category).label}`.toLowerCase();
      return haystack.includes(needle);
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Chronological history for {activeProfile.name}, including uploaded documents.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search entries…" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="pl-9" />
        </div>
        <Select value={trackerFilter} onValueChange={(v) => setTrackerFilter(v as TrackerId | "all" | "documents")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ALL_TRACKER_IDS.map((t) => (
              <SelectItem key={t} value={t}>
                {getTracker(t).label}
              </SelectItem>
            ))}
            <SelectItem value="documents">Documents</SelectItem>
          </SelectContent>
        </Select>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">No entries match these filters.</CardContent>
          </Card>
        )}
        {filtered.map((row) => {
          if (row.kind === "document") {
            const doc = row.doc;
            const category = getCategoryDef(doc.category);
            return (
              <button key={`doc-${doc.id}`} type="button" onClick={() => setViewingDoc(doc)} className="text-left">
                <Card className="transition-shadow hover:shadow-sm">
                  <CardContent className="flex items-center gap-3 p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <category.icon className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{doc.title}</span>
                        <Badge variant="outline" className="shrink-0">
                          <FileText className="h-3 w-3" />
                          {category.label}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(doc.documentDate)}</span>
                  </CardContent>
                </Card>
              </button>
            );
          }

          const entry = row.entry;
          const tracker = getTracker(entry.trackerId);
          return (
            <button
              key={`entry-${entry.id}`}
              type="button"
              onClick={() => entry.trackerId !== "medications" && setEditEntry(entry)}
              className="text-left"
            >
              <Card className="transition-shadow hover:shadow-sm">
                <CardContent className="flex items-center gap-3 p-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `color-mix(in oklch, ${tracker.colorVar} 18%, transparent)` }}
                  >
                    <tracker.icon className="h-4 w-4" style={{ color: tracker.colorVar }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{entrySummary(entry)}</span>
                      <Badge variant={entry.source === "wearable" ? "default" : entry.source === "document" ? "outline" : "secondary"} className="shrink-0">
                        {entry.source === "wearable" ? (
                          <Watch className="h-3 w-3" />
                        ) : entry.source === "document" ? (
                          <FileText className="h-3 w-3" />
                        ) : (
                          <Hand className="h-3 w-3" />
                        )}
                        {entry.source}
                      </Badge>
                    </div>
                    {entry.note && <p className="truncate text-xs text-muted-foreground">{entry.note}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {editEntry && editEntry.trackerId === "sleep" && (
        <SleepDialog open onOpenChange={(o) => !o && setEditEntry(null)} profileId={activeProfile.id} />
      )}
      {editEntry && editEntry.trackerId !== "sleep" && editEntry.trackerId !== "medications" && (
        <LogEntryDialog
          open
          onOpenChange={(o) => !o && setEditEntry(null)}
          profileId={activeProfile.id}
          trackerId={editEntry.trackerId}
          existing={editEntry}
        />
      )}
      {viewingDoc && <DocumentViewerDialog open onOpenChange={(o) => !o && setViewingDoc(null)} doc={viewingDoc} />}
    </div>
  );
}
