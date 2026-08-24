import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { VitalCard } from "@/components/vitals/VitalCard";
import { AddReading } from "@/components/vitals/AddReading";
import { buildSummaries } from "@/lib/vitals";
import type { Reading } from "@/lib/types";

/**
 * Health-readings panel: trend cards per vital type + a form to log a new one.
 * Used on the patient's Vitals tab and the caretaker's patient-detail view.
 */
export function VitalsPanel({
  patientId,
  readings,
  heading = "Health readings",
}: {
  patientId: string;
  readings: Reading[];
  heading?: string;
}) {
  const summaries = buildSummaries(readings);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="vital_signs" filled className="text-[22px] text-primary" />
        <h2 className="font-headline-md text-headline-md text-primary">{heading}</h2>
      </div>

      {summaries.length === 0 ? (
        <EmptyState
          icon="vital_signs"
          title="No readings yet"
          description="Log a blood pressure, glucose, temperature or other reading to start tracking trends."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {summaries.map((s) => (
            <VitalCard key={s.config.type} summary={s} />
          ))}
        </div>
      )}

      <AddReading patientId={patientId} />

      <p className="flex items-start gap-2 px-1 font-label-md text-label-md text-on-surface-variant">
        <Icon name="info" className="mt-0.5 text-[16px]" />
        Informational only — reference ranges are general guidance, not medical advice. For any
        concern, check with a doctor.
      </p>
    </section>
  );
}
