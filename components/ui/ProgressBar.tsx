import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "primary";

const FILL: Record<Tone, string> = {
  success: "bg-secondary",
  warning: "bg-on-tertiary-container",
  danger: "bg-error",
  primary: "bg-primary",
};

export function ProgressBar({
  value,
  tone = "success",
  height = "h-3",
  className,
}: {
  /** 0–100 */
  value: number;
  tone?: Tone;
  height?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-surface-container", height, className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", FILL[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
