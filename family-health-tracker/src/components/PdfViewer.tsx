import * as React from "react";
import { Button } from "@/components/ui/button";
import { loadPdf, renderPage } from "@/lib/pdf";
import { saveAndShareFile } from "@/lib/nativeSave";
import { Loader2, ChevronLeft, ChevronRight, AlertTriangle, Download } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

export function PdfViewer({ dataUrl, title }: { dataUrl: string; title: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const pdfRef = React.useRef<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);
    loadPdf(dataUrl)
      .then((pdf) => {
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't open this PDF for preview.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      pdfRef.current?.cleanup();
    };
  }, [dataUrl]);

  React.useEffect(() => {
    if (!pdfRef.current || !canvasRef.current || loading) return;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    let cancelled = false;
    let rendering = false;
    let pending = false;

    const render = () => {
      if (cancelled) return;
      if (rendering) {
        pending = true;
        return;
      }
      rendering = true;
      const width = Math.max(200, Math.min(container.getBoundingClientRect().width, 640));
      renderPage(pdfRef.current!, page, canvas, width)
        .catch(() => {
          if (!cancelled) setError("Couldn't render this page.");
        })
        .finally(() => {
          rendering = false;
          if (pending && !cancelled) {
            pending = false;
            render();
          }
        });
    };
    render();

    const observer = new ResizeObserver(() => render());
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [page, loading, numPages]);

  const handleSavePage = () => {
    if (!canvasRef.current) return;
    const pageDataUrl = canvasRef.current.toDataURL("image/png");
    const safeTitle = title.replace(/[^\w.-]+/g, "_");
    saveAndShareFile(pageDataUrl, `${safeTitle}-page-${page}.png`);
  };

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground">
        <AlertTriangle className="h-5 w-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-2">
      <div className="flex max-h-96 w-full min-w-0 items-center justify-center overflow-auto rounded-lg border border-border bg-muted/30 p-2">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <canvas ref={canvasRef} aria-label={title} className="block max-w-full h-auto" />
        )}
      </div>
      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {numPages > 1 && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                Page {page} of {numPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= numPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleSavePage}>
            <Download className="h-3.5 w-3.5" /> Save page as image
          </Button>
        </div>
      )}
    </div>
  );
}
