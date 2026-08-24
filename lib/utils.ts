import type { Inventory, LogStatus, Schedule } from "@/lib/types";

/** Tiny classnames helper (no dependency needed). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ---- Dates --------------------------------------------------------------- */

/** Local YYYY-MM-DD (avoids the UTC shift that `toISOString()` introduces). */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "08:00:00" or "08:00" → "8:00 AM". */
export function formatTime(time: string): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  let h = Number(hStr);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

/** "08:00:00" → "08:00" (for <input type="time">). */
export function toTimeInputValue(time: string | null | undefined): string {
  if (!time) return "";
  const [h = "00", m = "00"] = time.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---- Schedules ----------------------------------------------------------- */

/** Days since the Unix epoch in local time — used for "alternate day" parity. */
function epochDay(date: Date): number {
  return Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000,
  );
}

/** Whether a schedule should appear on the given date, per its frequency. */
export function isScheduleDueOn(schedule: Pick<Schedule, "frequency" | "specific_days">, date: Date): boolean {
  switch (schedule.frequency) {
    case "weekly":
      return (schedule.specific_days ?? []).includes(date.getDay());
    case "alternate_days":
      return epochDay(date) % 2 === 0;
    case "daily":
    default:
      return true;
  }
}

/* ---- Dose status --------------------------------------------------------- */

/**
 * Derive a dose's display status from its log (if any) and the clock.
 * A schedule with no log is "pending" until its time passes, then "missed".
 */
export function doseStatus(
  scheduledTime: string,
  log: { status: LogStatus | string } | null | undefined,
  now: Date = new Date(),
  isToday = true,
): LogStatus {
  if (log?.status === "taken") return "taken";
  if (log?.status === "skipped") return "skipped";
  if (!isToday) return (log?.status as LogStatus) ?? "missed";

  const [h, m] = scheduledTime.split(":").map(Number);
  const due = new Date(now);
  due.setHours(h || 0, m || 0, 0, 0);
  return now > due ? "missed" : "pending";
}

/* ---- Inventory ----------------------------------------------------------- */

/** Average doses consumed per day across a medication's active schedules. */
export function dailyConsumption(schedules: Pick<Schedule, "quantity" | "frequency" | "specific_days" | "is_active">[]): number {
  return schedules
    .filter((s) => s.is_active !== false)
    .reduce((sum, s) => {
      const qty = Number(s.quantity) || 0;
      switch (s.frequency) {
        case "weekly":
          return sum + qty * ((s.specific_days?.length ?? 0) / 7);
        case "alternate_days":
          return sum + qty * 0.5;
        case "daily":
        default:
          return sum + qty;
      }
    }, 0);
}

export interface StockStatus {
  daysRemaining: number | null;
  level: "ok" | "warning" | "critical" | "unknown";
}

/**
 * Days of supply remaining and a colour band.
 *  - green  (ok):       days > threshold
 *  - amber  (warning):  threshold/2 ≤ days ≤ threshold
 *  - red    (critical): days < threshold/2
 */
export function stockStatus(
  inventory: Pick<Inventory, "quantity_remaining" | "low_stock_threshold_days">,
  perDay: number,
): StockStatus {
  if (!perDay || perDay <= 0) {
    return { daysRemaining: null, level: "unknown" };
  }
  const days = inventory.quantity_remaining / perDay;
  const threshold = inventory.low_stock_threshold_days || 7;
  let level: StockStatus["level"] = "ok";
  if (days < threshold / 2) level = "critical";
  else if (days <= threshold) level = "warning";
  return { daysRemaining: Math.floor(days), level };
}

/** A short, human-friendly random invite code. */
export function generateInviteCode(length = 6): string {
  // No 0/O/1/I to avoid confusion when typing.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
