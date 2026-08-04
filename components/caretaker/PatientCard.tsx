import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/Icon";
import { formatLongDate } from "@/lib/utils";
import { STATUS_META, type PatientSummary } from "@/lib/caretaker";

export function PatientCard({ summary }: { summary: PatientSummary }) {
  const meta = STATUS_META[summary.status];
  const tone =
    summary.status === "ontrack" ? "success" : summary.status === "attention" ? "warning" : "primary";

  return (
    <Link
      href={`/caretaker/patients/${summary.patient.id}`}
      className="block rounded-xl bg-surface-container-lowest p-6 soft-elevation transition-transform active:scale-[0.98]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={summary.patient.display_name} size={56} />
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate font-headline-md text-headline-md leading-tight text-on-surface">
              {summary.patient.display_name}
            </h3>
            <span className="font-body-md text-body-md text-on-surface-variant">
              {formatLongDate()}
            </span>
          </div>
        </div>
        <Chip tone={meta.tone} icon={meta.icon} className="shrink-0">
          {meta.label}
        </Chip>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <span className="font-label-md text-label-md text-on-surface">
            {summary.taken} of {summary.due} taken
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant">
            {summary.percent}%
          </span>
        </div>
        <ProgressBar value={summary.percent} tone={tone} />
      </div>

      <div className="mt-5 flex items-center justify-end gap-1 font-button-text text-button-text text-primary">
        <span>{summary.status === "attention" ? "Review plan" : "Log doses"}</span>
        <Icon name="arrow_forward" className="text-[20px]" />
      </div>
    </Link>
  );
}
