"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addReading } from "@/lib/actions/readings";
import { VITALS, vitalConfig } from "@/lib/vitals";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import type { ReadingType } from "@/lib/types";

export function AddReading({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [type, setType] = useState<ReadingType>(VITALS[0].type);
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const config = vitalConfig(type)!;

  function selectType(t: ReadingType) {
    setType(t);
    setPrimary("");
    setSecondary("");
    setError(null);
    setSaved(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const p = Number(primary);
    if (!primary || !Number.isFinite(p)) {
      setError(`Enter a ${config.hasSecondary ? config.primaryLabel!.toLowerCase() : "value"}.`);
      return;
    }
    const s = config.hasSecondary ? Number(secondary) : null;
    if (config.hasSecondary && (!secondary || !Number.isFinite(s!))) {
      setError("Enter both numbers.");
      return;
    }
    startTransition(async () => {
      const res = await addReading({
        patientId,
        type,
        valuePrimary: p,
        valueSecondary: s,
        unit: config.unit,
        notes,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setPrimary("");
      setSecondary("");
      setNotes("");
      setSaved(true);
      router.refresh();
    });
  }

  const inputClass =
    "h-touch-target w-full rounded-lg border border-outline bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface focus:border-2 focus:border-primary focus:outline-none focus:ring-0";

  return (
    <form onSubmit={onSubmit} className="rounded-xl bg-surface-container-lowest p-5 soft-elevation">
      <p className="font-button-text text-button-text text-primary">Log a reading</p>

      {/* Type selector */}
      <div className="mt-3 flex flex-wrap gap-2">
        {VITALS.map((v) => {
          const selected = v.type === type;
          return (
            <button
              type="button"
              key={v.type}
              onClick={() => selectType(v.type)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-2 font-label-md text-label-md transition-colors",
                selected
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
              )}
            >
              <Icon name={v.icon} filled={selected} className="text-[18px]" />
              {v.short}
            </button>
          );
        })}
      </div>

      {/* Value inputs */}
      <div className={cn("mt-4 grid gap-3", config.hasSecondary ? "grid-cols-2" : "grid-cols-1")}>
        <label className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-on-surface-variant">
            {config.primaryLabel} ({config.unit})
          </span>
          <input
            type="number"
            inputMode="decimal"
            step={config.step}
            min={config.min}
            max={config.max}
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            className={inputClass}
          />
        </label>
        {config.hasSecondary && (
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface-variant">
              {config.secondaryLabel} ({config.unit})
            </span>
            <input
              type="number"
              inputMode="decimal"
              step={config.step}
              min={config.min}
              max={config.max}
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className={inputClass}
            />
          </label>
        )}
      </div>

      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional) — e.g. before breakfast"
        className={cn(inputClass, "mt-3")}
      />

      {error && (
        <p className="mt-3 rounded-lg bg-error-container px-4 py-2 font-label-md text-label-md text-on-error-container">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="mt-3 flex items-center gap-2 font-label-md text-label-md text-secondary">
          <Icon name="check_circle" filled className="text-[18px]" /> Reading saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 flex h-touch-target w-full items-center justify-center gap-2 rounded-lg bg-primary font-button-text text-button-text text-on-primary transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending && <Icon name="progress_activity" className="animate-spin text-[20px]" />}
        Save reading
      </button>
    </form>
  );
}
