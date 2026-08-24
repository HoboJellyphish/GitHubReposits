import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Leading Material Symbol name. */
  icon?: string;
  iconFilled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]",
  secondary:
    "border border-outline text-primary bg-transparent hover:bg-surface-container-low active:scale-[0.98]",
  success: "bg-secondary text-on-secondary hover:opacity-90 active:scale-[0.98]",
  danger: "bg-error text-on-error hover:opacity-90 active:scale-[0.98]",
  ghost: "text-primary hover:bg-surface-container-low active:scale-[0.98]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", icon, iconFilled, loading, fullWidth = true, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "h-touch-target rounded-lg font-button-text text-button-text",
        "flex items-center justify-center gap-2 px-5 transition-all duration-200",
        "disabled:opacity-60 disabled:pointer-events-none",
        fullWidth && "w-full",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Icon name="progress_activity" className="animate-spin text-[22px]" />
      ) : icon ? (
        <Icon name={icon} filled={iconFilled} className="text-[20px]" />
      ) : null}
      {children}
    </button>
  );
});
