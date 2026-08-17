// On-device OCR via tesseract.js. Every asset it needs (the worker script,
// the WASM engine, and the English trained-data file) is served from this
// app's own /ocr/ directory — bundled with the app, never fetched from a
// CDN — so recognition works with the device fully offline. Only loaded
// when the nutrition-label scanner is actually used, so pages that never
// touch it don't pay the ~14MB load cost.
import { createWorker, type Worker as TesseractWorker } from "tesseract.js";

let workerPromise: Promise<TesseractWorker> | null = null;

function getWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = createWorker("eng", 0, {
      workerPath: "/ocr/worker.min.js",
      corePath: "/ocr/tesseract-core.wasm.js",
      langPath: "/ocr",
      cachePath: "family-health-tracker-ocr",
      gzip: true,
    });
  }
  return workerPromise;
}

/** Pre-warms the worker/model so the first real scan doesn't eat the
 * loading delay — safe to call speculatively (e.g. when a scan dialog
 * opens) since it's a no-op after the first call. */
export function preloadOcr(): void {
  void getWorker();
}

export async function recognizeText(image: string | File): Promise<string> {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  return data.text;
}
