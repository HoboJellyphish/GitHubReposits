import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/state/AppDataContext";
import { LAB_PANEL_TYPES, getLabPanelType } from "@/lib/labs";
import { id as newId } from "@/lib/format";
import type { LabPanel, LabPanelType } from "@/types";
import { Plus, Trash2, FlaskConical } from "lucide-react";

interface ValueRow {
  key: string;
  name: string;
  value: string;
  unit: string;
  referenceLow: string;
  referenceHigh: string;
}

function rowsFromPreset(panelType: LabPanelType): ValueRow[] {
  return getLabPanelType(panelType).presetValues.map((p) => ({
    key: newId(),
    name: p.name,
    value: "",
    unit: p.unit,
    referenceLow: p.referenceLow?.toString() ?? "",
    referenceHigh: p.referenceHigh?.toString() ?? "",
  }));
}

function emptyCustomRow(): ValueRow {
  return { key: newId(), name: "", value: "", unit: "", referenceLow: "", referenceHigh: "" };
}

export function LabPanelDialog({
  open,
  onOpenChange,
  profileId,
  documentId,
  existing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  documentId?: string;
  existing?: LabPanel;
}) {
  const { addLabPanel, updateLabPanel, deleteLabPanel } = useAppData();
  const [panelType, setPanelType] = React.useState<LabPanelType>(existing?.panelType ?? "thyroid");
  const [title, setTitle] = React.useState(existing?.title ?? "");
  const [testDate, setTestDate] = React.useState(() => (existing?.testDate ?? new Date().toISOString()).slice(0, 10));
  const [rows, setRows] = React.useState<ValueRow[]>(
    existing
      ? existing.values.map((v) => ({
          key: newId(),
          name: v.name,
          value: String(v.value),
          unit: v.unit,
          referenceLow: v.referenceLow?.toString() ?? "",
          referenceHigh: v.referenceHigh?.toString() ?? "",
        }))
      : rowsFromPreset("thyroid"),
  );
  const [note, setNote] = React.useState(existing?.note ?? "");

  React.useEffect(() => {
    if (!open) return;
    setPanelType(existing?.panelType ?? "thyroid");
    setTitle(existing?.title ?? "");
    setTestDate((existing?.testDate ?? new Date().toISOString()).slice(0, 10));
    setNote(existing?.note ?? "");
    setRows(
      existing
        ? existing.values.map((v) => ({
            key: newId(),
            name: v.name,
            value: String(v.value),
            unit: v.unit,
            referenceLow: v.referenceLow?.toString() ?? "",
            referenceHigh: v.referenceHigh?.toString() ?? "",
          }))
        : rowsFromPreset("thyroid"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing]);

  const handlePanelTypeChange = (v: LabPanelType) => {
    setPanelType(v);
    if (!existing) setRows(rowsFromPreset(v));
  };

  const updateRow = (key: string, patch: Partial<ValueRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const removeRow = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));

  const validRows = rows.filter((r) => r.name.trim() !== "" && r.value.trim() !== "" && !Number.isNaN(Number(r.value)));

  const handleSave = () => {
    const panelLabel = getLabPanelType(panelType).label;
    const resolvedTitle = title.trim() || panelLabel;
    const values = validRows.map((r) => ({
      name: r.name.trim(),
      value: Number(r.value),
      unit: r.unit.trim(),
      referenceLow: r.referenceLow.trim() ? Number(r.referenceLow) : undefined,
      referenceHigh: r.referenceHigh.trim() ? Number(r.referenceHigh) : undefined,
    }));
    const testDateIso = new Date(testDate).toISOString();
    if (existing) {
      updateLabPanel(existing.id, { panelType, title: resolvedTitle, testDate: testDateIso, values, note: note || undefined });
    } else {
      addLabPanel({
        profileId,
        panelType,
        title: resolvedTitle,
        testDate: testDateIso,
        values,
        documentId,
        note: note || undefined,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" /> {existing ? "Edit Lab Panel" : "Add Lab Panel"}
          </DialogTitle>
          <DialogDescription>
            Reference ranges shown are typical adult values, for orientation only — always go by the range printed on
            your own lab report, since it varies by lab, method, age, and sex.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Panel type</Label>
              <Select value={panelType} onValueChange={(v) => handlePanelTypeChange(v as LabPanelType)}>
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
              <Label>Test date</Label>
              <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={getLabPanelType(panelType).label} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Values</Label>
            {rows.map((row) => (
              <div key={row.key} className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input value={row.name} onChange={(e) => updateRow(row.key, { name: e.target.value })} placeholder="e.g. TSH" />
                  </div>
                  <div className="flex w-24 flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    <Input type="number" value={row.value} onChange={(e) => updateRow(row.key, { value: e.target.value })} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(row.key)} className="shrink-0 text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Unit</Label>
                    <Input value={row.unit} onChange={(e) => updateRow(row.key, { unit: e.target.value })} placeholder="mg/dL" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Low</Label>
                    <Input type="number" value={row.referenceLow} onChange={(e) => updateRow(row.key, { referenceLow: e.target.value })} />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">High</Label>
                    <Input type="number" value={row.referenceHigh} onChange={(e) => updateRow(row.key, { referenceHigh: e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setRows((rs) => [...rs, emptyCustomRow()])}>
              <Plus className="h-3.5 w-3.5" /> Add value
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter className="items-center justify-between sm:justify-between">
          {existing ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                deleteLabPanel(existing.id);
                onOpenChange(false);
              }}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleSave} disabled={validRows.length === 0}>
            {existing ? "Save Changes" : "Save Panel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
