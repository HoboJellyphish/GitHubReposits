import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/state/AppDataContext";
import { DOCUMENT_CATEGORIES, MAX_DOCUMENT_BYTES, formatFileSize } from "@/lib/documents";
import { nowIso } from "@/lib/format";
import type { DocumentCategory, MedicalDocument } from "@/types";
import { Upload, FileText } from "lucide-react";

export function DocumentUploadDialog({
  open,
  onOpenChange,
  profileId,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  onUploaded?: (doc: MedicalDocument) => void;
}) {
  const { addDocument } = useAppData();
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<DocumentCategory>("lab_result");
  const [documentDate, setDocumentDate] = React.useState(() => nowIso().slice(0, 10));
  const [note, setNote] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setCategory("lab_result");
      setDocumentDate(nowIso().slice(0, 10));
      setNote("");
      setFile(null);
      setDataUrl(null);
      setError(null);
      setSaving(false);
    }
  }, [open]);

  const handleFile = (f: File | undefined) => {
    setError(null);
    setDataUrl(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_DOCUMENT_BYTES) {
      setError(`That file is ${formatFileSize(f.size)} — this device can only store files up to ${formatFileSize(MAX_DOCUMENT_BYTES)}.`);
      setFile(null);
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = () => setDataUrl(reader.result as string);
    reader.onerror = () => setError("Couldn't read that file. Try again.");
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!file || !dataUrl || !title.trim()) return;
    setSaving(true);
    const saved = addDocument({
      profileId,
      title: title.trim(),
      category,
      documentDate: new Date(documentDate).toISOString(),
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      dataUrl,
      fileSize: file.size,
      note: note || undefined,
    });
    onOpenChange(false);
    onUploaded?.(saved);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Upload Medical Document
          </DialogTitle>
          <DialogDescription>
            Bring an older lab result, imaging report, or visit summary into this profile's record. Files stay on
            this device only.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-file">File</Label>
            <label
              htmlFor="doc-file"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center hover:border-primary"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {file ? `${file.name} · ${formatFileSize(file.size)}` : "Tap to choose a PDF or photo"}
              </span>
              <input
                id="doc-file"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-title">Title</Label>
            <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bloodwork panel" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-date">Document date</Label>
              <Input id="doc-date" type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-note">Note (optional)</Label>
            <Textarea id="doc-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!file || !dataUrl || !title.trim() || saving}>
            Save Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
