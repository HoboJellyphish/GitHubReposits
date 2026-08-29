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

export async function renderPage(pdf: PDFDocumentProxy, pageNumber: number, canvas: HTMLCanvasElement, targetWidth: number): Promise<void> {
  const page = await pdf.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1 });
  const scale = targetWidth / unscaled.width;
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  await page.render({ canvasContext: ctx, viewport }).promise;
}
