import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { Card, CardContent } from "@/components/ui/card";
import { AppButton } from "@/components/AppButton";
import { DocumentUploadDialog } from "@/components/dialogs/DocumentUploadDialog";
import { DocumentViewerDialog } from "@/components/dialogs/DocumentViewerDialog";
import { DOCUMENT_CATEGORIES, getCategoryDef, formatFileSize } from "@/lib/documents";
import { formatDate } from "@/lib/format";
import { Upload, FileText, AlertTriangle } from "lucide-react";
import type { DocumentCategory, MedicalDocument } from "@/types";
import { cn } from "@/lib/utils";

export function Documents() {
  const { activeProfile, listDocuments, storageError } = useAppData();
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState<MedicalDocument | null>(null);
  const [filter, setFilter] = React.useState<DocumentCategory | "all">("all");

  if (!activeProfile) return null;

  const documents = listDocuments(activeProfile.id)
    .filter((d) => filter === "all" || d.category === filter)
    .sort((a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime());

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">Older records for {activeProfile.name}, kept on this device.</p>
        </div>
        <AppButton icon={Upload} label="Upload" layout="inline" size="sm" onClick={() => setUploadOpen(true)} />
      </div>

      {storageError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-2 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              This device's storage is full, so the most recent change may not have saved. Delete a document or two
              to free up space.
            </span>
          </CardContent>
        </Card>
      )}

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
            filter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
          )}
        >
          All
        </button>
        {DOCUMENT_CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setFilter(c.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
              filter === c.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
            )}
          >
            <c.icon className="h-3.5 w-3.5" /> {c.label}
          </button>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
            <FileText className="h-6 w-6" />
            <p>No documents yet. Upload a lab result, imaging report, or visit summary to get started.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {documents.map((doc) => {
          const category = getCategoryDef(doc.category);
          const isImage = doc.mimeType.startsWith("image/");
          return (
            <Card key={doc.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setViewing(doc)}>
              <CardContent className="flex items-center gap-3 p-3">
                {isImage ? (
                  <img src={doc.dataUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <category.icon className="h-5 w-5 text-muted-foreground" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {category.label} · {formatDate(doc.documentDate)} · {formatFileSize(doc.fileSize)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} profileId={activeProfile.id} />
      {viewing && <DocumentViewerDialog open onOpenChange={(o) => !o && setViewing(null)} doc={viewing} />}
    </div>
  );
}
