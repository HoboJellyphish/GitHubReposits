"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReadingType } from "@/lib/types";

export interface AddReadingInput {
  patientId: string;
  type: ReadingType;
  valuePrimary: number;
  valueSecondary?: number | null;
  unit?: string | null;
  notes?: string | null;
  /** ISO timestamp; defaults to now. */
  takenAt?: string;
}

export interface ReadingResult {
  error?: string;
}

/** Record a vitals reading for a patient (by the patient or a caretaker). */
export async function addReading(input: AddReadingInput): Promise<ReadingResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data: me } = await supabase
    .from("mt_members")
    .select("id, family_group_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!me) return { error: "No member profile found for your account." };

  if (!Number.isFinite(input.valuePrimary)) return { error: "Please enter a valid value." };

  const { error } = await supabase.from("mt_readings").insert({
    patient_id: input.patientId,
    family_group_id: me.family_group_id,
    recorded_by_id: me.id,
    type: input.type,
    value_primary: input.valuePrimary,
    value_secondary: input.valueSecondary ?? null,
    unit: input.unit ?? null,
    notes: input.notes?.trim() || null,
    taken_at: input.takenAt || new Date().toISOString(),
  });
  if (error) return { error: error.message };

  revalidatePath("/patient/vitals");
  revalidatePath(`/caretaker/patients/${input.patientId}`);
  return {};
}
