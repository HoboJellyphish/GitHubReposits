import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/state/AppDataContext";
import { getTracker } from "@/lib/trackers";
import { CHART_CONFIG } from "@/lib/chartData";
import { READING_TRACKER_IDS, isDualValueReading, buildReadingEntryData } from "@/lib/readings";
import { id as newId } from "@/lib/format";
import type { MedicalDocument, TrackerId } from "@/types";
import { Plus, Trash2, FileText } from "lucide-react";

interface ReadingRow {
  key: string;
  trackerId: TrackerId;
  value: string;
  value2: string;
}

function emptyRow(trackerId: TrackerId = "weight"): ReadingRow {
  return { key: newId(), trackerId, value: "", value2: "" };
}

export function DocumentReadingsDialog({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: MedicalDocument;
}) {
  const { addLogEntry, listLogEntries } = useAppData();
  const [date, setDate] = React.useState(doc.documentDate.slice(0, 10));
  const [rows, setRows] = React.useState<ReadingRow[]>([emptyRow()]);

  React.useEffect(() => {
    if (open) {
      setDate(doc.documentDate.slice(0, 10));
      setRows([emptyRow()]);
    }
  }, [open, doc]);

  const linkedCount = listLogEntries(doc.profileId).filter((e) => e.documentId === doc.id).length;

  const updateRow = (key: string, patch: Partial<ReadingRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const removeRow = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));

  const validRows = rows.filter((r) => {
    if (r.value.trim() === "" || Number.isNaN(Number(r.value))) return false;
    if (isDualValueReading(r.trackerId) && (r.value2.trim() === "" || Number.isNaN(Number(r.value2)))) return false;
    return true;
  });

  const handleSave = () => {
    const timestamp = new Date(date).toISOString();
    for (const row of validRows) {
      addLogEntry({
        profileId: doc.profileId,
        trackerId: row.trackerId,
        timestamp,
        source: "document",
        documentId: doc.id,
        data: buildReadingEntryData(row.trackerId, Number(row.value), Number(row.value2)) as never,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Log Readings from This Document
          </DialogTitle>
          <DialogDescription>
            Type in the values from &ldquo;{doc.title}&rdquo; and they&apos;ll be added to this profile&apos;s charts —
            linked back to this document.
            {linkedCount > 0 && ` ${linkedCount} reading${linkedCount === 1 ? "" : "s"} already linked.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {doc.mimeType.startsWith("image/") && (
            <img src={doc.dataUrl} alt={doc.title} className="max-h-48 w-full rounded-lg border border-border object-contain" />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reading-date">Date on the document</Label>
            <Input id="reading-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full sm:w-48" />
          </div>

          <div className="flex flex-col gap-3">
            {rows.map((row) => {
              const tracker = getTracker(row.trackerId);
              const unit = CHART_CONFIG[row.trackerId]?.unit;
              const dual = isDualValueReading(row.trackerId);
              return (
                <div key={row.key} className="flex items-end gap-2 rounded-lg border border-border p-2.5">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Metric</Label>
                    <Select value={row.trackerId} onValueChange={(v) => updateRow(row.key, { trackerId: v as TrackerId, value: "", value2: "" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {READING_TRACKER_IDS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {getTracker(t).label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {dual ? (
                    <>
                      <div className="flex w-20 flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Systolic</Label>
                        <Input type="number" value={row.value} onChange={(e) => updateRow(row.key, { value: e.target.value })} />
                      </div>
                      <div className="flex w-20 flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Diastolic</Label>
                        <Input type="number" value={row.value2} onChange={(e) => updateRow(row.key, { value2: e.target.value })} />
                      </div>
                    </>
                  ) : (
                    <div className="flex w-28 flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">{unit ?? tracker.label}</Label>
                      <Input
                        type="number"
                        min={row.trackerId === "mood" ? 1 : undefined}
                        max={row.trackerId === "mood" ? 5 : undefined}
                        value={row.value}
                        onChange={(e) => updateRow(row.key, { value: e.target.value })}
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.key)}
                    disabled={rows.length === 1}
                    className="shrink-0 text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setRows((rs) => [...rs, emptyRow()])}>
              <Plus className="h-3.5 w-3.5" /> Add another reading
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {linkedCount > 0 ? "Close" : "Skip"}
          </Button>
          <Button onClick={handleSave} disabled={validRows.length === 0}>
            Save {validRows.length > 0 ? `${validRows.length} Reading${validRows.length === 1 ? "" : "s"}` : "Readings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
