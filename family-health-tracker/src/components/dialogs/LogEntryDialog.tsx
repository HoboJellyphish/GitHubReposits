import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/state/AppDataContext";
import { getTracker } from "@/lib/trackers";
import { fromDatetimeLocalValue, nowIso, toDatetimeLocalValue } from "@/lib/format";
import { VoiceInputButton } from "@/components/VoiceInputButton";
import { VoiceNumberInput } from "@/components/VoiceNumberInput";
import { extractTwoSpokenNumbers } from "@/lib/voiceNumber";
import type { AnyLogEntry, TrackerId } from "@/types";
import { Clock } from "lucide-react";

/** Dictated text replaces an empty field, or is appended (with a space) to
 * whatever's already there — lets someone dictate a note in more than one
 * take without losing what they already said. */
function appendDictation(existing: string, spoken: string): string {
  return existing.trim() ? `${existing.trim()} ${spoken}` : spoken;
}

type LoggableTrackerId = Exclude<TrackerId, "medications" | "sleep">;

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "drink", label: "Drink" },
  { value: "other", label: "Other" },
];

function buildDefaultData(trackerId: LoggableTrackerId): Record<string, unknown> {
  switch (trackerId) {
    case "heartRate":
      return { bpm: 72, context: "resting" };
    case "meals":
      return { mealType: "snack", category: "", portion: "" };
    case "weight":
      return { kg: 0 };
    case "bloodPressure":
      return { systolic: 120, diastolic: 80 };
    case "glucose":
      return { mgdl: 100 };
    case "mood":
      return { rating: 3 };
    case "symptoms":
      return { description: "", severity: 2 };
    case "water":
      return { ml: 250 };
    case "steps":
      return { count: 1000 };
    default:
      return {};
  }
}

export function LogEntryDialog({
  open,
  onOpenChange,
  profileId,
  trackerId,
  existing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  trackerId: LoggableTrackerId;
  existing?: AnyLogEntry;
}) {
  const { addLogEntry, updateLogEntry, deleteLogEntry } = useAppData();
  const tracker = getTracker(trackerId);
  const [timestamp, setTimestamp] = React.useState(nowIso());
  const [note, setNote] = React.useState("");
  const [data, setData] = React.useState<Record<string, unknown>>(buildDefaultData(trackerId));
  const [showBackdate, setShowBackdate] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTimestamp(existing?.timestamp ?? nowIso());
      setNote(existing?.note ?? "");
      setData(existing ? { ...existing.data } : buildDefaultData(trackerId));
      setShowBackdate(false);
    }
  }, [open, existing, trackerId]);

  const set = (key: string, value: unknown) => setData((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (existing) {
      updateLogEntry(existing.id, { timestamp, note: note || undefined, data: data as never });
    } else {
      addLogEntry({
        profileId,
        trackerId,
        timestamp,
        source: "manual",
        note: note || undefined,
        data: data as never,
      });
    }
    onOpenChange(false);
  };

  const handleLogNow = () => {
    addLogEntry({
      profileId,
      trackerId,
      timestamp: nowIso(),
      source: "manual",
      note: undefined,
      data: buildDefaultData(trackerId) as never,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <tracker.icon className="h-4 w-4" style={{ color: tracker.colorVar }} />
            {existing ? `Edit ${tracker.label} Entry` : tracker.quickLogLabel}
          </DialogTitle>
          <DialogDescription>{tracker.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {trackerId === "heartRate" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>BPM</Label>
                <VoiceNumberInput
                  value={Number(data.bpm ?? 0)}
                  onChange={(n) => set("bpm", n)}
                  min={20}
                  max={260}
                  voiceLabel="Dictate heart rate"
                  round
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Context</Label>
                <Select value={String(data.context ?? "resting")} onValueChange={(v) => set("context", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resting">Resting</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {trackerId === "meals" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Meal type</Label>
                <Select value={String(data.mealType ?? "snack")} onValueChange={(v) => set("mealType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Food / category</Label>
                <div className="relative">
                  <Input
                    value={String(data.category ?? "")}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="e.g. Chicken salad"
                    className="pr-10"
                  />
                  <VoiceInputButton
                    className="absolute right-1.5 top-1/2 -translate-y-1/2"
                    label="Dictate food"
                    onResult={(text) => set("category", appendDictation(String(data.category ?? ""), text))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Portion notes</Label>
                <div className="relative">
                  <Input
                    value={String(data.portion ?? "")}
                    onChange={(e) => set("portion", e.target.value)}
                    placeholder="e.g. one bowl"
                    className="pr-10"
                  />
                  <VoiceInputButton
                    className="absolute right-1.5 top-1/2 -translate-y-1/2"
                    label="Dictate portion"
                    onResult={(text) => set("portion", appendDictation(String(data.portion ?? ""), text))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Photo (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => set("photoDataUrl", reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
                {typeof data.photoDataUrl === "string" && data.photoDataUrl && (
                  <img src={data.photoDataUrl} alt="Meal" className="mt-1 h-28 w-full rounded-lg object-cover" />
                )}
              </div>
            </>
          )}

          {trackerId === "weight" && (
            <div className="flex flex-col gap-1.5">
              <Label>Weight (kg)</Label>
              <VoiceNumberInput value={Number(data.kg ?? 0)} onChange={(n) => set("kg", n)} step="0.1" voiceLabel="Dictate weight" />
            </div>
          )}

          {trackerId === "bloodPressure" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Reading</Label>
                <VoiceInputButton
                  label={'Dictate both, e.g. "118 over 76"'}
                  onResult={(text) => {
                    const pair = extractTwoSpokenNumbers(text);
                    if (pair) {
                      set("systolic", pair[0]);
                      set("diastolic", pair[1]);
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Systolic</Label>
                  <VoiceNumberInput value={Number(data.systolic ?? 0)} onChange={(n) => set("systolic", n)} voiceLabel="Dictate systolic" round />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Diastolic</Label>
                  <VoiceNumberInput value={Number(data.diastolic ?? 0)} onChange={(n) => set("diastolic", n)} voiceLabel="Dictate diastolic" round />
                </div>
              </div>
            </div>
          )}

          {trackerId === "glucose" && (
            <div className="flex flex-col gap-1.5">
              <Label>Glucose (mg/dL)</Label>
              <VoiceNumberInput value={Number(data.mgdl ?? 0)} onChange={(n) => set("mgdl", n)} voiceLabel="Dictate glucose" round />
            </div>
          )}

          {trackerId === "mood" && (
            <div className="flex flex-col gap-1.5">
              <Label>Mood (1 = low, 5 = great)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("rating", n)}
                    className={
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold " +
                      (Number(data.rating) === n ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {trackerId === "symptoms" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Description</Label>
                <div className="relative">
                  <Input
                    value={String(data.description ?? "")}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="e.g. Headache"
                    className="pr-10"
                  />
                  <VoiceInputButton
                    className="absolute right-1.5 top-1/2 -translate-y-1/2"
                    label="Dictate symptom"
                    onResult={(text) => set("description", appendDictation(String(data.description ?? ""), text))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Severity (1-5)</Label>
                <VoiceNumberInput
                  value={Number(data.severity ?? 1)}
                  onChange={(n) => set("severity", n)}
                  min={1}
                  max={5}
                  voiceLabel="Dictate severity"
                  round
                />
              </div>
            </>
          )}

          {trackerId === "water" && (
            <div className="flex flex-col gap-1.5">
              <Label>Amount (mL)</Label>
              <VoiceNumberInput value={Number(data.ml ?? 0)} onChange={(n) => set("ml", n)} step="50" voiceLabel="Dictate water amount" round />
            </div>
          )}

          {trackerId === "steps" && (
            <div className="flex flex-col gap-1.5">
              <Label>Steps</Label>
              <VoiceNumberInput value={Number(data.count ?? 0)} onChange={(n) => set("count", n)} step="100" min={0} voiceLabel="Dictate steps" round />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Note (optional)</Label>
            <div className="relative">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="pr-10" />
              <VoiceInputButton
                className="absolute right-1.5 top-2"
                label="Dictate note"
                onResult={(text) => setNote((prev) => appendDictation(prev, text))}
              />
            </div>
          </div>

          {!showBackdate && !existing && (
            <button
              type="button"
              onClick={() => setShowBackdate(true)}
              className="flex items-center gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground"
            >
              <Clock className="h-3.5 w-3.5" /> This happened earlier — set a custom time
            </button>
          )}

          {(showBackdate || existing) && (
            <div className="flex flex-col gap-1.5">
              <Label>Date &amp; time</Label>
              <Input
                type="datetime-local"
                value={toDatetimeLocalValue(timestamp)}
                onChange={(e) => setTimestamp(fromDatetimeLocalValue(e.target.value))}
              />
            </div>
          )}
        </div>

        <DialogFooter className="items-center justify-between sm:justify-between">
          {existing ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                deleteLogEntry(existing.id);
                onOpenChange(false);
              }}
            >
              Delete
            </Button>
          ) : (
            <Button variant="outline" onClick={handleLogNow} className="sm:mr-auto">
              Quick-log now
            </Button>
          )}
          <Button onClick={handleSave}>{existing ? "Save Changes" : "Save Entry"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
