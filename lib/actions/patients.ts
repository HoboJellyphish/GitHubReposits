"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface PatientResult {
  error?: string;
  patientId?: string;
}

/** Caretaker creates a managed patient (no login required for that patient). */
export async function createPatient(input: { displayName: string }): Promise<PatientResult> {
  const name = input.displayName.trim();
  if (!name) return { error: "Please enter the patient's name." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data: me } = await supabase
    .from("mt_members")
    .select("family_group_id, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!me || me.role !== "caretaker") {
    return { error: "Only caretakers can add patients." };
  }

  const { data, error } = await supabase
    .from("mt_members")
    .insert({
      family_group_id: me.family_group_id,
      role: "patient",
      display_name: name,
      user_id: null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/caretaker/patients");
  revalidatePath("/caretaker/dashboard");
  return { patientId: data.id };
}
