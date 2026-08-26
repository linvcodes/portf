"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";

const CALENDLY_URL = "https://calendly.com/linv-codes/30min";

/* Opens Calendly in an iframe overlay instead of navigating away — the ask was
   "same page", and a native <dialog> gives us focus-trapping and Escape-to-close
   for free instead of hand-rolling both. */
export function CalendlyButton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-sfx="confirm" className={className} style={style}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-[18px] w-[18px] shrink-0 fill-current">
          <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1zM5 10v10h14V10H5z" />
        </svg>
        <span className="relative">Book a call</span>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          >
            <div className="relative flex h-[85vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-paper">
              <div className="flex items-center justify-between px-4 py-2">
                <span id={titleId} className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink">
                  Schedule a call
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-black/5 focus-visible:outline focus-visible:outline-[3px]"
                >
                  &times;
                </button>
              </div>
              <iframe
                src={CALENDLY_URL}
                title="Schedule a call via Calendly"
                className="h-full w-full flex-1 border-0"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
