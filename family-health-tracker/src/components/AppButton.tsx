import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/state/AppDataContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ButtonDisplayMode } from "@/types";

export interface AppButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  layout?: "inline" | "tile" | "nav";
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  accentColor?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  badge?: React.ReactNode;
}

function useButtonDisplayMode(): ButtonDisplayMode {
  const { activeProfileId, getPreferences } = useAppData();
  if (!activeProfileId) return "both";
  return getPreferences(activeProfileId).buttonStyle;
}

const layoutClasses: Record<NonNullable<AppButtonProps["layout"]>, string> = {
  inline:
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium min-h-11 transition-colors",
  tile: "flex flex-col items-center justify-center gap-2 rounded-xl p-4 min-h-24 text-center transition-colors border border-border bg-card hover:shadow-md",
  nav: "flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 min-h-14 min-w-14 text-[11px] font-medium transition-colors",
};

const variantClasses: Record<NonNullable<AppButtonProps["variant"]>, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-80",
  outline: "border border-input bg-transparent hover:bg-secondary",
  ghost: "hover:bg-secondary",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
};

export function AppButton({
  icon: Icon,
  label,
  onClick,
  active,
  layout = "inline",
  variant = "secondary",
  size = "default",
  accentColor,
  className,
  disabled,
  type = "button",
  badge,
}: AppButtonProps) {
  const mode = useButtonDisplayMode();
  const [holdOpen, setHoldOpen] = React.useState(false);
  const holdTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showIcon = mode === "icon" || mode === "both";
  const showText = mode === "text" || mode === "both";
  const iconOnly = mode === "icon";

  const iconSize = layout === "tile" ? "h-6 w-6" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  const startHold = () => {
    if (!iconOnly) return;
    holdTimer.current = setTimeout(() => setHoldOpen(true), 380);
  };
  const endHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdOpen) setTimeout(() => setHoldOpen(false), 900);
  };

  const content = (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={() => holdTimer.current && clearTimeout(holdTimer.current)}
      title={iconOnly ? label : undefined}
      aria-label={label}
      className={cn(
        layoutClasses[layout],
        layout !== "nav" || active === undefined ? variantClasses[variant] : undefined,
        layout === "nav" && (active ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary hover:text-foreground"),
        layout === "tile" && active && "ring-2 ring-primary",
        disabled && "pointer-events-none opacity-50",
        size === "sm" && layout === "inline" && "px-3 py-2 text-xs min-h-9",
        size === "lg" && layout === "inline" && "px-6 py-3 text-base min-h-13",
        "relative",
        className,
      )}
      style={
        layout === "tile" && accentColor
          ? { boxShadow: active ? undefined : undefined, borderColor: accentColor + "40" }
          : undefined
      }
    >
      {badge && <span className="absolute -right-1 -top-1">{badge}</span>}
      {showIcon && (
        <Icon
          className={cn(iconSize, "shrink-0")}
          style={accentColor ? { color: accentColor } : undefined}
          strokeWidth={2}
        />
      )}
      {showText && (
        <span className={cn(layout === "nav" ? "leading-none" : "leading-tight", layout === "tile" && "text-xs font-medium")}>
          {label}
        </span>
      )}
    </button>
  );

  if (!iconOnly) return content;

  return (
    <Tooltip open={holdOpen ? true : undefined}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
