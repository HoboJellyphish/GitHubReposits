import type { Metadata } from "next";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toDateKey, greeting, formatLongDate } from "@/lib/utils";
import { buildDoseItems, type LogMap } from "@/lib/dose";
import type { MedicationWithRelations } from "@/lib/types";
import { DoseList } from "@/components/patient/DoseList";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Today" };

export default async function TodayPage() {
  const { member } = await requireMember("patient");
  const supabase = createClient();
  const now = new Date();
  const today = toDateKey(now);

  const [{ data: meds }, { data: logs }] = await Promise.all([
    supabase
      .from("mt_medications")
      .select("*, mt_schedules(*)")
      .eq("patient_id", member.id)
      .eq("is_active", true),
    supabase
      .from("mt_logs")
      .select("id,schedule_id,status,taken_at")
      .eq("patient_id", member.id)
      .eq("log_date", today),
  ]);

  const items = buildDoseItems((meds ?? []) as MedicationWithRelations[], now);
  const initialLogs = Object.fromEntries(
    (logs ?? []).map((l) => [l.schedule_id, l]),
  ) as LogMap;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-1">
        <h2 className="truncate font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          {greeting(now)}, {member.display_name.split(" ")[0]}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">{formatLongDate(now)}</p>
      </header>

      <DoseList patientId={member.id} today={today} items={items} initialLogs={initialLogs} />
    </div>
  );
}
