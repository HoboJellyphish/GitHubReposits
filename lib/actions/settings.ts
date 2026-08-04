"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NotificationPrefs } from "@/lib/types";

export interface SettingsResult {
  error?: string;
}

/** Update the signed-in member's display name. */
export async function updateDisplayName(input: { displayName: string }): Promise<SettingsResult> {
  const name = input.displayName.trim();
  if (!name) return { error: "Name can't be empty." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { error } = await supabase
    .from("mt_members")
    .update({ display_name: name })
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/patient/settings");
  revalidatePath("/caretaker/settings");
  return {};
}

/** Upsert a member's notification preferences. */
export async function updateNotificationPrefs(input: {
  memberId: string;
  prefs: Partial<NotificationPrefs>;
}): Promise<SettingsResult> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("mt_notification_prefs")
    .select("id")
    .eq("member_id", input.memberId)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("mt_notification_prefs")
        .update(input.prefs)
        .eq("member_id", input.memberId)
    : await supabase
        .from("mt_notification_prefs")
        .insert({ member_id: input.memberId, ...input.prefs });

  if (error) return { error: error.message };
  return {};
}
