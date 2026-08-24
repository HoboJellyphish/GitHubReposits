import type { Metadata } from "next";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PushToggle } from "@/components/pwa/PushToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/Icon";
import type { NotificationPrefs } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function PatientSettingsPage() {
  const { member, email } = await requireMember("patient");
  const supabase = createClient();

  const [{ data: group }, { data: prefs }] = await Promise.all([
    supabase.from("mt_family_groups").select("name").eq("id", member.family_group_id).maybeSingle(),
    supabase
      .from("mt_notification_prefs")
      .select("*")
      .eq("member_id", member.id)
      .maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Settings</h2>

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
        />
      </section>

      <section className="space-y-3">
        <h3 className="px-1 font-label-md text-label-md uppercase text-on-surface-variant">
          Family
        </h3>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <Icon name="diversity_1" />
            </div>
            <div>
              <p className="font-button-text text-button-text text-on-surface">
                {group?.name ?? "Your family"}
              </p>
              <p className="font-label-md text-label-md capitalize text-on-surface-variant">
                {member.role}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <SignOutButton />
    </div>
  );
}
