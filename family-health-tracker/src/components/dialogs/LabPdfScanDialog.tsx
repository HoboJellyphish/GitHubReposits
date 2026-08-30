import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/state/AppDataContext";
import { loadPdf } from "@/lib/pdf";
import { extractLabText, parseLabValues, type ExtractedLabRow } from "@/lib/labExtract";
import { LAB_PANEL_TYPES, getLabPanelType } from "@/lib/labs";
import { id as newId } from "@/lib/format";
import type { LabPanelType, MedicalDocument } from "@/types";
import { ScanLine, Loader2, AlertTriangle, ChevronDown, Trash2, Plus } from "lucide-react";

interface EditableRow extends ExtractedLabRow {
  include: boolean;
}

function toEditable(rows: ExtractedLabRow[], fallbackDate: string): EditableRow[] {
  return rows.map((r) => ({ ...r, date: r.date || fallbackDate, include: true }));
}

export function LabPdfScanDialog({
  open,
  onOpenChange,
  profileId,
  doc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  doc: MedicalDocument;
}) {
  const { addLabPanel } = useAppData();
  const fallbackDate = doc.documentDate.slice(0, 10);
  const [scanning, setScanning] = React.useState(true);
  const [progress, setProgress] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [rawText, setRawText] = React.useState("");
  const [showRaw, setShowRaw] = React.useState(false);
  const [rows, setRows] = React.useState<EditableRow[]>([]);
  const [panelType, setPanelType] = React.useState<LabPanelType>("other");
  const [title, setTitle] = React.useState(doc.title);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setScanning(true);
    setError(null);
    setProgress(null);
    setRawText("");
    setRows([]);
    setPanelType("other");
    setTitle(doc.title);

    (async () => {
      try {
        const pdf = await loadPdf(doc.dataUrl);
        const { text, usedOcr } = await extractLabText(pdf, (page, total) => {
          if (!cancelled) setProgress(`Reading page ${page} of ${total}…`);
        });
        if (cancelled) return;
        setRawText(text);
        const parsed = parseLabValues(text);
        setRows(toEditable(parsed, fallbackDate));
        if (parsed.length === 0) {
          setError(
            usedOcr
              ? "Couldn't automatically find lab values in this scanned document — you can still add rows manually below."
              : "Couldn't automatically find lab values in this document — you can still add rows manually below.",
          );
        }
      } catch {
        if (!cancelled) setError("Couldn't read this PDF. You can still add values manually below.");
      } finally {
        if (!cancelled) {
          setScanning(false);
          setProgress(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doc.id]);

  const updateRow = (key: string, patch: Partial<EditableRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const removeRow = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));
  const addRow = () =>
    setRows((rs) => [...rs, { key: newId(), name: "", value: "", unit: "", referenceLow: "", referenceHigh: "", date: fallbackDate, include: true }]);

  const includedValidRows = rows.filter((r) => r.include && r.name.trim() !== "" && r.value.trim() !== "" && !Number.isNaN(Number(r.value)));

  const handleSave = () => {
    const byDate = new Map<string, EditableRow[]>();
    for (const row of includedValidRows) {
      const d = row.date || fallbackDate;
      const bucket = byDate.get(d);
      if (bucket) bucket.push(row);
      else byDate.set(d, [row]);
    }
    for (const [date, dateRows] of byDate) {
      addLabPanel({
        profileId,
        panelType,
        title: title.trim() || doc.title,
        testDate: new Date(date).toISOString(),
        values: dateRows.map((r) => ({
          name: r.name.trim(),
          value: Number(r.value),
          unit: r.unit.trim(),
          referenceLow: r.referenceLow.trim() ? Number(r.referenceLow) : undefined,
          referenceHigh: r.referenceHigh.trim() ? Number(r.referenceHigh) : undefined,
        })),
        documentId: doc.id,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-4 w-4" /> Extract Lab Values
          </DialogTitle>
          <DialogDescription>
            Reads this PDF entirely on this device — nothing is uploaded anywhere. Nothing is saved until you review
            and confirm the values below; if a date is found for a value, it's saved as its own dated panel so trends
            build up correctly.
          </DialogDescription>
        </DialogHeader>

        {scanning ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {progress ?? "Reading document…"}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {error && (
              <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Panel type</Label>
                <Select value={panelType} onValueChange={(v) => setPanelType(v as LabPanelType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAB_PANEL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={getLabPanelType(panelType).label} />
              </div>
            </div>

            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {rows.map((row) => (
                <div key={row.key} className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
                  <div className="flex items-start gap-2">
                    <Checkbox checked={row.include} onCheckedChange={(v) => updateRow(row.key, { include: v === true })} className="mt-2.5 shrink-0" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input value={row.name} onChange={(e) => updateRow(row.key, { name: e.target.value })} placeholder="e.g. TSH" />
                    </div>
                    <div className="flex w-20 flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <Input value={row.value} onChange={(e) => updateRow(row.key, { value: e.target.value })} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(row.key)} className="mt-5 shrink-0 text-muted-foreground">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-end gap-2 pl-7">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Unit</Label>
                      <Input value={row.unit} onChange={(e) => updateRow(row.key, { unit: e.target.value })} placeholder="mg/dL" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Low</Label>
                      <Input value={row.referenceLow} onChange={(e) => updateRow(row.key, { referenceLow: e.target.value })} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">High</Label>
                      <Input value={row.referenceHigh} onChange={(e) => updateRow(row.key, { referenceHigh: e.target.value })} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <Input type="date" value={row.date} onChange={(e) => updateRow(row.key, { date: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="self-start" onClick={addRow}>
                <Plus className="h-3.5 w-3.5" /> Add value
              </Button>
            </div>

            {rawText && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowRaw((s) => !s)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showRaw ? "rotate-180" : ""}`} />
                  What the scan actually read
                </button>
                {showRaw && (
                  <pre className="mt-1.5 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-2 text-[11px] text-muted-foreground">
                    {rawText}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={scanning || includedValidRows.length === 0}>
            Save {includedValidRows.length > 0 ? `${includedValidRows.length} Value${includedValidRows.length === 1 ? "" : "s"}` : "Values"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
