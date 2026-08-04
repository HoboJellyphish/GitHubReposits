import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tighten padding for list-style cards. */
  padding?: "sm" | "md" | "lg";
}

const PADDING = { sm: "p-4", md: "p-5", lg: "p-6" } as const;

export function Card({ padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-container-lowest soft-elevation",
        PADDING[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
