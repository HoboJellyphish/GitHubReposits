import type { Metadata } from "next";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getMembers } from "@/lib/queries";
import { AppShell } from "@/components/AppShell";
import { CARETAKER_NAV } from "@/components/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PushToggle } from "@/components/pwa/PushToggle";
import { InviteCode } from "@/components/caretaker/InviteCode";
import { SignOutButton } from "@/components/SignOutButton";
import type { FamilyGroup, NotificationPrefs } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function CaretakerSettingsPage() {
  const { member, email } = await requireMember("caretaker");
  const supabase = createClient();

  const [{ data: group }, members, { data: prefs }] = await Promise.all([
    supabase
      .from("mt_family_groups")
      .select("*")
      .eq("id", member.family_group_id)
      .maybeSingle(),
    getMembers(member.family_group_id),
    supabase.from("mt_notification_prefs").select("*").eq("member_id", member.id).maybeSingle(),
  ]);

  const typedGroup = group as FamilyGroup | null;

  return (
    <AppShell
      navItems={CARETAKER_NAV}
      userName={member.display_name}
      settingsHref="/caretaker/settings"
    >
      <h2 className="mx-auto mb-6 w-full max-w-2xl font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
        Settings
      </h2>

      <div className="mx-auto w-full max-w-2xl space-y-8">
        <section className="space-y-3">
          <h3 className="px-1 font-label-md text-label-md uppercase text-on-surface-variant">
            Family group
          </h3>
          <Card padding="md">
            <p className="font-headline-md text-headline-md text-on-surface">
              {typedGroup?.name ?? "Your family"}
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant">
              {members.length} member{members.length === 1 ? "" : "s"}
            </p>
          </Card>
          {typedGroup?.invite_code && <InviteCode code={typedGroup.invite_code} />}
        </section>

        <section className="space-y-3">
          <h3 className="px-1 font-label-md text-label-md uppercase text-on-surface-variant">
            Members
          </h3>
          <Card padding="md" className="divide-y divide-outline-variant/40">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={m.display_name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-button-text text-button-text text-on-surface">
                    {m.display_name}
                    {m.id === member.id && (
                      <span className="ml-2 font-label-md text-label-md text-on-surface-variant">
                        (you)
                      </span>
                    )}
                  </p>
                </div>
                <Chip tone={m.role === "caretaker" ? "info" : "neutral"} className="shrink-0 capitalize">
                  {m.role}
                </Chip>
              </div>
            ))}
          </Card>
        </section>

        <section className="space-y-3">
          <h3 className="px-1 font-label-md text-label-md uppercase text-on-surface-variant">
            Profile
          </h3>
          <ProfileForm initialName={member.display_name} email={email} />
        </section>

        <section className="space-y-3">
          <h3 className="px-1 font-label-md text-label-md uppercase text-on-surface-variant">
            Notifications
          </h3>
          <PushToggle memberId={member.id} initialEnabled={prefs?.push_enabled ?? false} />
          <NotificationSettings
            memberId={member.id}
            initial={(prefs ?? {}) as Partial<NotificationPrefs>}
            showLowStock
          />
        </section>

        <SignOutButton />
      </div>
    </AppShell>
  );
}
