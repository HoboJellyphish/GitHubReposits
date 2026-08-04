import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData } from "@/state/AppDataContext";
import { fromDatetimeLocalValue, nowIso, toDatetimeLocalValue } from "@/lib/format";
import { Pill, Search, Clock, Check, X as XIcon, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DoseStatus } from "@/types";

const STATUS_OPTIONS: { value: DoseStatus; label: string; icon: typeof Check }[] = [
  { value: "taken", label: "Taken", icon: Check },
  { value: "missed", label: "Missed", icon: XIcon },
  { value: "skipped", label: "Skipped", icon: MinusCircle },
];

export function MedicationDoseDialog({
  open,
  onOpenChange,
  profileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}) {
  const { listMedications, addDose } = useAppData();
  const medications = listMedications(profileId).filter((m) => m.active);
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<DoseStatus>("taken");
  const [timestamp, setTimestamp] = React.useState(nowIso());
  const [showBackdate, setShowBackdate] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedId(medications.length === 1 ? medications[0].id : null);
      setStatus("taken");
      setTimestamp(nowIso());
      setShowBackdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = medications.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const selected = medications.find((m) => m.id === selectedId) ?? null;

  const handleLog = () => {
    if (!selected) return;
    addDose({ profileId, medicationId: selected.id, timestamp, status });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-tracker-medications" /> Log Dose
          </DialogTitle>
          <DialogDescription>Pick from this profile's personal medication list.</DialogDescription>
        </DialogHeader>

        {medications.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active medications yet. Add one from the Medications page first.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {!selected && (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Search medications…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
                  {filtered.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedId(m.id)}
                      className="flex items-center gap-3 rounded-lg border border-border p-2.5 text-left hover:bg-secondary"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: m.color + "26" }}
                      >
                        <Pill className="h-4 w-4" style={{ color: m.color }} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{m.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {m.dosage} {m.frequency && `· ${m.frequency}`}
                        </span>
                      </span>
                    </button>
                  ))}
                  {filtered.length === 0 && <p className="p-2 text-sm text-muted-foreground">No matches.</p>}
                </div>
              </>
            )}

            {selected && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-3 self-start rounded-lg border border-primary bg-primary/5 p-2.5 text-left"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: selected.color + "26" }}
                  >
                    <Pill className="h-4 w-4" style={{ color: selected.color }} />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{selected.name}</span>
                    <span className="block text-xs text-muted-foreground">Tap to change</span>
                  </span>
                </button>

                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium",
                          status === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                        )}
                      >
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!showBackdate && (
                  <button
                    type="button"
                    onClick={() => setShowBackdate(true)}
                    className="flex items-center gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Clock className="h-3.5 w-3.5" /> This happened earlier — set a custom time
                  </button>
                )}
                {showBackdate && (
                  <div className="flex flex-col gap-1.5">
                    <Label>Date &amp; time</Label>
                    <Input
                      type="datetime-local"
                      value={toDatetimeLocalValue(timestamp)}
                      onChange={(e) => setTimestamp(fromDatetimeLocalValue(e.target.value))}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLog} disabled={!selected}>
            Log Dose
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
