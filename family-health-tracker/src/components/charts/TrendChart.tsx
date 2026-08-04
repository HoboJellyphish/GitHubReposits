import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_CONFIG, buildTrendPoints, filterByRange } from "@/lib/chartData";
import type { AnyLogEntry, TrackerId } from "@/types";
import { formatDateTime } from "@/lib/format";

const PRIMARY_COLOR = "var(--color-primary)";
const SECONDARY_COLOR = "oklch(0.65 0.16 30)";

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: string }; name: string; value: number; color: string }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{formatDateTime(point.timestamp)}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? Math.round(p.value * 10) / 10 : p.value}
        </p>
      ))}
    </div>
  );
}

export function TrendChart({
  trackerId,
  entries,
  start,
  end,
  range,
}: {
  trackerId: TrackerId;
  entries: AnyLogEntry[];
  start: Date;
  end: Date;
  range: "day" | "week" | "month" | "custom";
}) {
  const config = CHART_CONFIG[trackerId];
  const inRange = React.useMemo(() => filterByRange(entries, start, end), [entries, start, end]);

  const granularity: "raw" | "daily" =
    range === "day" && (config?.kind === "line" || config?.kind === "dual-line") ? "raw" : "daily";
  const points = React.useMemo(() => buildTrendPoints(trackerId, inRange, granularity), [trackerId, inRange, granularity]);

  if (!config) return null;

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No {config.primaryLabel.toLowerCase()} data in this range yet.
      </div>
    );
  }

  const isBar = config.kind === "bar-sum" || config.kind === "bar-count";

  // Computed explicitly rather than left to Recharts' "auto" domain, which
  // has proven unreliable (can render a flat 0 axis) for small datasets.
  const allValues = points.flatMap((p) => [p.value, p.value2]).filter((v): v is number => typeof v === "number");
  const dataMin = allValues.length ? Math.min(...allValues, 0) : 0;
  const dataMax = allValues.length ? Math.max(...allValues) : 1;
  const padding = Math.max((dataMax - dataMin) * 0.15, 1);
  const lineDomain: [number, number] = [Math.floor(dataMin - (dataMin > 0 ? padding : 0)), Math.ceil(dataMax + padding)];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {isBar ? (
          <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" width={44} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name={config.primaryLabel} fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" width={44} domain={lineDomain} />
            <Tooltip content={<ChartTooltip />} />
            {config.kind === "dual-line" && <Legend wrapperStyle={{ fontSize: 11 }} />}
            <Line type="monotone" dataKey="value" name={config.primaryLabel} stroke={PRIMARY_COLOR} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            {config.kind === "dual-line" && (
              <Line type="monotone" dataKey="value2" name={config.secondaryLabel} stroke={SECONDARY_COLOR} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
