import type { DocumentCategory } from "@/types";
import { FlaskConical, Scan, ClipboardList, FileSignature, Syringe, File, type LucideIcon } from "lucide-react";

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; icon: LucideIcon }[] = [
  { value: "lab_result", label: "Lab Result", icon: FlaskConical },
  { value: "imaging", label: "Imaging", icon: Scan },
  { value: "visit_summary", label: "Visit Summary", icon: ClipboardList },
  { value: "prescription", label: "Prescription", icon: FileSignature },
  { value: "immunization", label: "Immunization", icon: Syringe },
  { value: "other", label: "Other", icon: File },
];

export function getCategoryDef(value: DocumentCategory) {
  return DOCUMENT_CATEGORIES.find((c) => c.value === value) ?? DOCUMENT_CATEGORIES[DOCUMENT_CATEGORIES.length - 1];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
