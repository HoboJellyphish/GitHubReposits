import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { getTracker } from "@/lib/trackers";
import { CHART_CONFIG, filterByRange, buildTrendPoints } from "@/lib/chartData";
import { TrendChart } from "@/components/charts/TrendChart";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TrackerId } from "@/types";

const CHARTABLE_TRACKER_IDS = Object.keys(CHART_CONFIG) as TrackerId[];

function rangeToDates(range: "day" | "week" | "month" | "custom", customStart: string, customEnd: string) {
  const end = new Date();
  const start = new Date();
  if (range === "day") start.setHours(0, 0, 0, 0);
  else if (range === "week") start.setDate(start.getDate() - 7);
  else if (range === "month") start.setDate(start.getDate() - 30);
  else {
    return {
      start: customStart ? new Date(customStart) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: customEnd ? new Date(new Date(customEnd).setHours(23, 59, 59, 999)) : end,
    };
  }
  return { start, end };
}

export function Trends() {
  const { activeProfile, listLogEntries } = useAppData();
  const [trackerId, setTrackerId] = React.useState<TrackerId>("heartRate");
  const [range, setRange] = React.useState<"day" | "week" | "month" | "custom">("week");
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");

  if (!activeProfile) return null;

  const entries = listLogEntries(activeProfile.id);
  const { start, end } = rangeToDates(range, customStart, customEnd);
  const config = CHART_CONFIG[trackerId];

  const inRange = filterByRange(entries, start, end);
  const granularity = range === "day" && (config?.kind === "line" || config?.kind === "dual-line") ? "raw" : "daily";
  const points = buildTrendPoints(trackerId, inRange, granularity);
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Trends</h1>
        <p className="text-sm text-muted-foreground">Individual charts for {activeProfile.name}.</p>
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
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {range === "custom" && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>From</Label>
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>To</Label>
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <TrendChart trackerId={trackerId} entries={entries} start={start} end={end} range={range} />
        </CardContent>
      </Card>

      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-semibold">
                {Math.round(avg! * 10) / 10} {config?.unit}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Min</p>
              <p className="text-lg font-semibold">
                {Math.round(min! * 10) / 10} {config?.unit}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Max</p>
              <p className="text-lg font-semibold">
                {Math.round(max! * 10) / 10} {config?.unit}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
