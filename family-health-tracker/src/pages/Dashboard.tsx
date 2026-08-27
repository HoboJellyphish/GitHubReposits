import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { getTracker } from "@/lib/trackers";
import { currentSleepState } from "@/lib/sleep";
import { formatRelative } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { LogEntryDialog } from "@/components/dialogs/LogEntryDialog";
import { SleepDialog } from "@/components/dialogs/SleepDialog";
import { MedicationDoseDialog } from "@/components/dialogs/MedicationDoseDialog";
import type { AnyLogEntry, TrackerId } from "@/types";
import { Eye, EyeOff, Settings2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppButton } from "@/components/AppButton";
import { calculateAge } from "@/lib/format";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function lastEntryFor(entries: AnyLogEntry[], trackerId: TrackerId): AnyLogEntry | undefined {
  return entries
    .filter((e) => e.trackerId === trackerId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
}

function summarize(entry: AnyLogEntry | undefined): string {
  if (!entry) return "No entries yet";
  const d = entry.data as Record<string, unknown>;
  switch (entry.trackerId) {
    case "heartRate":
      return `${d.bpm} bpm`;
    case "sleep":
      return d.state === "asleep" ? "Asleep" : `Awake${d.durationMinutes ? ` · slept ${Math.round(Number(d.durationMinutes) / 60)}h` : ""}`;
    case "meals":
      return String(d.category || d.mealType);
    case "weight":
      return `${d.kg} kg`;
    case "bloodPressure":
      return `${d.systolic}/${d.diastolic}`;
    case "glucose":
      return `${d.mgdl} mg/dL`;
    case "mood":
      return `${d.rating}/5`;
    case "symptoms":
      return String(d.description);
    case "water":
      return `${d.ml} mL`;
    case "steps":
      return `${d.count} steps`;
    default:
      return "Logged";
  }
}

export function Dashboard({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { activeProfile, getPreferences, listLogEntries, listConnections, syncWearable } = useAppData();
  const [openTracker, setOpenTracker] = React.useState<TrackerId | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  if (!activeProfile) return null;

  const prefs = getPreferences(activeProfile.id);
  const entries = listLogEntries(activeProfile.id);
  const connections = listConnections(activeProfile.id).filter((c) => c.status === "connected");
  const age = calculateAge(activeProfile.dob);

  const visibleItems = [...prefs.dashboardItems].filter((i) => i.visible).sort((a, b) => a.order - b.order);
  const groups = Array.from(new Set(visibleItems.map((i) => i.group)));
  const sleepState = currentSleepState(entries);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      for (const c of connections) await syncWearable(c.id);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Hi, {activeProfile.name}
            {age !== null && <span className="text-muted-foreground font-normal"> · {age}y</span>}
          </h1>
          <p className="text-sm text-muted-foreground">Here's today's overview.</p>
        </div>
        <div className="flex gap-2">
          {connections.length > 0 && (
            <AppButton
              icon={RefreshCw}
              label={syncing ? "Syncing…" : "Sync Wearables"}
              layout="inline"
              variant="outline"
              size="sm"
              disabled={syncing}
              onClick={handleSyncAll}
              className={syncing ? "[&_svg]:animate-spin" : undefined}
            />
          )}
          <AppButton icon={Settings2} label="Customize" layout="inline" variant="ghost" size="sm" onClick={onOpenSettings} />
        </div>
      </div>

      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-3">
          {groups.length > 1 && <h2 className="text-sm font-semibold text-muted-foreground">{group}</h2>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {visibleItems
              .filter((i) => i.group === group)
              .map((item) => {
                const tracker = getTracker(item.trackerId);
                const Icon = item.trackerId === "sleep" ? (sleepState === "asleep" ? EyeOff : Eye) : tracker.icon;
                const last = lastEntryFor(entries, item.trackerId);
                const showIcon = prefs.buttonStyle === "icon" || prefs.buttonStyle === "both";
                const showLabel = prefs.buttonStyle === "text" || prefs.buttonStyle === "both";
                const iconOnly = prefs.buttonStyle === "icon";

                const iconEl = (
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ background: `color-mix(in oklch, ${tracker.colorVar} 18%, transparent)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: tracker.colorVar }} strokeWidth={2} />
                  </span>
                );

                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setOpenTracker(item.trackerId)}
                  >
                    <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                      {showIcon &&
                        (iconOnly ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{iconEl}</TooltipTrigger>
                            <TooltipContent>{tracker.label}</TooltipContent>
                          </Tooltip>
                        ) : (
                          iconEl
                        ))}
                      {showLabel && <span className="text-xs font-medium">{tracker.shortLabel}</span>}
                      <span
                        className={cn(
                          "text-[11px]",
                          last ? "text-muted-foreground" : "text-muted-foreground/60",
                        )}
                      >
                        {last ? `${summarize(last)} · ${formatRelative(last.timestamp)}` : "Tap to log"}
                      </span>
                      {last?.source === "wearable" && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                          wearable
                        </span>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}

      {visibleItems.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No trackers are enabled yet. Tap Customize to add some to this dashboard.
          </CardContent>
        </Card>
      )}

      {openTracker && openTracker !== "sleep" && openTracker !== "medications" && (
        <LogEntryDialog
          open
          onOpenChange={(o) => !o && setOpenTracker(null)}
          profileId={activeProfile.id}
          trackerId={openTracker}
        />
      )}
      {openTracker === "sleep" && (
        <SleepDialog open onOpenChange={(o) => !o && setOpenTracker(null)} profileId={activeProfile.id} />
      )}
      {openTracker === "medications" && (
        <MedicationDoseDialog open onOpenChange={(o) => !o && setOpenTracker(null)} profileId={activeProfile.id} />
      )}
    </div>
  );
}
