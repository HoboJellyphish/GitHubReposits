import type { Metadata } from "next";
import { requireMember } from "@/lib/auth";
import { getReadings } from "@/lib/readings";
import { VitalsPanel } from "@/components/vitals/VitalsPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vitals" };

export default async function PatientVitalsPage() {
  const { member } = await requireMember("patient");
  const readings = await getReadings(member.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Vitals</h2>
      <VitalsPanel patientId={member.id} readings={readings} heading="Your readings" />
    </div>
  );
}
