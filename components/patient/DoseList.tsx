"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { confirmDose, undoDose } from "@/lib/actions/doses";
import { DoseCard } from "@/components/patient/DoseCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/Icon";
import { TIME_SLOTS } from "@/lib/constants";
import { doseStatus, toDateKey } from "@/lib/utils";
import { groupBySlot, type DoseItem, type LogMap } from "@/lib/dose";

export function DoseList({
  patientId,
  today,
  items,
  initialLogs,
}: {
  patientId: string;
  today: string;
  items: DoseItem[];
  initialLogs: LogMap;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [logs, setLogs] = useState<LogMap>(initialLogs);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from("mt_logs")
      .select("id,schedule_id,status,taken_at")
      .eq("patient_id", patientId)
      .eq("log_date", today);
    if (data) {
      setLogs(Object.fromEntries(data.map((l) => [l.schedule_id, l])) as LogMap);
    }
  }, [supabase, patientId, today]);

  // Live updates: a caretaker confirming on another device reflects instantly.
  useEffect(() => {
    const channel = supabase
      .channel(`logs-${patientId}-${today}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mt_logs", filter: `patient_id=eq.${patientId}` },
        () => {
          void refetch();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, patientId, today, refetch]);

  // Re-evaluate pending → missed as time passes.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const setPending = (id: string, on: boolean) =>
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  async function handleConfirm(item: DoseItem) {
    setError(null);
    setPending(item.scheduleId, true);
    setLogs((prev) => ({
      ...prev,
      [item.scheduleId]: {
        id: prev[item.scheduleId]?.id ?? "optimistic",
        status: "taken",
        taken_at: new Date().toISOString(),
      },
    }));
    const res = await confirmDose({
      scheduleId: item.scheduleId,
      patientId,
      quantity: item.quantity,
      logDate: today,
    });
    if (res.error) {
      setError(res.error);
      await refetch();
    }
    setPending(item.scheduleId, false);
  }

  async function handleUndo(item: DoseItem) {
    setError(null);
    setPending(item.scheduleId, true);
    setLogs((prev) => {
      const next = { ...prev };
      delete next[item.scheduleId];
      return next;
    });
    const res = await undoDose({ scheduleId: item.scheduleId, logDate: today });
    if (res.error) {
      setError(res.error);
      await refetch();
    }
    setPending(item.scheduleId, false);
  }

  const isToday = today === toDateKey(now);
  const takenCount = items.filter(
    (i) => doseStatus(i.scheduledTime, logs[i.scheduleId], now, isToday) === "taken",
  ).length;
  const groups = groupBySlot(items);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="medication"
        title="No medications today"
        description="There are no doses scheduled for this day."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h3 className="font-label-md text-label-md uppercase text-primary">Daily adherence</h3>
          <span className="font-label-md text-label-md text-secondary">
            {takenCount} of {items.length} doses taken
          </span>
        </div>
        <ProgressBar value={(takenCount / items.length) * 100} height="h-2" />
      </section>

      {error && (
        <p className="rounded-lg bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
          {error}
        </p>
      )}

      {TIME_SLOTS.map((slot) => {
        const slotItems = groups[slot.key];
        if (!slotItems || slotItems.length === 0) return null;
        return (
          <section key={slot.key} className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name={slot.icon} className="text-on-surface-variant" />
              <h4 className="font-headline-md text-headline-md text-on-surface">{slot.label}</h4>
            </div>
            <div className="space-y-4">
              {slotItems.map((item) => (
                <DoseCard
                  key={item.scheduleId}
                  item={item}
                  status={doseStatus(item.scheduledTime, logs[item.scheduleId], now, isToday)}
                  takenAt={logs[item.scheduleId]?.taken_at}
                  pending={pendingIds.has(item.scheduleId)}
                  onConfirm={() => handleConfirm(item)}
                  onUndo={() => handleUndo(item)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
