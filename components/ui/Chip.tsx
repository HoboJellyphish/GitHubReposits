import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";

type ChipTone = "success" | "warning" | "danger" | "neutral" | "info";

const TONES: Record<ChipTone, string> = {
  success: "bg-secondary-container text-on-secondary-container",
  warning: "bg-tertiary-fixed text-on-tertiary-fixed",
  danger: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
  info: "bg-primary-fixed text-on-primary-fixed",
};

export function Chip({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: ChipTone;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-md text-label-md",
        TONES[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} filled className="text-[16px]" />}
      {children}
    </span>
  );
}
