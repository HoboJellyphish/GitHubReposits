"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateInventory } from "@/lib/actions/inventory";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, stockStatus, type StockStatus } from "@/lib/utils";

export interface InventoryRow {
  medicationId: string;
  name: string;
  patientName: string;
  quantityRemaining: number;
  lowStockThresholdDays: number;
  unit: string;
  perDay: number;
}

const LEVEL_STYLES: Record<
  StockStatus["level"],
  { bar: string; text: string; iconBg: string }
> = {
  critical: { bar: "bg-error", text: "text-error", iconBg: "bg-error-container text-on-error-container" },
  warning: {
    bar: "bg-[#df7c0f]",
    text: "text-on-tertiary-container",
    iconBg: "bg-tertiary-fixed text-on-tertiary-fixed",
  },
  ok: { bar: "bg-secondary", text: "text-secondary", iconBg: "bg-secondary-container text-on-secondary-container" },
  unknown: {
    bar: "bg-outline-variant",
    text: "text-on-surface-variant",
    iconBg: "bg-primary-fixed text-primary",
  },
};

export function InventoryClient({ initialRows }: { initialRows: InventoryRow[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<InventoryRow[]>(initialRows);
  const [openId, setOpenId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const { data } = await supabase.from("mt_inventory").select("medication_id,quantity_remaining,low_stock_threshold_days");
    if (!data) return;
    const byMed = Object.fromEntries(data.map((d) => [d.medication_id, d]));
    setRows((prev) =>
      prev.map((r) => {
        if (r.medicationId === openId) return r; // don't clobber an open editor
        const fresh = byMed[r.medicationId];
        return fresh
          ? {
              ...r,
              quantityRemaining: fresh.quantity_remaining,
              lowStockThresholdDays: fresh.low_stock_threshold_days,
            }
          : r;
      }),
    );
  }, [supabase, openId]);

  useEffect(() => {
    const channel = supabase
      .channel("inventory")
      .on("postgres_changes", { event: "*", schema: "public", table: "mt_inventory" }, () => {
        void refetch();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, refetch]);

  const statuses = rows.map((r) => stockStatus(
    { quantity_remaining: r.quantityRemaining, low_stock_threshold_days: r.lowStockThresholdDays },
    r.perDay,
  ));
  const belowThreshold = statuses.filter((s) => s.level === "warning" || s.level === "critical").length;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="inventory_2"
        title="Nothing to track yet"
        description="Add medications with a stock count to see supply levels here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {belowThreshold > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-error-container px-4 py-4 text-on-error-container soft-elevation">
          <Icon name="warning" filled />
          <p className="font-label-md text-label-md">
            {belowThreshold} item{belowThreshold > 1 ? "s" : ""} below threshold
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rows.map((row, i) => {
          const status = statuses[i];
          const style = LEVEL_STYLES[status.level];
          const open = openId === row.medicationId;
          const widthPct =
            status.daysRemaining == null
              ? 100
              : Math.max(
                  6,
                  Math.min(100, (status.daysRemaining / Math.max(1, row.lowStockThresholdDays * 2)) * 100),
                );
          return (
            <div
              key={row.medicationId}
              className="overflow-hidden rounded-xl bg-surface-container-lowest soft-elevation"
            >
              <button
                onClick={() => setOpenId(open ? null : row.medicationId)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-lg", style.iconBg)}>
                    <Icon name="medication" filled />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-button-text text-button-text text-primary">
                      {row.name}{" "}
                      <span className="font-body-md text-on-surface-variant">({row.patientName})</span>
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                        <div className={cn("h-full rounded-full", style.bar)} style={{ width: `${widthPct}%` }} />
                      </div>
                      <span className={cn("font-label-md text-label-md", style.text)}>
                        {status.daysRemaining == null
                          ? `${row.quantityRemaining} left`
                          : `${status.daysRemaining} days left`}
                      </span>
                    </div>
                  </div>
                </div>
                <Icon
                  name="expand_more"
                  className={cn("text-on-surface-variant transition-transform", open && "rotate-180")}
                />
              </button>

              {open && (
                <InventoryEditor
                  row={row}
                  onSaved={(next) => {
                    setRows((prev) =>
                      prev.map((r) => (r.medicationId === row.medicationId ? { ...r, ...next } : r)),
                    );
                    setOpenId(null);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InventoryEditor({
  row,
  onSaved,
}: {
  row: InventoryRow;
  onSaved: (next: { quantityRemaining: number; lowStockThresholdDays: number }) => void;
}) {
  const [qty, setQty] = useState(row.quantityRemaining.toString());
  const [threshold, setThreshold] = useState(row.lowStockThresholdDays.toString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const quantityRemaining = Number(qty) || 0;
    const lowStockThresholdDays = Number(threshold) || 7;
    const res = await updateInventory({
      medicationId: row.medicationId,
      quantityRemaining,
      lowStockThresholdDays,
      unit: row.unit,
    });
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    onSaved({ quantityRemaining, lowStockThresholdDays });
  }

  return (
    <div className="bg-surface-container-low px-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-on-surface-variant">Current quantity</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="h-touch-target rounded-lg border border-outline bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-2 focus:border-primary focus:ring-0"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Low stock alert (days)
          </span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="h-touch-target rounded-lg border border-outline bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-2 focus:border-primary focus:ring-0"
          />
        </label>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-error-container px-4 py-2 font-label-md text-label-md text-on-error-container">
          {error}
        </p>
      )}
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 flex h-touch-target w-full items-center justify-center gap-2 rounded-lg bg-primary font-button-text text-button-text text-on-primary transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {saving && <Icon name="progress_activity" className="animate-spin text-[20px]" />}
        Update inventory
      </button>
    </div>
  );
}
