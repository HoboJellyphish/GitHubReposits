import type { Metadata } from "next";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/utils";
import type { MedicationWithRelations } from "@/lib/types";
import { HistoryCalendar } from "@/components/patient/HistoryCalendar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  const { member } = await requireMember("patient");
  const supabase = createClient();

  const { data: meds } = await supabase
    .from("mt_medications")
    .select("*, mt_schedules(*)")
    .eq("patient_id", member.id)
    .eq("is_active", true);

  return (
    <div className="space-y-6">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">History</h2>
      <HistoryCalendar
        patientId={member.id}
        today={toDateKey()}
        meds={(meds ?? []) as MedicationWithRelations[]}
      />
    </div>
  );
}
