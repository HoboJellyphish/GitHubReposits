import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export function ProfileAvatar({
  profile,
  size = "md",
  ring,
  className,
}: {
  profile: Pick<Profile, "avatarEmoji" | "avatarColor" | "name">;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
  className?: string;
}) {
  const sizeClasses = { sm: "h-8 w-8 text-base", md: "h-11 w-11 text-xl", lg: "h-16 w-16 text-3xl" }[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        sizeClasses,
        ring && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className,
      )}
      style={{ backgroundColor: profile.avatarColor + "26" }}
      aria-hidden
    >
      <span>{profile.avatarEmoji}</span>
    </div>
  );
}
