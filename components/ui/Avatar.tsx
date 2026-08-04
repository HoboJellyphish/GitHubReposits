import { cn, initials } from "@/lib/utils";

const TONES = [
  "bg-primary-container text-on-primary-container",
  "bg-tertiary-fixed-dim text-on-tertiary-fixed",
  "bg-secondary-container text-on-secondary-container",
  "bg-primary-fixed text-primary",
];

/** Initials avatar with a stable colour derived from the name. */
export function Avatar({
  name,
  size = 56,
  className,
}: {
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const tone =
    TONES[
      Math.abs([...(name ?? "?")].reduce((a, c) => a + c.charCodeAt(0), 0)) % TONES.length
    ];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        tone,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}
