"use client";

import { useEffect } from "react";
import { AudioBus } from "@/lib/audio/AudioBus";

/* Audio wiring lives in ONE delegated listener rather than in per-component
   handlers. Two reasons: every interactive element gets feedback without
   importing the bus (so the sound layer can be deleted in one file), and the
   listeners are passive and capture-phase, so they never interfere with a
   component's own click handling.

   The bus itself decides whether anything is audible — it no-ops while muted,
   under reduced motion, and for hover on coarse pointers. Nothing here needs
   to re-check that.

   HOVER ONLY, deliberately. Almost every interactive element on this page is a
   link that navigates away, so a click sound is cut off by the navigation a
   few milliseconds after it starts — it reads as a glitch rather than as
   feedback. The hover blip has already fired by then and is the thing that
   actually confirms the target. */

const INTERACTIVE = 'a, button, [role="button"]';

export function AudioInteractions() {
  useEffect(() => {
    /* The first real gesture unlocks the AudioContext. Autoplay policy requires
       this to hang off a genuine user event, and it only ever needs to happen
       once.

       Deliberately does NOT start an ambient bed. The site's sound is one-shot
       UI feedback only — a looping pad under a portfolio page reads as a stuck
       sound rather than atmosphere, and there is no transport control for it. */
    const unlock = () => {
      AudioBus.init();
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true, passive: true });

    /* Hover is tracked with pointerover rather than mouseenter so a single
       document-level listener covers elements added later. `hoverTriggered`
       tells the bus to stay silent on touch, where "hover" fires on tap and
       would double up with the click sound. */
    let last: Element | null = null;
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
      if (!el || el === last) return;
      last = el;
      /* Two elements get their own voice rather than the shared rotation, so
         the page's two most important targets are audibly distinct from the
         dozens of ordinary links: the scroll cue, and either LinkedIn CTA. */
      const sound = el.getAttribute("data-sfx");
      if (sound === "cue" || sound === "confirm") {
        AudioBus.play(sound, { hoverTriggered: true, jitter: 0.03 });
        return;
      }
      AudioBus.playHover();
    };
    const onOut = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
      if (el && el === last) last = null;
    };
    document.addEventListener("pointerover", onOver, { passive: true, capture: true });
    document.addEventListener("pointerout", onOut, { passive: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("pointerover", onOver, { capture: true });
      document.removeEventListener("pointerout", onOut, { capture: true });
    };
  }, []);

  return null;
}
