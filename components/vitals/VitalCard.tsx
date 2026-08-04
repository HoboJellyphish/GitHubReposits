import { Icon } from "@/components/Icon";
import { Chip } from "@/components/ui/Chip";
import { Sparkline } from "@/components/vitals/Sparkline";
import { STATUS_META, type VitalSummary } from "@/lib/vitals";
import { formatLongDate } from "@/lib/utils";

const DIRECTION: Record<"up" | "down" | "flat", { icon: string; label: string }> = {
  up: { icon: "trending_up", label: "Trending up" },
  down: { icon: "trending_down", label: "Trending down" },
  flat: { icon: "trending_flat", label: "Steady" },
};

export function VitalCard({ summary }: { summary: VitalSummary }) {
  const { config, latest, status, average, direction, count, values } = summary;
  const meta = status ? STATUS_META[status] : null;
  const tone = meta?.tone ?? "neutral";
  const dir = direction ? DIRECTION[direction] : null;

  const latestText = latest
    ? config.format(Number(latest.value_primary), latest.value_secondary != null ? Number(latest.value_secondary) : null)
    : "—";
  const avgText =
    average == null ? null : config.hasSecondary ? `${Math.round(average)}` : config.format(average);

  return (
    <div className="flex flex-col rounded-xl bg-surface-container-lowest p-5 soft-elevation">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name={config.icon} filled className="text-[22px] text-primary" />
          <span className="truncate font-label-md text-label-md text-on-surface-variant">
            {config.label}
          </span>
        </div>
        {meta && (
          <Chip tone={meta.tone} icon={meta.icon} className="shrink-0">
            {meta.label}
          </Chip>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-headline-lg text-[32px] font-bold leading-none tracking-tight text-on-surface">
          {latestText}
        </span>
        <span className="font-label-md text-label-md text-on-surface-variant">{config.unit}</span>
      </div>

      <div className="mt-4">
        <Sparkline
          values={values}
          tone={tone}
          ariaLabel={`${config.label}: ${count} readings, latest ${latestText} ${config.unit}${dir ? `, ${dir.label.toLowerCase()}` : ""}`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between font-label-md text-label-md text-on-surface-variant">
        <span className="flex items-center gap-1">
          {dir && <Icon name={dir.icon} className="text-[16px]" />}
          {avgText != null ? `${avgText} avg` : `${count} reading${count === 1 ? "" : "s"}`}
        </span>
        {latest && <span>{formatLongDate(new Date(latest.taken_at))}</span>}
      </div>
    </div>
  );
}
