import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAppData } from "@/state/AppDataContext";
import { scanAppleHealthExport, parseAppleHealthExport, type AppleHealthScanResult, type ImportableMetric } from "@/data/importers/appleHealth";
import { parseCsv, buildEntriesFromCsv, type CsvMapping, type CsvTracker } from "@/data/importers/csv";
import { formatDate } from "@/lib/format";
import { AlertTriangle, CheckCircle2, Upload, Loader2 } from "lucide-react";

const METRIC_LABELS: Record<ImportableMetric, string> = {
  heartRate: "Heart Rate",
  weight: "Weight",
  bloodPressure: "Blood Pressure",
  glucose: "Glucose",
  water: "Water",
  steps: "Steps",
};

const CSV_TRACKER_OPTIONS: { value: CsvTracker; label: string }[] = [
  { value: "heartRate", label: "Heart Rate" },
  { value: "weight", label: "Weight" },
  { value: "bloodPressure", label: "Blood Pressure" },
  { value: "glucose", label: "Glucose" },
  { value: "water", label: "Water" },
  { value: "steps", label: "Steps" },
  { value: "mood", label: "Mood" },
];

const LARGE_IMPORT_WARNING_THRESHOLD = 15000;

function AppleHealthImport({ profileId, onDone }: { profileId: string; onDone: (count: number) => void }) {
  const { addLogEntries } = useAppData();
  const [file, setFile] = React.useState<File | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [scan, setScan] = React.useState<AppleHealthScanResult | null>(null);
  const [selectedMetrics, setSelectedMetrics] = React.useState<Set<ImportableMetric>>(new Set());
  const [since, setSince] = React.useState("");
  const [until, setUntil] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setScan(null);
    setError(null);
    setScanning(true);
    try {
      const result = await scanAppleHealthExport(f);
      setScan(result);
      setSelectedMetrics(new Set(Object.keys(result.countsByMetric) as ImportableMetric[]));
      setSince(result.earliestDate?.slice(0, 10) ?? "");
      setUntil(result.latestDate?.slice(0, 10) ?? "");
    } catch {
      setError("Couldn't read that file. Make sure it's the export.xml from an Apple Health export.");
    } finally {
      setScanning(false);
    }
  };

  const estimatedCount = scan
    ? Array.from(selectedMetrics).reduce((sum, m) => sum + (scan.countsByMetric[m] ?? 0), 0)
    : 0;

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const entries = await parseAppleHealthExport(file, profileId, {
        metrics: selectedMetrics,
        since: since ? new Date(since) : undefined,
        until: until ? new Date(new Date(until).setHours(23, 59, 59, 999)) : undefined,
      });
      const count = addLogEntries(entries);
      onDone(count);
    } catch {
      setError("Something went wrong reading that file partway through. No changes were made.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="apple-health-file">Apple Health export file (export.xml)</Label>
        <label
          htmlFor="apple-health-file"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center hover:border-primary"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{file ? file.name : "Tap to choose export.xml"}</span>
          <input id="apple-health-file" type="file" accept=".xml,text/xml,application/xml" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
        <p className="text-xs text-muted-foreground">
          From the Health app: your profile picture → Export All Health Data. Unzip the download and pick the
          export.xml file inside.
        </p>
      </div>

      {scanning && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading file — this can take a moment for a large export.
        </p>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {scan && scan.totalRecognizedRecords === 0 && (
        <p className="text-sm text-muted-foreground">No recognizable records found in that file.</p>
      )}

      {scan && scan.totalRecognizedRecords > 0 && (
        <>
          <div className="flex flex-col gap-1.5">
            {(Object.keys(scan.countsByMetric) as ImportableMetric[]).map((metric) => (
              <label key={metric} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <span>{METRIC_LABELS[metric]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{scan.countsByMetric[metric]} records</span>
                  <Switch
                    checked={selectedMetrics.has(metric)}
                    onCheckedChange={(checked) =>
                      setSelectedMetrics((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(metric);
                        else next.delete(metric);
                        return next;
                      })
                    }
                  />
                </div>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input type="date" value={since} onChange={(e) => setSince(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Will import roughly {estimatedCount.toLocaleString()} records
            {scan.earliestDate && scan.latestDate && ` from your selected range within ${formatDate(scan.earliestDate)} – ${formatDate(scan.latestDate)}`}.
          </p>

          {estimatedCount > LARGE_IMPORT_WARNING_THRESHOLD && (
            <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              That's a large import — on-device storage is limited, so narrowing the date range or metrics (e.g. a
              year at a time) is safer than importing everything at once.
            </p>
          )}

          <Button onClick={handleImport} disabled={importing || selectedMetrics.size === 0} className="self-start">
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? "Importing…" : "Import Selected Data"}
          </Button>
        </>
      )}
    </div>
  );
}

function CsvImport({ profileId, onDone }: { profileId: string; onDone: (count: number, skipped: number) => void }) {
  const { addLogEntries } = useAppData();
  const [rows, setRows] = React.useState<string[][] | null>(null);
  const [hasHeader, setHasHeader] = React.useState(true);
  const [tracker, setTracker] = React.useState<CsvTracker>("heartRate");
  const [dateColumn, setDateColumn] = React.useState(0);
  const [valueColumn, setValueColumn] = React.useState(1);
  const [secondValueColumn, setSecondValueColumn] = React.useState(2);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setError("That file doesn't look like a CSV with any data in it.");
        return;
      }
      setRows(parsed);
    };
    reader.onerror = () => setError("Couldn't read that file.");
    reader.readAsText(f);
  };

  const columnCount = rows?.[0]?.length ?? 0;
  const columnLabel = (i: number) => (hasHeader && rows?.[0]?.[i] ? rows[0][i] : `Column ${i + 1}`);

  const handleImport = () => {
    if (!rows) return;
    const mapping: CsvMapping = {
      tracker,
      dateColumn,
      valueColumn,
      secondValueColumn: tracker === "bloodPressure" ? secondValueColumn : undefined,
    };
    const { entries, skipped } = buildEntriesFromCsv(rows, hasHeader, mapping, profileId);
    const count = addLogEntries(entries);
    onDone(count, skipped);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="csv-file">CSV file</Label>
        <label
          htmlFor="csv-file"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center hover:border-primary"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{rows ? `${rows.length} rows loaded` : "Tap to choose a .csv file"}</span>
          <input id="csv-file" type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {rows && (
        <>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>First row is a header</span>
            <Switch checked={hasHeader} onCheckedChange={setHasHeader} />
          </label>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">What does this file contain?</Label>
            <Select value={tracker} onValueChange={(v) => setTracker(v as CsvTracker)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CSV_TRACKER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Date column</Label>
              <Select value={String(dateColumn)} onValueChange={(v) => setDateColumn(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: columnCount }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {columnLabel(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">{tracker === "bloodPressure" ? "Systolic column" : "Value column"}</Label>
              <Select value={String(valueColumn)} onValueChange={(v) => setValueColumn(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: columnCount }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {columnLabel(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {tracker === "bloodPressure" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Diastolic column</Label>
              <Select value={String(secondValueColumn)} onValueChange={(v) => setSecondValueColumn(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: columnCount }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {columnLabel(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleImport} className="self-start">
            <Upload className="h-4 w-4" /> Import from CSV
          </Button>
        </>
      )}
    </div>
  );
}

export function ImportDataDialog({
  open,
  onOpenChange,
  profileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}) {
  const [source, setSource] = React.useState<"apple" | "csv">("apple");
  const [result, setResult] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setResult(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> Import Data
          </DialogTitle>
          <DialogDescription>
            Everything here is read and parsed on this device — the file is never uploaded anywhere. This adds new
            entries; it won't change or remove anything already logged.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium">{result}</p>
          </div>
        ) : (
          <>
            <Tabs value={source} onValueChange={(v) => setSource(v as typeof source)}>
              <TabsList>
                <TabsTrigger value="apple">Apple Health</TabsTrigger>
                <TabsTrigger value="csv">CSV File</TabsTrigger>
              </TabsList>
            </Tabs>

            {source === "apple" ? (
              <AppleHealthImport profileId={profileId} onDone={(count) => setResult(`Imported ${count.toLocaleString()} entries.`)} />
            ) : (
              <CsvImport
                profileId={profileId}
                onDone={(count, skipped) =>
                  setResult(`Imported ${count.toLocaleString()} entries${skipped > 0 ? ` (${skipped} rows skipped — missing or unreadable date/value)` : ""}.`)
                }
              />
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {result ? "Done" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
