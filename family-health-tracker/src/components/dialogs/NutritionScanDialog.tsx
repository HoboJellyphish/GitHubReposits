import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { preloadOcr, recognizeText } from "@/lib/ocr";
import { parseNutritionLabel, type ParsedNutrition } from "@/lib/nutritionParse";
import { Upload, ScanLine, Loader2, AlertTriangle, ChevronDown } from "lucide-react";

const FIELDS: { key: keyof ParsedNutrition; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "carbsG", label: "Total Carbs", unit: "g" },
  { key: "fatG", label: "Total Fat", unit: "g" },
  { key: "fiberG", label: "Fiber", unit: "g" },
  { key: "sugarG", label: "Sugars", unit: "g" },
  { key: "sodiumMg", label: "Sodium", unit: "mg" },
];

export function NutritionScanDialog({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (data: ParsedNutrition) => void;
}) {
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [rawText, setRawText] = React.useState("");
  const [showRaw, setShowRaw] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      // Start warming up the OCR engine as soon as the dialog opens, so
      // it's likely already loaded by the time a photo is picked.
      preloadOcr();
      setPhoto(null);
      setError(null);
      setValues({});
      setRawText("");
      setShowRaw(false);
    }
  }, [open]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhoto(dataUrl);
      setScanning(true);
      try {
        const text = await recognizeText(file);
        setRawText(text);
        const parsed = parseNutritionLabel(text);
        setValues(
          Object.fromEntries(FIELDS.map((f) => [f.key, parsed[f.key] !== undefined ? String(parsed[f.key]) : ""])),
        );
        if (Object.values(parsed).every((v) => v === undefined)) {
          setError("Couldn't recognize any nutrition values in that photo — try a clearer, well-lit shot, or enter values manually below.");
        }
      } catch {
        setError("Scanning failed. You can still enter values manually below.");
      } finally {
        setScanning(false);
      }
    };
    reader.onerror = () => setError("Couldn't read that photo.");
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    const data: ParsedNutrition = {};
    for (const f of FIELDS) {
      const raw = values[f.key];
      if (raw && raw.trim() !== "" && !Number.isNaN(Number(raw))) {
        (data as Record<string, number>)[f.key] = Number(raw);
      }
    }
    onApply(data);
    onOpenChange(false);
  };

  const hasAnyValue = Object.values(values).some((v) => v && v.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-4 w-4" /> Scan Nutrition Label
          </DialogTitle>
          <DialogDescription>
            Reads the label entirely on this device — the photo is never sent anywhere. Scanning isn't perfect, so
            double-check the numbers below before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!photo && (
            <label
              htmlFor="nutrition-photo"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center hover:border-primary"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tap to take or choose a photo of the label</span>
              <input
                id="nutrition-photo"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          )}

          {photo && (
            <div className="flex gap-3">
              <img src={photo} alt="Nutrition label" className="h-32 w-24 shrink-0 rounded-lg border border-border object-cover" />
              <div className="flex flex-col justify-center gap-1">
                {scanning ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Reading label…
                  </p>
                ) : (
                  <label htmlFor="nutrition-photo-retake" className="cursor-pointer text-xs text-primary underline">
                    Retake photo
                    <input
                      id="nutrition-photo-retake"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
            </p>
          )}

          {(photo && !scanning) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map((f) => (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {f.label} {f.unit && `(${f.unit})`}
                    </Label>
                    <Input
                      type="number"
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
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
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!hasAnyValue}>
            Use These Values
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
