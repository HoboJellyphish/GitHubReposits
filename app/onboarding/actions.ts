"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/utils";
import type { Role } from "@/lib/types";

export interface ActionResult {
  error?: string;
}

/** Create a new family group; the creator becomes the caretaker. */
export async function createFamilyGroup(input: {
  name: string;
  displayName: string;
}): Promise<ActionResult> {
  const name = input.name.trim();
  const displayName = input.displayName.trim();
  if (!name) return { error: "Please enter a family name." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  // Guard against creating a second membership.
  const { data: existing } = await supabase
    .from("mt_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) redirect("/");

  // Insert the group, retrying if the random invite code collides.
  let groupId: string | null = null;
  let lastError = "";
  for (let attempt = 0; attempt < 5 && !groupId; attempt++) {
    const { data, error } = await supabase
      .from("mt_family_groups")
      .insert({ name, invite_code: generateInviteCode() })
      .select("id")
      .single();
    if (data) {
      groupId = data.id;
    } else if (error) {
      lastError = error.message;
      // 23505 = unique violation on invite_code → try a new code.
      if (error.code !== "23505") break;
    }
  }
  if (!groupId) return { error: lastError || "Could not create your family group." };

  const { error: memberError } = await supabase.from("mt_members").insert({
    user_id: user.id,
    family_group_id: groupId,
    role: "caretaker" satisfies Role,
    display_name: displayName || name,
  });
  if (memberError) return { error: memberError.message };

  redirect("/caretaker/dashboard");
}

/** Join an existing family group with an invite code, as patient or caretaker. */
export async function joinFamilyGroup(input: {
  code: string;
  role: Role;
  displayName: string;
}): Promise<ActionResult> {
  const code = input.code.trim().toUpperCase();
  const displayName = input.displayName.trim();
  const role = input.role;
  if (!code) return { error: "Please enter an invite code." };
  if (!displayName) return { error: "Please enter your name." };
  if (role !== "patient" && role !== "caretaker") return { error: "Please choose a role." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data: existing } = await supabase
    .from("mt_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) redirect("/");

  const { data: group } = await supabase
    .from("mt_family_groups")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();
  if (!group) {
    return { error: "That invite code didn't match any family group." };
  }

  const { error: memberError } = await supabase.from("mt_members").insert({
    user_id: user.id,
    family_group_id: group.id,
    role,
    display_name: displayName,
  });
  if (memberError) return { error: memberError.message };

  redirect(role === "caretaker" ? "/caretaker/dashboard" : "/patient/today");
}
