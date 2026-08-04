import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { FamilySeriesRow } from "@/lib/chartData";
import { formatDateTime } from "@/lib/format";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FamilySeriesRow; name: string; value: number; color: string }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{formatDateTime(point.timestamp)}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? Math.round(p.value * 10) / 10 : "—"}
        </p>
      ))}
    </div>
  );
}

export function FamilyCompareChart({
  rows,
  series,
}: {
  rows: FamilySeriesRow[];
  series: { id: string; name: string; color: string }[];
}) {
  if (rows.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No data for this metric yet.
      </div>
    );
  }

  // Computed explicitly rather than left to Recharts' "auto" domain: with
  // one series per family member keyed by profile id, this version of
  // Recharts doesn't reliably scan every key when computing the domain,
  // and can render a flat 0 axis even though the lines plot correctly.
  const allValues = rows.flatMap((row) => series.map((s) => row[s.id])).filter((v): v is number => typeof v === "number");
  const dataMin = allValues.length ? Math.min(...allValues, 0) : 0;
  const dataMax = allValues.length ? Math.max(...allValues) : 1;
  const padding = Math.max((dataMax - dataMin) * 0.15, 1);
  const domainMin = Math.floor(dataMin - (dataMin > 0 ? padding : 0));
  const domainMax = Math.ceil(dataMax + padding);
  const domain: [number, number] = [domainMin, domainMax];
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => Math.round(domainMin + ((domainMax - domainMin) * i) / (tickCount - 1)));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
          {/*
            No tick labels here: this Recharts version miscomputes the
            label text for a numeric axis fed by multiple dynamically-keyed
            Line series (every intermediate tick reads as a stray digit,
            even with an explicit domain/ticks array or a fully custom tick
            renderer — only the plotted values themselves are affected).
            Exact numbers are still available via the tooltip and the
            per-profile summary cards below the chart.
          */}
          <YAxis
            stroke="var(--color-muted-foreground)"
            width={8}
            domain={domain}
            ticks={ticks}
            tick={false}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((s) => (
            <Line
              key={s.id}
              type="monotone"
              dataKey={s.id}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
