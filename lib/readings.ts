import { createClient } from "@/lib/supabase/server";
import type { Reading } from "@/lib/types";

/** A patient's vitals readings within the last `sinceDays`, oldest → newest. */
export async function getReadings(patientId: string, sinceDays = 120): Promise<Reading[]> {
  const supabase = createClient();
  const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
  const { data } = await supabase
    .from("mt_readings")
    .select("*")
    .eq("patient_id", patientId)
    .gte("taken_at", since)
    .order("taken_at", { ascending: true });
  return (data ?? []) as Reading[];
}
