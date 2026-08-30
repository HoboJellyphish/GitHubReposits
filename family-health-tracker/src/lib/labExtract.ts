// Turns a lab-result PDF into editable candidate rows, entirely on-device:
// try the PDF's real text layer first (pdfjs-dist), and only fall back to
// on-device OCR (tesseract.js, already bundled locally — see lib/ocr.ts)
// for scanned/image-only PDFs with no usable text layer. Nothing here ever
// leaves the device, and nothing gets saved until the user reviews and
// confirms it — same pattern as the nutrition-label scanner.
import type { PDFDocumentProxy } from "pdfjs-dist";
import { extractText, renderPage } from "@/lib/pdf";
import { recognizeText } from "@/lib/ocr";

const MIN_TEXT_LAYER_CHARS = 40;

export async function extractLabText(pdf: PDFDocumentProxy, onOcrProgress?: (page: number, total: number) => void): Promise<{ text: string; usedOcr: boolean }> {
  const textLayer = await extractText(pdf);
  if (textLayer.replace(/\s+/g, "").length >= MIN_TEXT_LAYER_CHARS) {
    return { text: textLayer, usedOcr: false };
  }
  const canvas = document.createElement("canvas");
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    onOcrProgress?.(i, pdf.numPages);
    await renderPage(pdf, i, canvas, 1400);
    const text = await recognizeText(canvas.toDataURL("image/png"));
    pageTexts.push(text);
  }
  return { text: pageTexts.join("\n\n"), usedOcr: true };
}

export interface ExtractedLabRow {
  key: string;
  name: string;
  value: string;
  unit: string;
  referenceLow: string;
  referenceHigh: string;
  /** ISO yyyy-mm-dd, or "" if no date could be tied to this specific value */
  date: string;
}

const MONTHS = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
const MONTH_DATE_RE = new RegExp(`\\b(${MONTHS})[a-z]*\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`, "i");
const SLASH_DATE_RE = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/;

function parseDateToIso(text: string): string | undefined {
  const m = text.match(MONTH_DATE_RE);
  if (m) {
    const d = new Date(`${m[1]} ${m[2]}, ${m[3]}`);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const s = text.match(SLASH_DATE_RE);
  if (s) {
    const [, mo, da, yrRaw] = s;
    const yr = yrRaw.length === 2 ? `20${yrRaw}` : yrRaw;
    const d = new Date(`${yr}-${mo.padStart(2, "0")}-${da.padStart(2, "0")}`);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return undefined;
}

const NAME_HEADER_RE = /^[A-Z][A-Za-z0-9 /%-]{1,30}$/;
const RANGE_HINT_RE = /normal range[:\s]*([\d.]+)\s*-\s*([\d.]+)\s*([A-Za-z%/0-9]*)/i;
const TREND_ROW_RE = new RegExp(
  `(${MONTHS})[a-z]*\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})\\s+([\\d.]+)\\s*([A-Za-z%/0-9]*)\\s+([\\d.]+)\\s*-\\s*([\\d.]+)\\s*([A-Za-z%/0-9]*)`,
  "gi",
);
const INLINE_RE = /^([A-Za-z][A-Za-z0-9 /-]{1,40}?)[:\s]{1,3}([\d.]+)\s*([A-Za-z%/^0-9µ]{0,15})\b(?:.*?\(?\s*([\d.]+)\s*-\s*([\d.]+)\s*\)?)?$/;
// Report metadata fields ("Collected: 03/14/2024", "DOB: ...") match the
// inline shape but aren't lab values — filter them out by name.
const METADATA_NAME_RE = /^(patient|dob|collected|received|reported|ordered|physician|provider|account|mrn|specimen|fasting|date|age|sex|gender|accession)$/i;

let rowCounter = 0;
function nextKey(): string {
  rowCounter += 1;
  return `extracted-${rowCounter}`;
}

/** Best-effort, regex-based extraction covering the two report shapes we've
 * actually seen: a simple "Name  Value Unit  (Range)" snapshot line, and a
 * multi-visit trend table (a test-name header followed by dated rows). Never
 * assumed to be perfect — every row stays fully editable before saving. */
export function parseLabValues(text: string): ExtractedLabRow[] {
  const rows: ExtractedLabRow[] = [];
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let currentName: string | null = null;
  let currentUnit: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const trendMatches = [...line.matchAll(TREND_ROW_RE)];
    if (trendMatches.length > 0 && currentName) {
      for (const m of trendMatches) {
        rows.push({
          key: nextKey(),
          name: currentName,
          value: m[4],
          unit: m[5] || currentUnit || "",
          referenceLow: m[6],
          referenceHigh: m[7],
          date: parseDateToIso(`${m[1]} ${m[2]}, ${m[3]}`) ?? "",
        });
      }
      continue;
    }

    const rangeHint = line.match(RANGE_HINT_RE);
    if (rangeHint && currentName) {
      currentUnit = rangeHint[3] || currentUnit;
      continue;
    }

    if (NAME_HEADER_RE.test(line)) {
      const next = lines[i + 1] ?? "";
      if (RANGE_HINT_RE.test(next) || TREND_ROW_RE.test(next)) {
        currentName = line;
        currentUnit = null;
        continue;
      }
    }

    const inline = line.match(INLINE_RE);
    if (inline && !METADATA_NAME_RE.test(inline[1].trim())) {
      rows.push({
        key: nextKey(),
        name: inline[1].trim(),
        value: inline[2],
        unit: inline[3] || "",
        referenceLow: inline[4] || "",
        referenceHigh: inline[5] || "",
        date: "",
      });
    }
  }

  return rows;
}
