import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { getLabPanelType, flagFor, type LabFlag } from "@/lib/labs";
import { formatDate } from "@/lib/format";
import { formatFileSize } from "@/lib/documents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/AppButton";
import { LabPanelDialog } from "@/components/dialogs/LabPanelDialog";
import { DocumentViewerDialog } from "@/components/dialogs/DocumentViewerDialog";
import type { LabPanel, MedicalDocument } from "@/types";
import { Plus, FlaskConical, FileText } from "lucide-react";

const FLAG_LABEL: Record<LabFlag, string> = { low: "Low", high: "High", normal: "In range", unknown: "No range set" };
const FLAG_VARIANT: Record<LabFlag, "warning" | "destructive" | "success" | "secondary"> = {
  low: "warning",
  high: "destructive",
  normal: "success",
  unknown: "secondary",
};

export function Labs() {
  const { activeProfile, listLabPanels, listDocuments } = useAppData();
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<LabPanel | null>(null);
  const [viewingDoc, setViewingDoc] = React.useState<MedicalDocument | null>(null);

  if (!activeProfile) return null;

  const panels = listLabPanels(activeProfile.id).sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
  const labDocuments = listDocuments(activeProfile.id)
    .filter((d) => d.category === "lab_result")
    .sort((a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime());

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Labs</h1>
          <p className="text-sm text-muted-foreground">Thyroid, vitamin, and other lab panels for {activeProfile.name}.</p>
        </div>
        <AppButton icon={Plus} label="Add Panel" layout="inline" size="sm" onClick={() => setAdding(true)} />
      </div>

      {panels.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
            <FlaskConical className="h-6 w-6" />
            <p>No lab panels yet. Add one to start tracking values like TSH, Vitamin D, or cholesterol over time.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {panels.map((panel) => {
          const def = getLabPanelType(panel.panelType);
          return (
            <Card key={panel.id} className="cursor-pointer transition-shadow hover:shadow-sm" onClick={() => setEditing(panel)}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <def.icon className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{panel.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {def.label} · {formatDate(panel.testDate)}
                    </p>
                  </div>
                </div>
                {panel.values.length > 0 && (
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {panel.values.map((v, i) => {
                      const flag = flagFor(v);
                      return (
                        <div key={i} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm">
                          <span className="truncate">{v.name}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-medium">
                              {v.value} {v.unit}
                            </span>
                            <Badge variant={FLAG_VARIANT[flag]}>{FLAG_LABEL[flag]}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {panel.note && <p className="text-xs text-muted-foreground">{panel.note}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {labDocuments.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Lab Documents</h2>
          <div className="flex flex-col gap-2">
            {labDocuments.map((doc) => (
              <Card key={doc.id} className="cursor-pointer transition-shadow hover:shadow-sm" onClick={() => setViewingDoc(doc)}>
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(doc.documentDate)} · {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <LabPanelDialog open={adding} onOpenChange={setAdding} profileId={activeProfile.id} />
      {editing && <LabPanelDialog open onOpenChange={(o) => !o && setEditing(null)} profileId={activeProfile.id} existing={editing} />}
      {viewingDoc && <DocumentViewerDialog open onOpenChange={(o) => !o && setViewingDoc(null)} doc={viewingDoc} />}
    </div>
  );
}
