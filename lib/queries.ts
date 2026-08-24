import { createClient } from "@/lib/supabase/server";
import type { MedicationWithRelations, Member } from "@/lib/types";

/**
 * Coerce embedded relations to arrays.
 *
 * PostgREST returns a *single object* (not an array) for a to-one embed — and
 * because `mt_inventory.medication_id` is unique, `mt_inventory(*)` comes back
 * as one object. The UI treats both relations as arrays (`med.mt_inventory[0]`,
 * `med.mt_schedules.map(...)`), so we normalise here to keep those call sites
 * correct regardless of the embed's cardinality.
 */
export function normalizeMed(m: Record<string, unknown>): MedicationWithRelations {
  const toArray = (v: unknown) => (Array.isArray(v) ? v : v ? [v] : []);
  return {
    ...(m as unknown as MedicationWithRelations),
    mt_schedules: toArray(m.mt_schedules) as MedicationWithRelations["mt_schedules"],
    mt_inventory: toArray(m.mt_inventory) as MedicationWithRelations["mt_inventory"],
  };
}

/** Patients (role = patient) in a family group, alphabetical. */
export async function getPatients(groupId: string): Promise<Member[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("mt_members")
    .select("*")
    .eq("family_group_id", groupId)
    .eq("role", "patient")
    .order("display_name");
  return (data ?? []) as Member[];
}

/** All members of a family group (patients + caretakers). */
export async function getMembers(groupId: string): Promise<Member[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("mt_members")
    .select("*")
    .eq("family_group_id", groupId)
    .order("role")
    .order("display_name");
  return (data ?? []) as Member[];
}

/** Active medications (with schedules + inventory), optionally for one patient. */
export async function getMedications(
  groupId: string,
  patientId?: string,
): Promise<MedicationWithRelations[]> {
  const supabase = createClient();
  let query = supabase
    .from("mt_medications")
    .select("*, mt_schedules(*), mt_inventory(*)")
    .eq("family_group_id", groupId)
    .eq("is_active", true);
  if (patientId) query = query.eq("patient_id", patientId);
  const { data } = await query.order("name");
  return (data ?? []).map(normalizeMed);
}
