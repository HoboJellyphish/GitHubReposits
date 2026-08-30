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
 * PDFs with no text layer — callers should fall back to OCR in that case. */
export async function extractText(pdf: PDFDocumentProxy): Promise<string> {
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 2) * 2; // tolerate sub-pixel jitter
      const x = item.transform[4];
      const bucket = lines.get(y);
      if (bucket) bucket.push({ x, str: item.str });
      else lines.set(y, [{ x, str: item.str }]);
    }
    const orderedYs = [...lines.keys()].sort((a, b) => b - a); // PDF y grows upward
    const pageLines = orderedYs
      .map((y) =>
        lines
          .get(y)!
          .sort((a, b) => a.x - b.x)
          .map((it) => it.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter((l) => l.length > 0);
    pageTexts.push(pageLines.join("\n"));
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
