// The YAxis `width` is a fixed pixel box, not an auto-sizing one — a value
// wide enough for "150 bpm" clips a longer label like "10000 steps" instead
// of wrapping it. Size the axis from the longest tick actually being shown.
export function estimateYAxisWidth(ticks: number[], unit?: string): number {
  const longest = ticks.reduce((max, v) => {
    const label = unit ? `${v} ${unit}` : `${v}`;
    return Math.max(max, label.length);
  }, 0);
  return Math.max(36, Math.round(longest * 6.2 + 14));
}

// Recharts' own tick <Text> renderer has proven unreliable in this app
// (mangles intermediate tick labels on certain axes — see TrendChart and
// FamilyCompareChart for the specifics). Rendering the tick label
// ourselves sidesteps whatever is happening inside it.
export function YAxisTick({
  x,
  y,
  payload,
  unit,
}: {
  x?: number | string;
  y?: number | string;
  payload?: { value: number };
  unit?: string;
}) {
  if (x === undefined || y === undefined || !payload) return null;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={11} fill="var(--color-muted-foreground)">
      {unit ? `${payload.value} ${unit}` : payload.value}
    </text>
  );
}
