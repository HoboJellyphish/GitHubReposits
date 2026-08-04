"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Frequency, TimeLabel } from "@/lib/types";

export interface ScheduleInput {
  timeLabel: TimeLabel;
  time: string; // "HH:MM"
  quantity: number;
  enabled: boolean;
}

export interface MedicationInput {
  id?: string;
  patientId: string;
  name: string;
  form: string;
  dosageAmount: number | null;
  dosageUnit: string;
  notes: string;
  frequency: Frequency;
  specificDays: number[];
  schedules: ScheduleInput[];
  inventoryQuantity: number | null;
  lowStockThresholdDays: number;
}

export interface MedicationResult {
  error?: string;
}

async function caretakerContext(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("mt_members")
    .select("id, family_group_id, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data || data.role !== "caretaker") return null;
  return data as { id: string; family_group_id: string; role: string };
}

function normalizeTime(time: string): string {
  // Postgres `time`: accept "HH:MM" and store with seconds.
  return time.length === 5 ? `${time}:00` : time;
}

/** Create or update a medication along with its schedules and inventory. */
export async function saveMedication(input: MedicationInput): Promise<MedicationResult> {
  const supabase = createClient();
  const me = await caretakerContext(supabase);
  if (!me) return { error: "Only caretakers can manage medications." };
  if (!input.name.trim()) return { error: "Please enter a medication name." };
  if (!input.patientId) return { error: "Please choose a patient." };

  const medFields = {
    patient_id: input.patientId,
    family_group_id: me.family_group_id,
    name: input.name.trim(),
    form: input.form,
    dosage_amount: input.dosageAmount,
    dosage_unit: input.dosageUnit,
    notes: input.notes.trim() || null,
    is_active: true,
  };

  let medId = input.id;
  if (medId) {
    const { error } = await supabase.from("mt_medications").update(medFields).eq("id", medId);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("mt_medications")
      .insert(medFields)
      .select("id")
      .single();
    if (error) return { error: error.message };
    medId = data.id;
  }

  // Upsert schedules per slot; disable rather than delete to keep log history.
  const { data: existing } = await supabase
    .from("mt_schedules")
    .select("id, time_label")
    .eq("medication_id", medId);
  const existingBySlot = Object.fromEntries(
    (existing ?? []).map((s) => [s.time_label as string, s.id as string]),
  );
  const specificDays = input.frequency === "weekly" ? input.specificDays : null;

  for (const slot of input.schedules) {
    const fields = {
      medication_id: medId,
      time_label: slot.timeLabel,
      scheduled_time: normalizeTime(slot.time),
      quantity: slot.quantity || 1,
      frequency: input.frequency,
      specific_days: specificDays,
      is_active: slot.enabled,
    };
    const existingId = existingBySlot[slot.timeLabel];
    if (existingId) {
      const { error } = await supabase.from("mt_schedules").update(fields).eq("id", existingId);
      if (error) return { error: error.message };
    } else if (slot.enabled) {
      const { error } = await supabase.from("mt_schedules").insert(fields);
      if (error) return { error: error.message };
    }
  }

  // Upsert inventory (one row per medication).
  if (input.inventoryQuantity != null) {
    const invFields = {
      medication_id: medId,
      quantity_remaining: input.inventoryQuantity,
      unit: input.dosageUnit,
      low_stock_threshold_days: input.lowStockThresholdDays || 7,
    };
    const { data: inv } = await supabase
      .from("mt_inventory")
      .select("id")
      .eq("medication_id", medId)
      .maybeSingle();
    const { error } = inv
      ? await supabase.from("mt_inventory").update(invFields).eq("id", inv.id)
      : await supabase.from("mt_inventory").insert(invFields);
    if (error) return { error: error.message };
  }

  revalidatePath("/caretaker/medications");
  revalidatePath("/caretaker/inventory");
  revalidatePath("/caretaker/dashboard");
  redirect(`/caretaker/medications?patient=${input.patientId}`);
}

/** Soft-delete a medication (keeps history; hides it from active views). */
export async function deleteMedication(input: {
  id: string;
  patientId: string;
}): Promise<MedicationResult> {
  const supabase = createClient();
  const me = await caretakerContext(supabase);
  if (!me) return { error: "Only caretakers can manage medications." };

  const { error } = await supabase
    .from("mt_medications")
    .update({ is_active: false })
    .eq("id", input.id);
  if (error) return { error: error.message };

  revalidatePath("/caretaker/medications");
  revalidatePath("/caretaker/inventory");
  revalidatePath("/caretaker/dashboard");
  redirect(`/caretaker/medications?patient=${input.patientId}`);
}
