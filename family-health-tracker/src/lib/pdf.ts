// On-device PDF rendering via pdfjs-dist. The worker is bundled locally
// under public/pdf/ — never fetched from a CDN — consistent with this app's
// zero-network-calls guarantee.
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf/pdf.worker.min.mjs";

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function loadPdf(dataUrl: string): Promise<PDFDocumentProxy> {
  return pdfjsLib.getDocument({ data: dataUrlToBytes(dataUrl) }).promise;
}

/** Extracts the PDF's real text layer, line-grouped by vertical position so
 * tabular reports stay roughly readable. Returns "" for scanned/image-only
 * PDFs with no text layer — callers should fall back to OCR in that case.
 *
 * Many portal-generated lab PDFs (MyChart and similar) lay results out as a
 * 2-column grid of cards. Grouping purely by y merges both columns' text on
 * one line, interleaving two unrelated tests. To undo that, each line is
 * split at its single widest horizontal gap between items — provided that
 * gap is wide enough to be a real column gutter rather than normal spacing
 * — and the two halves are collected into separate column streams, each
 * emitted as its own contiguous block (left column in full, then right).
 * A single-column document never has a gap that wide, so this is a no-op
 * for ordinary reports. */
export async function extractText(pdf: PDFDocumentProxy): Promise<string> {
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const pageWidth = page.getViewport({ scale: 1 }).width;
    const columnGapThreshold = Math.max(35, pageWidth * 0.05);
    const content = await page.getTextContent();
    const lines = new Map<number, { x: number; width: number; str: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 2) * 2; // tolerate sub-pixel jitter
      const x = item.transform[4];
      const bucket = lines.get(y);
      const entry = { x, width: item.width, str: item.str };
      if (bucket) bucket.push(entry);
      else lines.set(y, [entry]);
    }
    const orderedYs = [...lines.keys()].sort((a, b) => b - a); // PDF y grows upward
    const joinItems = (items: { str: string }[]) =>
      items
        .map((it) => it.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    const leftColumn: string[] = [];
    const rightColumn: string[] = [];
    for (const y of orderedYs) {
      const rowItems = lines.get(y)!.sort((a, b) => a.x - b.x);
      let splitIndex = -1;
      let maxGap = -Infinity;
      for (let idx = 1; idx < rowItems.length; idx++) {
        const gap = rowItems[idx].x - (rowItems[idx - 1].x + rowItems[idx - 1].width);
        if (gap > maxGap) {
          maxGap = gap;
          splitIndex = idx;
        }
      }
      if (splitIndex > 0 && maxGap > columnGapThreshold) {
        const left = joinItems(rowItems.slice(0, splitIndex));
        const right = joinItems(rowItems.slice(splitIndex));
        if (left) leftColumn.push(left);
        if (right) rightColumn.push(right);
      } else {
        const whole = joinItems(rowItems);
        if (whole) leftColumn.push(whole);
      }
    }
    pageTexts.push([...leftColumn, ...rightColumn].join("\n"));
  }
  return pageTexts.join("\n\n");
}

export async function renderPage(pdf: PDFDocumentProxy, pageNumber: number, canvas: HTMLCanvasElement, targetWidth: number): Promise<void> {
  const page = await pdf.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1 });
  const scale = targetWidth / unscaled.width;
  const viewport = page.getViewport({ scale });
  // Render at the device's real pixel density (not just CSS pixels) so text
  // and chart lines stay sharp on high-DPI screens, then let CSS scale the
  // canvas back down to its intended display size.
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(viewport.width * dpr);
  canvas.height = Math.round(viewport.height * dpr);
  canvas.style.width = `${viewport.width}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  await page.render({ canvasContext: ctx, viewport }).promise;
}
