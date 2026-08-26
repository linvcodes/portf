# Portfolio — Cinematic Pass · Design Spec

Date: 2026-08-25
Project: `portfolio-site` (Next 15 · React 19 · Tailwind 3 · Motion 11)
Source of truth for parallel implementation. Every agent reads this before writing code.

---

## 0. Audit findings (measured, not assumed)

Decoded `Daily Hero 3 – Arkkhe (Copy).fig` with the repo's own Kiwi decoder
(`.claude/skills/cinematic-site/scripts/figparse.py`). No fig2json / Grida needed.

**2206 nodes · 101 frames · 13 images · 30 transitions.**

### Animation tiers present in the file

| Token | Curve | Duration | Count | Role |
|---|---|---|---|---|
| `doors` | `cubic-bezier(1, .01, .02, 1)` | 2.0s | 1 | hero curtain — used exactly once |
| `secondary` | `cubic-bezier(.4037, -.0259, 0, .9886)` | 1.0s | 15 | workhorse |
| `micro` | — | 0.25s | 10 | **undocumented, unused in site** |
| `drift` | — | 3.0–3.16s | 2 | ambient loops |

`REFERENCE.md` documents three tiers. The file has four. The 0.25s micro tier is
the one hover / tap / cursor feedback must ride on.

### Declared deviations from the fig

| Aspect | Fig | Site | Status |
|---|---|---|---|
| Display face | Viaoda Libre | Cross Stitch Cursive | intentional, **undeclared** |
| Palette | warm dark `#263237` `#160E05` `#F69070` | sky `#488ec9` / `#2765c8` | intentional, **undeclared** |

Both are correct per `REFERENCE.md` ("motion mechanics only, zero pixels reused")
but `fidelity.json` does not exist, so `figaudit.py` cannot pass for the right
reasons. Creating it is in scope.

### What already exists (do NOT rebuild)

- **Film grain + specks + Fuji cast** — `globals.css` `.grain::before/::after`,
  `.film-cast::before/::after`, wired in `layout.tsx`. Reduced-motion guarded.
  This is a **tuning** task, not a build task.
- **`about.linkedin`** — present in `site.config.ts`, simply never rendered.
- **Bag grid** — already shares Laptop's three-column geometry.
- **Parallax rig** — `useMouseParallax` + per-layer depth-ordered travel.

### Gaps

- No audio of any kind.
- No cursor layer.
- Hero horizon drifts off the crest at non-reference aspect ratios (§1).
- Bag has no structured content columns; Laptop does.
- LinkedIn not reachable from the hero.
- `fidelity.json` missing.

---

## 1. Hero horizon — the load-bearing fix

### Diagnosis

`Hero.tsx` derives the headline's baseline arithmetically:

```
CREST = 0.445                    // crest sits 44.5% down the grass FILE
crestFromBottom = g(GRASS_PCT * (1 - CREST) - GRASS_PCT * BLEED/100)   // svh
```

…but renders the plate with `object-cover object-top`. Once the container's
aspect ratio exceeds the image's 880×587, `cover` scales by **width** and crops
vertically. The crest is then no longer at 44.5% of the rendered box, so the
headline slides off the horizon. The layout is correct at exactly one aspect ratio.

### Fix — make the relationship structural, not arithmetic

1. Grass plate renders `width: 100%; height: auto`, anchored bottom, bleeding
   sideways past the panel. Intrinsic aspect is preserved, so `CREST` stays
   literally true at every width.
2. The plate's own box publishes the horizon as a CSS custom property.
   Both the grass and the headline read from that one variable.
3. Headline is positioned against the **plate**, not against `SKY_SVH`.

The headline cannot drift, because nothing recomputes it — it is anchored to the
same box that draws the crest. Sky band height may still flex; the horizon
relationship is invariant.

**Constraint:** the plate must still cover the panel's full width at every
breakpoint. Where `width:100%` leaves the plate too short vertically to fill the
band, the sky gradient below the crest fills the remainder — the crest is the
contract, not the plate's bottom edge.

---

## 2. Motion system — one vocabulary

Promote all four fig tiers into `motionSpec` in `site.config.ts`:

```ts
doors:     { duration: 2.0,  ease: [1, .01, .02, 1] }        // hero curtain, once
secondary: { duration: 1.0,  ease: [.4037, -.0259, 0, .9886] } // workhorse
pop:       { duration: 1.0,  ease: [1, -.0296, 0, 1.0946] }   // sticker overshoot
micro:     { duration: 0.25, ease: [.4037, -.0259, 0, .9886] } // NEW — hover/tap/cursor
drift:     { duration: 3.0,  ease: "easeInOut" }              // NEW — ambient loops
```

**Rule: no component defines its own duration or easing.** Every animation in the
site references one of these five tokens. This is what makes the site read as one
piece rather than a pile of separate effects. A reviewer should be able to grep
for `duration:` and find only `motionSpec` references.

Existing parallax depth ordering stays as-is — it is already monotonic with
z-index and correct.

---

## 3. Film treatment — tune, don't rebuild

Current state is good. Adjustments only:

- Add a **vignette** layer (radial, dark edges) — currently absent.
- Add slow **gate weave**: a ±0.3px whole-page translate on the `drift` tier,
  distinct from the existing grain jitter.
- Verify the custom cursor (§5) renders **above** `z-9999`, or the film cast
  will tint it.
- Keep all existing reduced-motion guards.

Do **not** convert the grain to canvas. The CSS implementation is already
compositor-friendly (`transform` + `steps()`), and swapping it risks regressing
a working effect for no measured gain.

---

## 4. Audio — ambient bed + UI layer

Source: `Portfolio/HALFTONE SFX Pack LITE` (licensed, LITE tier).
`ffmpeg` is available at `/opt/homebrew/bin/ffmpeg`.

### Asset pipeline

Convert a **curated** subset — not the whole pack — to `public/audio/` as both
`.webm` (Opus, primary) and `.mp3` (Safari fallback), mono, normalised.

| Slot | Source folder | Count |
|---|---|---|
| ambient bed | `Gameplay/9. Ambient` | 1–2 |
| hover tick | `UI/2. Clicks` | 1 |
| click / confirm | `UI/1. Buttons` | 1 |
| section transition | `UI/4. Transitions` | 1 |
| hero sting | `Gameplay/1. Win` or `UI/4. Transitions` | 1 |

Budget: **under 300 KB total**, all clips combined.

### Behaviour

Single `lib/audio/AudioBus.ts` — a thin Web Audio wrapper. No Howler.

- **Muted by default.** Non-negotiable. A portfolio that makes noise unprompted
  is a portfolio people close.
- Persistent toggle, bottom-corner, keyboard reachable, ≥44px target,
  state persisted to `localStorage` inside `try/catch`.
- `AudioContext` created lazily and only resumed on a real user gesture
  (autoplay policy). Never constructed at module scope.
- Ambient clips are **1.3–3.6s** — far too short to loop naively. Loop with a
  crossfade of ~400ms between iterations, or the seam will be audible and
  extremely annoying.
- All playback no-ops when muted, when `prefers-reduced-motion` is set, and on
  `(pointer: coarse)` for hover-triggered sounds.
- One shared gain node so the toggle is a single ramp, not per-source muting.

---

## 5. Cursor — morphing cursor + reactive widgets

Desktop only. Entirely disabled under `(pointer: coarse)` and reduced motion,
where the native cursor is left completely alone.

- **Base:** a small custom element following the pointer with slight lag, on the
  `micro` tier.
- **Morph states:** grows over links/buttons; becomes a labelled pill over cards
  (label supplied by a `data-cursor` attribute so components stay declarative);
  contracts on press.
- **Native cursor** hidden only while the custom layer is active and healthy.
- **z-index above the film cast** (§3), else it gets colour-tinted.
- **Widgets:** two or three pointer-reactive sticker elements that drift toward
  the pointer on the `drift` tier. Decorative, `aria-hidden`, `pointer-events-none`.

Accessibility: the custom cursor is presentational only. Focus rings, tab order,
and all keyboard affordances remain untouched and must not depend on it.

---

## 6. Bag section — restructure + reskin

Goal: `What's in my bag` reads as a sibling of `What's on my laptop`, both
structurally and visually.

**Laptop's pattern:** three columns — structured `dl` content left, hero image
centre, timeline/cards right — with a bracketed monospace `[ … ]` section label,
`dt` in `sky-edge` uppercase mono, `dd` as pill/tag rows.

**Bag becomes:** the same three-column grid, bag image centre, with the interests
promoted from bare sticker+caption into the same structured treatment — grouped
`dl` with mono labels and note text using Laptop's exact type scale, spacing
rhythm, and pill styling. Stickers stay, but sit inside the structured columns
rather than replacing them.

Content comes from the existing `interests` array; extend it with a grouping
field if grouping is needed. **No invented biographical facts** — use only what
is already in `site.config.ts`.

Keep the existing out-of-the-bag entrance choreography; retarget it to the new
cells.

---

## 7. LinkedIn in the hero

`about.linkedin` already exists. Render it in the hero credentials block:

- A real `<a>`, not a click handler.
- Visible resting state (no hover-only affordance — it must exist on touch).
- ≥44px tap target, `target="_blank"`, `rel="noopener noreferrer"`.
- Accessible name that says where it goes.
- Contrast: white-on-sky at small sizes fails AA per `REFERENCE.md`; it needs
  `text-pop` shadow or a scrim chip.

---

## 8. Fidelity declaration

Create `portfolio-site/fidelity.json` declaring the two intentional deviations
(font substitution, palette re-skin) plus any additions, so `figaudit.py` passes
on merit rather than being skipped.

---

## 9. Non-goals

- No new dependencies beyond what audio genuinely needs (target: zero).
- No redesign of Laptop, Services, or Footer beyond motion-token adoption.
- No content invention.
- No conversion of the working grain effect to canvas.
- No test suite, no Playwright, no browser verification — explicitly descoped by
  the user, who will review visually from a recording.

## 10. Verification

Per user instruction, **automated and browser testing are out of scope.**
The only gates that run:

- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds.

No claim of visual correctness, responsive correctness, or audio correctness will
be made. Those are the user's to judge from the recording.
