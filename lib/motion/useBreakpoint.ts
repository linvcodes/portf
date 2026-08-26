"use client";
import { useEffect, useState } from "react";

/* One source of truth for the layout switch.

   The hero's composition is not a fluid scale of one design — phone and desktop
   are genuinely different arrangements (the figure moves from "standing on the
   right bezel" to "centred under the type", the horizon moves, the type stack
   reflows). Media queries in CSS cannot express that, because the geometry is
   computed in JS from the sky band's height. So the breakpoint is read once here
   and the constants are chosen from it.

   Renders false on the server and on the first client paint, then corrects in a
   layout effect before paint on the client. `md` matches Tailwind's 768px so the
   JS switch and the class-based `md:` utilities never disagree. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True for the narrow/portrait hero composition.

    Deliberately NOT a plain `max-width` test. What actually breaks the desktop
    hero is the panel being TALLER THAN IT IS WIDE: the figure is sized off the
    band's height and hung off the right edge, so a portrait panel makes her wide
    enough to cover the CTA. A 820x1180 tablet is well past any phone width and
    still fails that way.

    So the switch is on orientation as well as width: any portrait-ish viewport
    up to the point where the panel is comfortably landscape gets the stacked
    composition. */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px), (max-aspect-ratio: 9/10)");
}

/** Observed border-box width of `ref`, in px. 0 before the first measurement.

    The hero's phone panel derives its HEIGHT from its own WIDTH, and CSS cannot
    express that here: `aspect-ratio` would fight the svh ceiling and the px
    floor in the same clamp, and a percentage height resolves against the
    parent's height rather than its width. So the width is measured and fed back
    in as a px term. A ResizeObserver rather than a resize listener, because the
    panel's width also changes when its container does (orientation change,
    desktop window resize, a scrollbar appearing) without the viewport firing. */
export function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}
