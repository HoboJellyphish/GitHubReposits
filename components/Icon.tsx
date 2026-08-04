import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  /** Render the filled variant of the Material Symbol. */
  filled?: boolean;
  className?: string;
  /** Pixel size override (defaults to the surrounding font size). */
  size?: number;
}

/** Material Symbols (Outlined) icon. */
export function Icon({ name, filled, className, size }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", filled && "filled", className)}
      style={size ? { fontSize: size } : undefined}
    >
      {name}
    </span>
  );
}
