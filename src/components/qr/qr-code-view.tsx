"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { toDataURL } from "qrcode";
import { jsPDF } from "jspdf";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Fixed at a size large enough for quality printing (a table tent or poster),
// independent of however large the <img> is actually displayed on screen —
// one render, reused for the on-screen image and both downloads (research.md §2).
const QR_PRINT_SIZE = 1000;

// window.location.origin never changes during a page's lifetime, so there's
// nothing to subscribe to — this store only exists to read it in an
// SSR-safe, lint-clean way (matching offline-indicator.tsx's
// useSyncExternalStore pattern for the same class of problem: a browser-only
// value with no notion of itself during server rendering).
function subscribeToNothing() {
  return () => {};
}

function getOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return null;
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function QrCodeView({ name, slug }: { name: string; slug: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // window is unavailable during server-side rendering, so the real origin
  // is only resolved after hydration — this keeps the server-rendered and
  // initial client-rendered output identical, avoiding a hydration mismatch
  // (research.md §1).
  const origin = useSyncExternalStore(subscribeToNothing, getOrigin, getServerOrigin);
  const menuUrl = origin ? `${origin}/menu/${slug}` : null;

  useEffect(() => {
    if (!menuUrl) return;

    let cancelled = false;

    toDataURL(menuUrl, { width: QR_PRINT_SIZE, margin: 2 }).then((dataUrl) => {
      if (!cancelled) {
        setQrDataUrl(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [menuUrl]);

  function handleDownloadPng() {
    if (!qrDataUrl) return;
    triggerDownload(qrDataUrl, `${slug}-qr-code.png`);
  }

  // A single page of 6 identical, independently cuttable copies (3 rows x 2
  // columns) — an owner prints once and cuts it into 6 table-ready codes,
  // rather than printing/cutting a single QR code repeatedly (FR-005a).
  const PDF_GRID_COLS = 2;
  const PDF_GRID_ROWS = 3;
  const PDF_MARGIN = 30;

  function handleDownloadPdf() {
    if (!qrDataUrl || !menuUrl) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const cellWidth = (pageWidth - PDF_MARGIN * 2) / PDF_GRID_COLS;
    const cellHeight = (pageHeight - PDF_MARGIN * 2) / PDF_GRID_ROWS;
    const qrSize = Math.min(cellWidth, cellHeight) - 90;

    for (let row = 0; row < PDF_GRID_ROWS; row++) {
      for (let col = 0; col < PDF_GRID_COLS; col++) {
        const cellX = PDF_MARGIN + col * cellWidth;
        const cellY = PDF_MARGIN + row * cellHeight;
        const centerX = cellX + cellWidth / 2;

        const nameY = cellY + 30;
        const qrX = cellX + (cellWidth - qrSize) / 2;
        const qrY = nameY + 20;

        doc.setFontSize(14);
        doc.text(name, centerX, nameY, { align: "center" });

        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

        doc.setFontSize(9);
        doc.text(menuUrl, centerX, qrY + qrSize + 16, { align: "center" });
      }
    }

    doc.save(`${slug}-qr-code.pdf`);
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">
      <p className="text-sm text-muted-foreground">Scan to view your menu</p>

      <div className="flex size-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- a client-generated data URL, not a Cloudinary asset
          <img src={qrDataUrl} alt={`QR code linking to ${name}'s menu`} className="size-full" />
        ) : (
          <Skeleton className="size-56" />
        )}
      </div>

      <div className="text-center">
        <p className="font-heading text-lg font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">
          {menuUrl ? menuUrl.replace(/^https?:\/\//, "") : " "}
        </p>
      </div>

      <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
        <Button type="button" onClick={handleDownloadPng} disabled={!qrDataUrl} className="h-11">
          Download PNG
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={!qrDataUrl}
          className="h-11"
        >
          Download PDF
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Print and display this at your tables.
      </p>
    </div>
  );
}
