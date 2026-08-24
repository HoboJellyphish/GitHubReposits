"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMedication, deleteMedication } from "@/lib/actions/medications";
import { FloatingInput, SelectField, TextareaField } from "@/components/ui/fields";
import { Toggle } from "@/components/ui/Toggle";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import {
  DOSAGE_UNITS,
  FREQUENCIES,
  MEDICATION_FORMS,
  TIME_SLOTS,
  WEEKDAYS,
} from "@/lib/constants";
import type { Frequency, Member, TimeLabel } from "@/lib/types";

export interface MedicationFormInitial {
  id: string;
  patientId: string;
  name: string;
  form: string;
  dosageAmount: number | null;
  dosageUnit: string;
  notes: string;
  frequency: Frequency;
  specificDays: number[];
  quantity: number;
  slots: Record<TimeLabel, { enabled: boolean; time: string }>;
  inventoryQuantity: number | null;
  lowStockThresholdDays: number;
}

function defaultSlots(): Record<TimeLabel, { enabled: boolean; time: string }> {
  return {
    morning: { enabled: true, time: "08:00" },
    afternoon: { enabled: false, time: "13:00" },
    evening: { enabled: false, time: "18:30" },
    night: { enabled: false, time: "22:00" },
  };
}

export function MedicationForm({
  patients,
  defaultPatientId,
  initial,
}: {
  patients: Member[];
  defaultPatientId?: string;
  initial?: MedicationFormInitial;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [patientId, setPatientId] = useState(
    initial?.patientId ?? defaultPatientId ?? patients[0]?.id ?? "",
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [form, setForm] = useState(initial?.form ?? "tablet");
  const [amount, setAmount] = useState(initial?.dosageAmount?.toString() ?? "");
  const [unit, setUnit] = useState(initial?.dosageUnit ?? "mg");
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "daily");
  const [specificDays, setSpecificDays] = useState<number[]>(initial?.specificDays ?? [1, 3, 5]);
  const [quantity, setQuantity] = useState((initial?.quantity ?? 1).toString());
  const [slots, setSlots] = useState(initial?.slots ?? defaultSlots());
  const [inventoryQty, setInventoryQty] = useState(
    initial?.inventoryQuantity != null ? initial.inventoryQuantity.toString() : "",
  );
  const [lowStockDays, setLowStockDays] = useState(
    (initial?.lowStockThresholdDays ?? 7).toString(),
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const isEdit = Boolean(initial?.id);
  const hasEnabledSlot = useMemo(
    () => TIME_SLOTS.some((s) => slots[s.key].enabled),
    [slots],
  );

  function toggleSlot(key: TimeLabel, enabled: boolean) {
    setSlots((prev) => ({ ...prev, [key]: { ...prev[key], enabled } }));
  }
  function setSlotTime(key: TimeLabel, time: string) {
    setSlots((prev) => ({ ...prev, [key]: { ...prev[key], time } }));
  }
  function toggleDay(day: number) {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!hasEnabledSlot) {
      setError("Turn on at least one time of day.");
      return;
    }
    if (frequency === "weekly" && specificDays.length === 0) {
      setError("Pick at least one day of the week.");
      return;
    }
    startTransition(async () => {
      const res = await saveMedication({
        id: initial?.id,
        patientId,
        name,
        form,
        dosageAmount: amount ? Number(amount) : null,
        dosageUnit: unit,
        notes,
        frequency,
        specificDays,
        schedules: TIME_SLOTS.map((s) => ({
          timeLabel: s.key,
          time: slots[s.key].time,
          quantity: Number(quantity) || 1,
          enabled: slots[s.key].enabled,
        })),
        inventoryQuantity: inventoryQty ? Number(inventoryQty) : null,
        lowStockThresholdDays: Number(lowStockDays) || 7,
      });
      if (res?.error) setError(res.error);
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    startTransition(async () => {
      const res = await deleteMedication({ id: initial.id, patientId });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28">
      {patients.length > 1 && (
        <SelectField
          id="patient"
          label="Patient"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name}
            </option>
          ))}
        </SelectField>
      )}

      <FloatingInput
        id="med-name"
        label="Medication name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        trailing={<Icon name="medication" className="text-on-surface-variant" />}
      />

      {/* Form type chips */}
      <div>
        <span className="mb-3 block font-label-md text-label-md text-on-surface-variant">
          Form type
        </span>
        <div className="flex flex-wrap gap-3 pb-1">
          {MEDICATION_FORMS.map((f) => {
            const selected = form === f.key;
            return (
              <button
                type="button"
                key={f.key}
                onClick={() => setForm(f.key)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-colors",
                  selected
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
                )}
              >
                <Icon name={f.icon} className="text-[20px]" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount + unit */}
      <div className="grid grid-cols-2 gap-4">
        <FloatingInput
          id="amount"
          label="Amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <SelectField id="unit" label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {DOSAGE_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </SelectField>
      </div>

      {/* Quantity per dose */}
      <FloatingInput
        id="quantity"
        label="Quantity per dose"
        type="number"
        inputMode="numeric"
        min="1"
        step="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      {/* Frequency */}
      <div>
        <span className="mb-3 block font-label-md text-label-md text-on-surface-variant">
          Frequency
        </span>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((f) => {
            const selected = frequency === f.key;
            return (
              <button
                type="button"
                key={f.key}
                onClick={() => setFrequency(f.key)}
                className={cn(
                  "rounded-lg px-4 py-2 font-label-md text-label-md transition-colors",
                  selected
                    ? "bg-secondary-container text-on-secondary-container"
                    : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        {frequency === "weekly" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => {
              const selected = specificDays.includes(d.value);
              return (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => toggleDay(d.value)}
                  aria-pressed={selected}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full font-label-md text-label-md transition-colors",
                    selected
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant text-on-surface-variant",
                  )}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule slots */}
      <div className="space-y-2">
        <span className="mb-2 block font-label-md text-label-md text-on-surface-variant">
          Schedule
        </span>
        {TIME_SLOTS.map((slot) => (
          <div
            key={slot.key}
            className="flex h-[64px] items-center justify-between rounded-xl bg-surface-container-lowest px-4 shadow-soft-sm"
          >
            <div className="flex items-center gap-3">
              <Icon name={slot.icon} className="text-secondary" />
              <span className="font-body-md text-body-md text-on-surface">{slot.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="time"
                value={slots[slot.key].time}
                onChange={(e) => setSlotTime(slot.key, e.target.value)}
                disabled={!slots[slot.key].enabled}
                className="rounded-lg border-none bg-surface-container-low px-2 py-1 font-label-md text-label-md text-primary focus:ring-0 disabled:opacity-50"
              />
              <Toggle
                checked={slots[slot.key].enabled}
                onChange={(v) => toggleSlot(slot.key, v)}
                label={`${slot.label} dose`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Inventory */}
      <div>
        <span className="mb-3 block font-label-md text-label-md text-on-surface-variant">
          Inventory
        </span>
        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            id="inventory-qty"
            label="Current quantity"
            type="number"
            inputMode="numeric"
            min="0"
            value={inventoryQty}
            onChange={(e) => setInventoryQty(e.target.value)}
          />
          <FloatingInput
            id="low-stock-days"
            label="Low stock (days)"
            type="number"
            inputMode="numeric"
            min="1"
            value={lowStockDays}
            onChange={(e) => setLowStockDays(e.target.value)}
          />
        </div>
      </div>

      <TextareaField
        id="notes"
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. take with food"
      />

      {isEdit && (
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg font-button-text text-button-text text-error transition-colors hover:bg-error-container/40 disabled:opacity-60"
        >
          <Icon name="delete" className="text-[20px]" /> Remove medication
        </button>
      )}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-background via-background to-transparent p-margin-mobile">
        <div className="mx-auto max-w-max-width-content space-y-3">
          {error && (
            <p className="rounded-lg bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex h-touch-target w-full items-center justify-center gap-2 rounded-lg bg-primary font-button-text text-button-text text-on-primary shadow-soft transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {pending && <Icon name="progress_activity" className="animate-spin text-[20px]" />}
            {isEdit ? "Save changes" : "Save medication"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 w-full font-label-md text-label-md text-on-surface-variant"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
