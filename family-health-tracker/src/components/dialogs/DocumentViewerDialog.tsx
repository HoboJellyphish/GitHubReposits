import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/state/AppDataContext";
import { getCategoryDef, formatFileSize } from "@/lib/documents";
import { getTracker } from "@/lib/trackers";
import { formatDate, formatDateTime } from "@/lib/format";
import { DocumentReadingsDialog } from "@/components/dialogs/DocumentReadingsDialog";
import { PdfViewer } from "@/components/PdfViewer";
import type { AnyLogEntry, MedicalDocument } from "@/types";
import { Trash2, ChartLine, X } from "lucide-react";

function readingSummary(entry: AnyLogEntry): string {
  const d = entry.data as Record<string, unknown>;
  switch (entry.trackerId) {
    case "heartRate":
      return `${d.bpm} bpm`;
    case "weight":
      return `${d.kg} kg`;
    case "bloodPressure":
      return `${d.systolic}/${d.diastolic} mmHg`;
    case "glucose":
      return `${d.mgdl} mg/dL`;
    case "mood":
      return `Mood ${d.rating}/5`;
    case "water":
      return `${d.ml} mL`;
    case "steps":
      return `${d.count} steps`;
    default:
      return "Reading";
  }
}

export function DocumentViewerDialog({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: MedicalDocument;
}) {
  const { deleteDocument, listLogEntries, deleteLogEntry } = useAppData();
  const [loggingReadings, setLoggingReadings] = React.useState(false);
  const isImage = doc.mimeType.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";
  const category = getCategoryDef(doc.category);
  const linkedReadings = listLogEntries(doc.profileId).filter((e) => e.documentId === doc.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <category.icon className="h-4 w-4" /> {doc.title}
          </DialogTitle>
          <DialogDescription>
            {category.label} · {formatDate(doc.documentDate)} · {formatFileSize(doc.fileSize)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {isImage && <img src={doc.dataUrl} alt={doc.title} className="max-h-96 w-full rounded-lg border border-border object-contain" />}
          {isPdf && <PdfViewer dataUrl={doc.dataUrl} title={doc.title} />}
          {!isImage && !isPdf && (
            <a href={doc.dataUrl} download={doc.fileName} className="text-sm text-primary underline">
              Download {doc.fileName}
            </a>
          )}
          {doc.note && <p className="text-sm text-muted-foreground">{doc.note}</p>}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Readings in this profile&apos;s charts</p>
              <Button variant="outline" size="sm" onClick={() => setLoggingReadings(true)}>
                <ChartLine className="h-3.5 w-3.5" /> {linkedReadings.length > 0 ? "Add more" : "Log readings"}
              </Button>
            </div>
            {linkedReadings.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {linkedReadings
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((entry) => {
                    const tracker = getTracker(entry.trackerId);
                    return (
                      <li key={entry.id} className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm">
                        <tracker.icon className="h-3.5 w-3.5 shrink-0" style={{ color: tracker.colorVar }} />
                        <span className="flex-1">{readingSummary(entry)}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
                        <button
                          type="button"
                          onClick={() => deleteLogEntry(entry.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${tracker.label} reading`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className="items-center justify-between sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              deleteDocument(doc.id);
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <a href={doc.dataUrl} download={doc.fileName}>
            <Button variant="outline" size="sm" type="button">
              Download
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>

      {loggingReadings && <DocumentReadingsDialog open onOpenChange={setLoggingReadings} doc={doc} />}
    </Dialog>
  );
}
