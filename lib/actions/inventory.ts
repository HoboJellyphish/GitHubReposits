"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface InventoryResult {
  error?: string;
}

/** Update (or create) the inventory row for a medication. */
export async function updateInventory(input: {
  medicationId: string;
  quantityRemaining: number;
  lowStockThresholdDays: number;
  unit?: string | null;
}): Promise<InventoryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data: me } = await supabase
    .from("mt_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!me || me.role !== "caretaker") {
    return { error: "Only caretakers can update inventory." };
  }

  const fields: Record<string, unknown> = {
    medication_id: input.medicationId,
    quantity_remaining: input.quantityRemaining,
    low_stock_threshold_days: input.lowStockThresholdDays || 7,
    last_restocked_at: new Date().toISOString(),
  };
  if (input.unit) fields.unit = input.unit;

  const { data: existing } = await supabase
    .from("mt_inventory")
    .select("id")
    .eq("medication_id", input.medicationId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("mt_inventory").update(fields).eq("id", existing.id)
    : await supabase.from("mt_inventory").insert(fields);
  if (error) return { error: error.message };

  revalidatePath("/caretaker/inventory");
  revalidatePath("/caretaker/dashboard");
  return {};
}
