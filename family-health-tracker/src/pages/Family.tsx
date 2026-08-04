import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { getTracker } from "@/lib/trackers";
import { CHART_CONFIG, buildFamilyDailySeries, filterByRange, periodAggregate } from "@/lib/chartData";
import { FamilyCompareChart } from "@/components/charts/FamilyCompareChart";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import type { TrackerId } from "@/types";
import { Users } from "lucide-react";

const CHARTABLE_TRACKER_IDS = Object.keys(CHART_CONFIG) as TrackerId[];

function rangeToDates(range: "week" | "month") {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (range === "week" ? 7 : 30));
  return { start, end };
}

export function Family() {
  const { profiles, logEntries } = useAppData();
  const [trackerId, setTrackerId] = React.useState<TrackerId>("heartRate");
  const [range, setRange] = React.useState<"week" | "month">("week");

  const { start, end } = rangeToDates(range);
  const config = CHART_CONFIG[trackerId];

  const entriesByProfile = React.useMemo(() => {
    const map: Record<string, typeof logEntries> = {};
    for (const p of profiles) {
      map[p.id] = filterByRange(
        logEntries.filter((e) => e.profileId === p.id),
        start,
        end,
      );
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, logEntries, range]);

  const rows = React.useMemo(
    () => buildFamilyDailySeries(trackerId, profiles, entriesByProfile),
    [trackerId, profiles, entriesByProfile],
  );

  const series = profiles.map((p) => ({ id: p.id, name: p.name, color: p.avatarColor }));

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-muted-foreground">
        <Users className="h-8 w-8" />
        <p>Add a family member to see comparisons.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Family Comparison</h1>
        <p className="text-sm text-muted-foreground">See how everyone's data compares side by side.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={trackerId} onValueChange={(v) => setTrackerId(v as TrackerId)}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHARTABLE_TRACKER_IDS.map((t) => (
              <SelectItem key={t} value={t}>
                {getTracker(t).label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-4">
          <FamilyCompareChart rows={rows} series={series} unit={config?.unit} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {profiles.map((p) => {
          const agg = periodAggregate(trackerId, entriesByProfile[p.id] ?? []);
          return (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <ProfileAvatar profile={p} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {config?.kind === "bar-sum" || config?.kind === "bar-count" ? "Total" : "Average"} this{" "}
                    {range}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {agg !== null ? `${Math.round(agg * 10) / 10} ${config?.unit ?? ""}` : "—"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
