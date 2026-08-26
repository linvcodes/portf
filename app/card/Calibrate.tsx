"use client";

import { useEffect, useState } from "react";

/* True-to-life preview control.

   The card is authored in inches, which is exactly right for PRINT: `in` maps
   straight onto the page box. On SCREEN it is a lie. CSS resolves 1in to 96px
   regardless of the display's real pixel density, so on a 220ppi laptop panel a
   "3.5in" card renders about 40% too small, and on a scaled external monitor it
   lands somewhere else again. There is no API that reports physical DPI.

   So the only honest way to check physical size is to let the eye calibrate it:
   hold a real card (or any bank card, which is 3.37 x 2.12in) against the screen
   and drag until they match. The scale multiplies the preview only, never the
   print output, and is remembered per browser.

   This affects nothing about the printed PDF. */

const KEY = "card-preview-scale";
const MIN = 0.6;
const MAX = 2.2;

export function Calibrate() {
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const n = raw ? Number.parseFloat(raw) : NaN;
      if (Number.isFinite(n) && n >= MIN && n <= MAX) setScale(n);
    } catch {
      /* private windows throw on access; the default of 1 is fine */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.style.setProperty("--preview-scale", String(scale));
    try {
      window.localStorage.setItem(KEY, String(scale));
    } catch {
      /* nothing to do; the setting simply will not persist */
    }
  }, [scale, ready]);

  return (
    <div className="card-calibrate card-screen-only">
      <label className="card-calibrate-row" htmlFor="card-scale">
        <span>Preview size</span>
        <input
          id="card-scale"
          type="range"
          min={MIN}
          max={MAX}
          step={0.01}
          value={scale}
          onChange={(e) => setScale(Number.parseFloat(e.target.value))}
        />
        <output htmlFor="card-scale">{scale.toFixed(2)}&times;</output>
      </label>
      <p className="card-calibrate-hint">
        Screens do not report their real DPI, so this preview cannot know its own
        physical size. Hold a bank card (3.37&times;2.12in) against the screen and drag
        until the width matches, then judge type size and contrast. Printing is
        unaffected.
      </p>
      <button type="button" className="card-calibrate-reset" onClick={() => setScale(1)}>
        Reset to 1.00&times;
      </button>
    </div>
  );
}
