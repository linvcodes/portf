"use client";

import { useAudio } from "@/lib/audio/useAudio";

/**
 * Persistent, bottom-corner audio mute toggle. Muted by default.
 * Fixed position, keyboard reachable, >=44px tap target, visible focus ring.
 */
export function AudioToggle() {
  const { muted, toggleMuted } = useAudio();

  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute site audio" : "Mute site audio"}
      title={muted ? "Unmute site audio" : "Mute site audio"}
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))", right: "calc(1rem + env(safe-area-inset-right))" }}
      className="fixed z-[9999] flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/10 bg-paper/90 text-ink shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      {muted ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M18.36 5.64a9 9 0 0 1 0 12.72" />
        </svg>
      )}
      <span className="sr-only">{muted ? "Audio is muted" : "Audio is on"}</span>
    </button>
  );
}

export default AudioToggle;
