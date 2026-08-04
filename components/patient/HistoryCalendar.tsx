"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { cn, doseStatus, formatTime, toDateKey } from "@/lib/utils";
import { formIcon } from "@/lib/constants";
import { buildDoseItems } from "@/lib/dose";
import type { MedicationWithRelations } from "@/lib/types";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

type DayTone = "green" | "red" | "amber" | "future" | "none";

const DOT: Record<DayTone, string> = {
  green: "bg-secondary",
  red: "bg-error",
  amber: "bg-tertiary-fixed-dim",
  future: "bg-outline-variant/50",
  none: "bg-transparent",
};

interface LogEntry {
  status: string;
  taken_at: string | null;
}

export function HistoryCalendar({
  patientId,
  today,
  meds,
}: {
  patientId: string;
  today: string;
  meds: MedicationWithRelations[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [selected, setSelected] = useState(today);
  const [logs, setLogs] = useState<Record<string, Record<string, LogEntry>>>({});

  const monthStart = useMemo(() => new Date(year, month, 1), [year, month]);
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const leadingBlanks = (monthStart.getDay() + 6) % 7; // Monday-first

  const fetchMonth = useCallback(async () => {
    const start = toDateKey(new Date(year, month, 1));
    const end = toDateKey(new Date(year, month, daysInMonth));
    const { data } = await supabase
      .from("mt_logs")
      .select("schedule_id,log_date,status,taken_at")
      .eq("patient_id", patientId)
      .gte("log_date", start)
      .lte("log_date", end);

    const grouped: Record<string, Record<string, LogEntry>> = {};
    for (const row of data ?? []) {
      (grouped[row.log_date] ??= {})[row.schedule_id] = {
        status: row.status,
        taken_at: row.taken_at,
      };
    }
    setLogs(grouped);
  }, [supabase, patientId, year, month, daysInMonth]);

  useEffect(() => {
    void fetchMonth();
  }, [fetchMonth]);

  function dayTone(dateKey: string, date: Date): DayTone {
    const due = buildDoseItems(meds, date);
    if (due.length === 0) return "none";
    const dayLogs = logs[dateKey] ?? {};
    const taken = due.filter((d) => dayLogs[d.scheduleId]?.status === "taken").length;
    if (taken === due.length) return "green";
    if (dateKey > today) return "future";
    if (taken === 0) return dateKey === today ? "amber" : "red";
    return "amber";
  }

  function changeMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  // Selected day breakdown
  const selectedDate = new Date(
    Number(selected.slice(0, 4)),
    Number(selected.slice(5, 7)) - 1,
    Number(selected.slice(8, 10)),
  );
  const selectedDoses = buildDoseItems(meds, selectedDate);
  const selectedLogs = logs[selected] ?? {};
  const selectedTaken = selectedDoses.filter(
    (d) => selectedLogs[d.scheduleId]?.status === "taken",
  ).length;

  const monthLabel = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <Card padding="lg">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-12 w-12 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-high active:scale-90"
          >
            <Icon name="chevron_left" />
          </button>
          <h2 className="font-headline-md text-headline-md text-primary">{monthLabel}</h2>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex h-12 w-12 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-high active:scale-90"
          >
            <Icon name="chevron_right" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center">
          {WEEKDAY_LABELS.map((d, i) => (
            <span key={i} className="font-label-md text-label-md uppercase text-outline">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-3">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const dateKey = toDateKey(date);
            const tone = dayTone(dateKey, date);
            const isSelected = dateKey === selected;
            const isToday = dateKey === today;
            return (
              <button
                key={day}
                onClick={() => setSelected(dateKey)}
                className="relative flex flex-col items-center gap-1"
              >
                {isSelected && (
                  <span className="absolute -inset-1 -z-10 rounded-xl bg-primary-fixed" />
                )}
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center font-body-md text-body-md text-primary",
                    (isSelected || isToday) && "font-bold",
                  )}
                >
                  {day}
                </span>
                <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])} />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-outline-variant/40 pt-4">
          {[
            { tone: "green", label: "All taken" },
            { tone: "amber", label: "Partial" },
            { tone: "red", label: "Missed" },
            { tone: "future", label: "Upcoming" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", DOT[l.tone as DayTone])} />
              <span className="font-label-md text-label-md text-on-surface-variant">{l.label}</span>
            </span>
          ))}
        </div>
      </Card>

      {/* Selected day details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-headline-md text-headline-md text-primary">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h3>
          {selectedDoses.length > 0 && (
            <span className="font-label-md text-label-md text-secondary">
              {selectedTaken}/{selectedDoses.length} taken
            </span>
          )}
        </div>

        {selectedDoses.length === 0 ? (
          <p className="px-2 font-body-md text-body-md text-on-surface-variant">
            No medications scheduled for this day.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {selectedDoses.map((dose) => {
              const log = selectedLogs[dose.scheduleId];
              // For today, respect the clock (a dose not yet due is "Scheduled",
              // not "Missed"); future days are always upcoming.
              const st =
                selected > today
                  ? "pending"
                  : doseStatus(dose.scheduledTime, log, now, selected === today);
              const taken = st === "taken";
              const skipped = st === "skipped";
              const missed = st === "missed";
              return (
                <div
                  key={dose.scheduleId}
                  className="flex min-h-[72px] items-center justify-between rounded-xl bg-surface-container-lowest p-4 soft-elevation"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                      <Icon name={formIcon(dose.form)} />
                    </div>
                    <div>
                      <p className="font-button-text text-button-text text-primary">{dose.name}</p>
                      <p className="font-label-md text-label-md text-outline">{dose.dosageLabel}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {taken ? (
                      <span className="rounded-full bg-secondary-fixed px-3 py-1 font-label-md text-label-md text-on-secondary-fixed">
                        Taken
                      </span>
                    ) : skipped ? (
                      <span className="rounded-full bg-surface-container-highest px-3 py-1 font-label-md text-label-md text-on-surface-variant">
                        Skipped
                      </span>
                    ) : missed ? (
                      <span className="rounded-full bg-error-container px-3 py-1 font-label-md text-label-md text-on-error-container">
                        Missed
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface-container-high px-3 py-1 font-label-md text-label-md text-on-surface-variant">
                        Scheduled
                      </span>
                    )}
                    <span className="font-label-md text-label-md text-outline">
                      {taken && log?.taken_at
                        ? formatTime(new Date(log.taken_at).toTimeString().slice(0, 5))
                        : formatTime(dose.scheduledTime)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
