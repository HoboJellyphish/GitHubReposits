import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/state/AppDataContext";
import { getCategoryDef, formatFileSize } from "@/lib/documents";
import { formatDate } from "@/lib/format";
import type { MedicalDocument } from "@/types";
import { Trash2 } from "lucide-react";

export function DocumentViewerDialog({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: MedicalDocument;
}) {
  const { deleteDocument } = useAppData();
  const isImage = doc.mimeType.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";
  const category = getCategoryDef(doc.category);

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
          {isPdf && <iframe src={doc.dataUrl} title={doc.title} className="h-96 w-full rounded-lg border border-border" />}
          {!isImage && !isPdf && (
            <a href={doc.dataUrl} download={doc.fileName} className="text-sm text-primary underline">
              Download {doc.fileName}
            </a>
          )}
          {doc.note && <p className="text-sm text-muted-foreground">{doc.note}</p>}
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
    </Dialog>
  );
}
