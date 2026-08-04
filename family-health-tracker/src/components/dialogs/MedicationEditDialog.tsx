import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAppData } from "@/state/AppDataContext";
import type { Medication } from "@/types";

const MED_COLORS = [
  "oklch(0.6 0.19 25)",
  "oklch(0.6 0.16 145)",
  "oklch(0.6 0.16 250)",
  "oklch(0.65 0.16 90)",
  "oklch(0.55 0.18 320)",
  "oklch(0.6 0.14 200)",
];

export function MedicationEditDialog({
  open,
  onOpenChange,
  profileId,
  medication,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  medication?: Medication;
}) {
  const { addMedication, updateMedication } = useAppData();
  const [name, setName] = React.useState("");
  const [dosage, setDosage] = React.useState("");
  const [frequency, setFrequency] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [color, setColor] = React.useState(MED_COLORS[0]);
  const [active, setActive] = React.useState(true);
  const [reminderTime, setReminderTime] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(medication?.name ?? "");
      setDosage(medication?.dosage ?? "");
      setFrequency(medication?.frequency ?? "");
      setNotes(medication?.notes ?? "");
      setColor(medication?.color ?? MED_COLORS[0]);
      setActive(medication?.active ?? true);
      setReminderTime(medication?.reminderTimes?.[0] ?? "");
    }
  }, [open, medication]);

  const handleSave = () => {
    if (!name.trim()) return;
    const reminderTimes = reminderTime ? [reminderTime] : [];
    if (medication) {
      updateMedication(medication.id, {
        name: name.trim(),
        dosage,
        frequency,
        notes: notes || undefined,
        color,
        active,
        reminderTimes,
      });
    } else {
      addMedication({
        profileId,
        name: name.trim(),
        dosage,
        frequency,
        notes: notes || undefined,
        color,
        icon: "pill",
        active,
        reminderTimes,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{medication ? "Edit Medication" : "Add Medication"}</DialogTitle>
          <DialogDescription>This medication will appear in this profile's personal list only.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="med-name">Name</Label>
            <Input id="med-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vitamin D" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="med-dosage">Dosage</Label>
              <Input id="med-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 1000 IU" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="med-frequency">Frequency</Label>
              <Input id="med-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g. Once daily" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="med-notes">Prescribing notes (optional)</Label>
            <Textarea id="med-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="med-reminder">Reminder time (optional)</Label>
            <Input id="med-reminder" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {MED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={"h-8 w-8 rounded-full " + (color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "")}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Inactive meds stay in history but drop off the dose picker.</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {medication ? "Save Changes" : "Add Medication"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
