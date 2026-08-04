import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { getPatients } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { MedicationForm } from "@/components/caretaker/MedicationForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add medication" };

export default async function AddMedicationPage({
  searchParams,
}: {
  searchParams: { patient?: string };
}) {
  const { member } = await requireMember("caretaker");
  const patients = await getPatients(member.family_group_id);

  const backHref = searchParams.patient
    ? `/caretaker/medications?patient=${searchParams.patient}`
    : "/caretaker/medications";

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-max-width-content flex-col">
      <PageHeader title="Add medication" backHref={backHref} />
      <main className="flex-1 px-margin-mobile pt-4">
        {patients.length === 0 ? (
          <EmptyState
            icon="person_add"
            title="Add a patient first"
            description="You need at least one patient before adding medications."
            action={
              <Link href="/caretaker/patients">
                <Button icon="person_add" fullWidth={false}>
                  Go to patients
                </Button>
              </Link>
            }
          />
        ) : (
          <MedicationForm patients={patients} defaultPatientId={searchParams.patient} />
        )}
      </main>
    </div>
  );
}
