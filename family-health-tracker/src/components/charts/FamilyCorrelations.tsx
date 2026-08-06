import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { computeFamilyCorrelations, type FamilySeriesRow } from "@/lib/chartData";
import { Badge } from "@/components/ui/badge";

function strength(r: number): { label: string; variant: "success" | "default" | "secondary" } {
  const abs = Math.abs(r);
  if (abs >= 0.7) return { label: "Strong", variant: "success" };
  if (abs >= 0.4) return { label: "Moderate", variant: "default" };
  if (abs >= 0.2) return { label: "Weak", variant: "secondary" };
  return { label: "Negligible", variant: "secondary" };
}

export function FamilyCorrelations({
  rows,
  series,
  metricLabel,
}: {
  rows: FamilySeriesRow[];
  series: { id: string; name: string; color: string }[];
  metricLabel: string;
}) {
  if (series.length < 2) return null;

  const correlations = computeFamilyCorrelations(
    rows,
    series.map((s) => s.id),
  ).sort((a, b) => Math.abs(b.r ?? 0) - Math.abs(a.r ?? 0));

  const nameOf = (id: string) => series.find((s) => s.id === id)?.name ?? "Unknown";

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Correlations</h2>
        <p className="text-xs text-muted-foreground">
          How closely each pair's {metricLabel.toLowerCase()} moves together, day to day.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {correlations.map((c) => {
          const pairLabel = `${nameOf(c.profileAId)} & ${nameOf(c.profileBId)}`;
          if (c.r === null) {
            return (
              <div
                key={`${c.profileAId}-${c.profileBId}`}
                className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-sm"
              >
                <span className="font-medium">{pairLabel}</span>
                <span className="text-xs text-muted-foreground">Not enough overlapping data yet</span>
              </div>
            );
          }
          const { label, variant } = strength(c.r);
          const Icon = c.r >= 0.2 ? TrendingUp : c.r <= -0.2 ? TrendingDown : Minus;
          const direction = c.r >= 0.2 ? "move together" : c.r <= -0.2 ? "move oppositely" : "show no clear pattern together";
          return (
            <div
              key={`${c.profileAId}-${c.profileBId}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{pairLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {direction} · {c.pairedDays} days compared
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={variant}>{label}</Badge>
                <span className="w-12 text-right font-mono text-xs text-muted-foreground">{c.r.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
