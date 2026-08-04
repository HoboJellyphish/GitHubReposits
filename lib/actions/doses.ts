"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/utils";

export interface DoseActionResult {
  error?: string;
}

/** The member id of whoever is performing the action (patient or caretaker). */
async function actingMemberId(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("mt_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.id ?? null;
}

function revalidateDoseViews() {
  revalidatePath("/patient/today");
  revalidatePath("/caretaker/dashboard");
  revalidatePath("/caretaker/patients");
}

/** Mark a scheduled dose as taken (insert or update the matching log row). */
export async function confirmDose(input: {
  scheduleId: string;
  patientId: string;
  quantity: number;
  logDate?: string;
}): Promise<DoseActionResult> {
  const supabase = createClient();
  const memberId = await actingMemberId(supabase);
  if (!memberId) return { error: "Your session expired. Please sign in again." };

  const logDate = input.logDate ?? toDateKey();
  const payload = {
    schedule_id: input.scheduleId,
    patient_id: input.patientId,
    confirmed_by_id: memberId,
    log_date: logDate,
    status: "taken",
    taken_at: new Date().toISOString(),
    quantity_taken: input.quantity,
  };

  const { data: existing } = await supabase
    .from("mt_logs")
    .select("id")
    .eq("schedule_id", input.scheduleId)
    .eq("log_date", logDate)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("mt_logs").update(payload).eq("id", existing.id)
    : await supabase.from("mt_logs").insert(payload);

  if (error) return { error: error.message };
  revalidateDoseViews();
  return {};
}

/** Undo a confirmation by removing the dose's log for that day. */
export async function undoDose(input: {
  scheduleId: string;
  logDate?: string;
}): Promise<DoseActionResult> {
  const supabase = createClient();
  const memberId = await actingMemberId(supabase);
  if (!memberId) return { error: "Your session expired. Please sign in again." };

  const logDate = input.logDate ?? toDateKey();
  const { error } = await supabase
    .from("mt_logs")
    .delete()
    .eq("schedule_id", input.scheduleId)
    .eq("log_date", logDate);

  if (error) return { error: error.message };
  revalidateDoseViews();
  return {};
}
