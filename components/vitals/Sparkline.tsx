import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  success: "text-secondary",
  warning: "text-[#df7c0f]",
  danger: "text-error",
  neutral: "text-outline",
};

/**
 * A tiny single-series trend line. Color carries the latest reading's status
 * (which is always ALSO shown as an icon+label chip, never color-alone), and
 * an aria-label describes the trend for non-visual users.
 */
export function Sparkline({
  values,
  tone = "neutral",
  ariaLabel,
  width = 132,
  height = 40,
}: {
  values: number[];
  tone?: "success" | "warning" | "danger" | "neutral";
  ariaLabel?: string;
  width?: number;
  height?: number;
}) {
  if (values.length === 0) return null;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = values.length;
  const x = (i: number) => (n === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (n - 1));
  const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2);

  const line = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${pad.toFixed(1)},${(height - pad).toFixed(1)} ${line} ${(width - pad).toFixed(1)},${(height - pad).toFixed(1)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("h-10 w-full", TONE_CLASS[tone])}
      role="img"
      aria-label={ariaLabel ?? "Trend"}
      preserveAspectRatio="none"
    >
      <polygon points={area} fill="currentColor" opacity={0.1} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
