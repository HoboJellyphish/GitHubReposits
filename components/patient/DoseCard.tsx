"use client";

import { Icon } from "@/components/Icon";
import { cn, formatTime } from "@/lib/utils";
import { formIcon } from "@/lib/constants";
import type { DoseItem } from "@/lib/dose";
import type { LogStatus } from "@/lib/types";

const ACCENT: Record<LogStatus, string> = {
  taken: "border-secondary",
  missed: "border-error",
  pending: "border-tertiary-fixed-dim",
  skipped: "border-outline-variant",
};

const ICON_BG: Record<LogStatus, string> = {
  taken: "bg-secondary-container text-on-secondary-container",
  missed: "bg-error-container text-on-error-container",
  pending: "bg-primary-fixed text-primary",
  skipped: "bg-surface-container-high text-on-surface-variant",
};

export function DoseCard({
  item,
  status,
  takenAt,
  pending,
  onConfirm,
  onUndo,
}: {
  item: DoseItem;
  status: LogStatus;
  takenAt?: string | null;
  pending?: boolean;
  onConfirm: () => void;
  onUndo: () => void;
}) {
  const subtitle =
    status === "taken" && takenAt
      ? `Taken at ${formatTime(new Date(takenAt).toTimeString().slice(0, 5))}`
      : `${item.dosageLabel} • ${formatTime(item.scheduledTime)}`;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border-l-4 bg-surface-container-lowest p-4 soft-elevation animate-fade-in",
        ACCENT[status],
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            ICON_BG[status],
          )}
        >
          <Icon name={formIcon(item.form)} filled={status === "taken"} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-button-text text-button-text text-on-surface">
              {item.name}
            </h3>
            {status === "missed" && (
              <span className="rounded-full bg-error-container px-2 py-0.5 font-label-md text-[12px] text-on-error-container">
                Missed
              </span>
            )}
          </div>
          <p
            className={cn(
              "truncate font-body-md text-body-md",
              status === "missed" ? "text-error" : "text-on-surface-variant",
            )}
          >
            {subtitle}
          </p>
        </div>
        {status === "taken" && (
          <Icon name="check_circle" filled className="text-[28px] text-secondary" />
        )}
      </div>

      {status === "taken" ? (
        <button
          onClick={onUndo}
          disabled={pending}
          className="flex h-10 items-center justify-center gap-1 self-start rounded-lg px-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary disabled:opacity-60"
        >
          <Icon name="undo" className="text-[18px]" /> Undo
        </button>
      ) : (
        <button
          onClick={onConfirm}
          disabled={pending}
          className={cn(
            "flex h-touch-target w-full items-center justify-center gap-2 rounded-lg font-button-text text-button-text text-on-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-60",
            status === "missed" ? "bg-error" : "bg-primary",
          )}
        >
          <Icon
            name={pending ? "progress_activity" : "check_circle"}
            className={cn("text-[20px]", pending && "animate-spin")}
          />
          {status === "missed" ? "Take now (late)" : "Take"}
        </button>
      )}
    </div>
  );
}
