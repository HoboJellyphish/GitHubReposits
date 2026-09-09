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
