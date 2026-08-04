import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/AppButton";
import { MedicationEditDialog } from "@/components/dialogs/MedicationEditDialog";
import { MedicationDoseDialog } from "@/components/dialogs/MedicationDoseDialog";
import { Pill, Plus, Bell, Check, X as XIcon, MinusCircle } from "lucide-react";
import { formatRelative } from "@/lib/format";
import type { Medication } from "@/types";

const STATUS_ICON = { taken: Check, missed: XIcon, skipped: MinusCircle } as const;

export function Medications() {
  const { activeProfile, listMedications, listDoses, updateMedication } = useAppData();
  const [editMed, setEditMed] = React.useState<Medication | null | undefined>(undefined);
  const [doseOpen, setDoseOpen] = React.useState(false);

  if (!activeProfile) return null;

  const medications = listMedications(activeProfile.id);
  const doses = listDoses(activeProfile.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const active = medications.filter((m) => m.active);
  const inactive = medications.filter((m) => !m.active);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Medications</h1>
          <p className="text-sm text-muted-foreground">{activeProfile.name}'s personal medication list.</p>
        </div>
        <div className="flex gap-2">
          <AppButton icon={Pill} label="Log Dose" layout="inline" variant="outline" size="sm" onClick={() => setDoseOpen(true)} />
          <AppButton icon={Plus} label="Add Medication" layout="inline" size="sm" onClick={() => setEditMed(null)} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Active</h2>
        {active.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">No active medications.</CardContent>
          </Card>
        )}
        {active.map((m) => (
          <Card key={m.id} className="cursor-pointer" onClick={() => setEditMed(m)}>
            <CardContent className="flex items-center gap-3 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: m.color + "26" }}>
                <Pill className="h-5 w-5" style={{ color: m.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.dosage} {m.frequency && `· ${m.frequency}`}
                </p>
              </div>
              {m.reminderTimes.length > 0 && (
                <Badge variant="outline">
                  <Bell className="h-3 w-3" /> {m.reminderTimes[0]}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {inactive.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Inactive</h2>
          {inactive.map((m) => (
            <Card key={m.id} className="cursor-pointer opacity-70" onClick={() => setEditMed(m)}>
              <CardContent className="flex items-center gap-3 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: m.color + "1a" }}>
                  <Pill className="h-5 w-5" style={{ color: m.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">Discontinued</p>
                </div>
                <AppButton
                  icon={Check}
                  label="Reactivate"
                  layout="inline"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMedication(m.id, { active: true });
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Recent Doses</h2>
        {doses.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">No doses logged yet.</CardContent>
          </Card>
        )}
        {doses.slice(0, 25).map((dose) => {
          const med = medications.find((m) => m.id === dose.medicationId);
          const StatusIcon = STATUS_ICON[dose.status];
          return (
            <Card key={dose.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <StatusIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{med?.name ?? "Deleted medication"}</p>
                  <p className="text-xs capitalize text-muted-foreground">{dose.status}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(dose.timestamp)}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editMed !== undefined && (
        <MedicationEditDialog
          open
          onOpenChange={(o) => !o && setEditMed(undefined)}
          profileId={activeProfile.id}
          medication={editMed ?? undefined}
        />
      )}
      <MedicationDoseDialog open={doseOpen} onOpenChange={setDoseOpen} profileId={activeProfile.id} />
    </div>
  );
}
