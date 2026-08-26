"use client";

import { useCallback, useState } from "react";
import { toPng } from "html-to-image";

/* The export is the only interactive part of the card page, so it is the only
   piece that needs to be a client component. Everything else stays static.

   Why PNG rather than the browser print dialog: printing re-lays-out the card
   in the print engine, where a missing webfont, a dropped background-image or
   the user's own margin/scale settings silently change the artwork. Rasterising
   in the page freezes exactly what is on screen — type is already outlined into
   pixels, so nothing downstream can reflow or substitute it.

   Each face is a separate button. Browsers suppress a second programmatic
   download fired from one user gesture, so one click must produce one file. */

/* Trim size, matching --card-w/--card-h in card.css: 85x55mm, the ISO 7810
   ID-1 / European business card. No bleed is added here — the export is
   exactly the frame, as laid out. */
const CARD_W_MM = 85;
const CARD_H_MM = 55;
const DPI = 300;
const MM_PER_IN = 25.4;
const PX_W = Math.round((CARD_W_MM / MM_PER_IN) * DPI); // 1004
const PX_H = Math.round((CARD_H_MM / MM_PER_IN) * DPI); // 650

/* CSS px the card occupies at the browser's nominal 96dpi. The rasteriser lays
   the node out at this size and then scales the canvas up to DPI. */
const CSS_W = (CARD_W_MM / MM_PER_IN) * 96;
const CSS_H = (CARD_H_MM / MM_PER_IN) * 96;

/* On screen the card carries a preview transform, a drop shadow and a rounded
   corner. All three are screen affordances that must not reach the file. The
   width/height are left alone: .card is already at trim size, and the export
   is meant to match the frame exactly. */
const CAPTURE_STYLE = {
  transform: "none",
  margin: "0",
  borderRadius: "0",
  boxShadow: "none",
} as Record<string, string>;

const FACES = [
  { index: 0, name: "front", label: "front" },
  { index: 1, name: "back", label: "back" },
] as const;

export function PrintButton() {
  /* Which face is currently rendering, or null. Only one runs at a time. */
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportFace = useCallback(async (faceIndex: number, faceName: string) => {
    setBusy(faceName);
    setError(null);
    try {
      /* Webfonts are embedded by the rasteriser as data URIs, but only if they
         have finished loading — otherwise it captures the fallback face. */
      if (document.fonts?.ready) await document.fonts.ready;

      const node = document.querySelectorAll<HTMLElement>(".card")[faceIndex];
      if (!node) throw new Error(`Could not find the ${faceName} of the card on this page.`);

      const dataUrl = await toPng(node, {
        width: CSS_W,
        height: CSS_H,
        canvasWidth: PX_W,
        canvasHeight: PX_H,
        pixelRatio: 1,
        /* No transparent edges: the card must sit on solid white. */
        backgroundColor: "#ffffff",
        cacheBust: true,
        style: CAPTURE_STYLE,
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `kristina-card-${faceName}-${CARD_W_MM}x${CARD_H_MM}mm-${DPI}dpi.png`;
      a.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }, []);

  return (
    <>
      <div className="card-export-actions">
        {FACES.map((face) => (
          <button
            key={face.name}
            type="button"
            className="card-print-btn"
            onClick={() => exportFace(face.index, face.name)}
            disabled={busy !== null}
            aria-busy={busy === face.name}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 12v7H5v-7H3v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2zm-6 .67 2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
            </svg>
            {busy === face.name ? "Rendering…" : `Download ${face.label}`}
          </button>
        ))}
      </div>
      {/* Announced rather than shown silently: the export is a background job
          with no other visible outcome if it fails. */}
      <p role="status" aria-live="polite" className="card-export-status">
        {busy ? `Rendering the ${busy} at ${DPI}dpi…` : ""}
      </p>
      {error ? (
        <p role="alert" className="card-export-error">
          {error}
        </p>
      ) : null}
    </>
  );
}
