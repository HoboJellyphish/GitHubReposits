import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData } from "@/state/AppDataContext";
import { currentSleepState, latestSleepEntry } from "@/lib/sleep";
import { fromDatetimeLocalValue, nowIso, toDatetimeLocalValue } from "@/lib/format";
import { Moon, Sun, Clock } from "lucide-react";

export function SleepDialog({
  open,
  onOpenChange,
  profileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}) {
  const { listLogEntries, addLogEntry } = useAppData();
  const entries = listLogEntries(profileId);
  const state = currentSleepState(entries);
  const latest = latestSleepEntry(entries);

  const [timestamp, setTimestamp] = React.useState(nowIso());
  const [showBackdate, setShowBackdate] = React.useState(false);
  const [quality, setQuality] = React.useState(3);
  const [interruptions, setInterruptions] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setTimestamp(nowIso());
      setShowBackdate(false);
      setQuality(3);
      setInterruptions(0);
    }
  }, [open]);

  const goingToSleep = state !== "asleep";

  const handleLog = () => {
    if (goingToSleep) {
      addLogEntry({
        profileId,
        trackerId: "sleep",
        timestamp,
        source: "manual",
        data: { state: "asleep" },
      });
    } else {
      const durationMinutes = latest
        ? Math.max(0, Math.round((new Date(timestamp).getTime() - new Date(latest.timestamp).getTime()) / 60000))
        : undefined;
      addLogEntry({
        profileId,
        trackerId: "sleep",
        timestamp,
        source: "manual",
        data: {
          state: "awake",
          qualityRating: quality,
          interruptions,
          durationMinutes,
          linkedEntryId: latest?.id,
        },
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {goingToSleep ? <Moon className="h-4 w-4 text-tracker-sleep" /> : <Sun className="h-4 w-4 text-tracker-sleep" />}
            {goingToSleep ? "Going to sleep" : "Waking up"}
          </DialogTitle>
          <DialogDescription>
            {goingToSleep
              ? "Mark the start of a sleep session."
              : "Mark wake-up and rate how the sleep went."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!goingToSleep && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Sleep quality</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuality(n)}
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold " +
                        (quality === n ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Interruptions</Label>
                <Input type="number" min={0} value={interruptions} onChange={(e) => setInterruptions(Number(e.target.value))} />
              </div>
            </>
          )}

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLog}>{goingToSleep ? "Mark asleep" : "Mark awake"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
