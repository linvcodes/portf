"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion, useTransform, useReducedMotion } from "motion/react";
import { useMouseParallax } from "@/lib/motion/useMouseParallax";
import { useIsMobile, useElementWidth } from "@/lib/motion/useBreakpoint";
import { motionSpec, about, hero } from "@/content/site.config";
import { CalendlyButton } from "@/components/CalendlyButton";
import { asset } from "@/lib/asset";

const P = motionSpec.parallax;

/* Shared glass-lozenge look for every CTA in the panel — LinkedIn, the printed
   card, and Calendly all read as the same pill so a second CTA doesn't look
   like an afterthought next to the first. */
const CTA_STYLE: React.CSSProperties = {
  background: "linear-gradient(180deg, #6fb7ec 0%, var(--sky-main) 46%, var(--sky-edge) 100%)",
  boxShadow: [
    "inset 0 2px 1px rgba(255,255,255,.95)",
    "inset 0 -3px 8px rgba(11,45,92,.55)",
    "inset 0 0 0 1px rgba(255,255,255,.32)",
    "0 10px 26px rgba(39,101,200,.42)",
    "0 2px 5px rgba(10,23,41,.25)",
  ].join(", "),
  textShadow: "0 1px 2px rgba(10,23,41,.45)",
};

/* First screen targets 100svh: the sky band flexes, the services band takes exactly
   the height its cards need. hero-grass.webp is 880x342 and the visible crest sits
   44.5% down the file. All art is sized off the sky band's definite height in svh, so no
   pixel heights are hardcoded and each image keeps its ratio — bleeding sideways
   rather than being squashed. */

/* ── Phone vs desktop are two compositions, not one scaled ──────────────────
   The desktop arrangement puts the figure on the right bezel at 60% of the band
   height with `width:auto`. On a 390px phone that same rule makes her ~300px
   wide against a 350px panel: she covers the tagline, the pitch and the CTA,
   and pushes the document 70px wider than the viewport.

   So the phone gets its own geometry:
   - a TALLER band in svh (the panel is narrow, so it needs height to breathe)
   - the horizon RAISED, opening a clear stage below the grass for the type
   - the figure sized off the panel's WIDTH, not its height, and centred low
     rather than hung off the right edge, so she never crosses the type column
   - the CTA and pitch stacked in that cleared stage instead of floating over her

   Every value below is picked so the type column and the figure occupy
   DISJOINT bands of the panel. That is the whole contract. */
const MOBILE_STAGE_H = 108;  // px: pitch + CTA + credentials + gaps

/* ── Panel height on mobile keeps the DESKTOP aspect ───────────────────────
   The panel is a picture. A picture has one composition, and it should read the
   same on a phone as it does on a laptop — same horizon, same crop, just
   smaller. Sizing it in `svh` broke that: the width shrank with the screen and
   the height did not, so the frame turned from a 2:1 landscape plate into a 1:2
   portrait sliver and every element inside had to be re-choreographed to fit.

   So the phone panel is sized from its own WIDTH at the same ratio the desktop
   panel resolves to, and the viewport is only ever a CEILING:

     height = clamp(MIN_PX, width / ASPECT, MAX_SVH)

   The consequence that matters: at 2:1 a 390px phone gives a ~190px band. That
   is nowhere near enough to also hold the CTA stack, so on mobile the pitch,
   the button and the credentials move OUT of the panel and onto the page
   beneath it. That is the point of the change — the picture stays a picture,
   and the fold below it belongs to the services instead of to empty sky. */
/* The figure's height as a share of the PLATE's height — never of the viewport,
   and the SAME share at every breakpoint. That is what makes her read at one
   consistent scale relative to the picture: shrink the plate and she shrinks
   with it, in step. */
const FIG_BAND_SHARE = 0.4;

/* Not the desktop plate's 2:1. At that ratio a phone plate is ~195px tall and
   the cross-stitch display face — which has thin strokes — stops being legible
   inside it. 1.2 is the compromise: still nowhere near the 1:2 sliver the svh
   sizing produced, still leaves most of the fold to the services, but gives the
   headline enough plate to read on. */
const MOBILE_ASPECT  = 1.2;   // width : height of the phone plate
const MOBILE_MIN_H   = 260;   // px floor for very narrow devices
const MOBILE_MAX_SVH = 58;    // svh ceiling — the picture never owns the fold

const L = {
  mobile: {
    /* Retained as the svh CEILING for the clamp below, not as the panel's
       height. See MOBILE_ASPECT. */
    SKY_SVH: MOBILE_MAX_SVH,
    /* Same frame shape as desktop, so the same composition numbers: the
       horizon sits mid-plate and the headline is half-buried by it, exactly as
       on a laptop. */
    HORIZON_PCT: 50,
    CLOUD_PCT: 46,
    OVERSCAN: 24,      // small bleed — a big one is what overflowed the page
    /* Height-driven, exactly as on desktop. That rule only misbehaved while the
       frame was portrait; on a 2:1 plate it produces the same silhouette it
       does on a laptop, scaled down. */
    figWidthPct: 0,
    figRight: "-1.5rem",
    figBottom: "",
    /* Sized in `cqw` — percent of the PLATE's width, not the viewport's.
       The plate is a small picture on a phone, so viewport-relative type came
       out tiny inside it while still being large on the page. Container units
       keep the type at the same proportion of the picture at every size, which
       is what makes the composition read identically to desktop. */
    headline: "13cqw",
    tagline: "9cqw",
    pitch: "clamp(1.05rem, 4.6vw, 1.5rem)",
  },
  desktop: {
    SKY_SVH: 66,
    HORIZON_PCT: 50,
    CLOUD_PCT: 46,
    OVERSCAN: 64,
    figWidthPct: 0,    // desktop sizes the figure off HEIGHT instead (see below)
    figRight: "-4.5rem",
    figBottom: "",
    /* Same container-relative sizes as mobile — see the mobile block. */
    headline: "13cqw",
    tagline: "9cqw",
    pitch: "clamp(1.5rem, 4vw, 2.6rem)",
  },
} as const;

const GRASS_RATIO = 880 / 342;  // measured from the actual file, not assumed
const CLOUD_RATIO = 5000 / 2219;
/* CRT screen outline in objectBoundingBox units (0..1) so it scales with the
   panel. Each edge is one quadratic curve whose control point sits beyond the
   edge, pushing the MIDDLE of that edge outward — corners stay tucked in. */
const B = 0.055;   // how far each edge midpoint bows out
const I = 0.012;   // how far the corners tuck in
const CRT_PATH = [
  `M ${I + 0.04} ${I}`,                        // just past the top-left corner
  `Q 0.5 ${I - B} ${1 - I - 0.04} ${I}`,       // top edge, centre bows UP
  `Q ${1 - I} ${I} ${1 - I} ${I + 0.04}`,      // tight top-right corner
  `Q ${1 - I + B} 0.5 ${1 - I} ${1 - I - 0.04}`, // right edge, centre bows OUT
  `Q ${1 - I} ${1 - I} ${1 - I - 0.04} ${1 - I}`,
  `Q 0.5 ${1 - I + B} ${I + 0.04} ${1 - I}`,   // bottom edge, centre bows DOWN
  `Q ${I} ${1 - I} ${I} ${1 - I - 0.04}`,
  `Q ${I - B} 0.5 ${I} ${I + 0.04}`,           // left edge, centre bows OUT
  `Q ${I} ${I} ${I + 0.04} ${I}`,
  "Z",
].join(" ");

/* ── Entrance timeline ────────────────────────────────────────────────────
   One cycle, not per-element animations. Every beat is an offset into the SAME
   clock, so the reveal reads as a single orchestrated move: the white curtain
   parts (fig's `doors` curve), the cloud banks sweep outward with it, then the
   scene settles front-to-back. Beats are seconds from hero mount. */
const T = {
  hero:     0.00,   // whole panel reveals as one unit
  panel:    0.35,   // panel shadow lifts, separating the CRT from the page
  clouds:   0.45,   // cloud banks settle in
  grass:    0.70,   // horizon rises into place
  headline: 0.95,   // line 1 lifts from behind the grass
  tagline:  1.20,   // "with ai?" settles above it
  figure:   1.35,   // she steps onto the bezel
  fish:     1.55,   // goldfish drift in
  badges:   1.75,   // credentials fade up last
} as const;
const DOOR_EASE = [...motionSpec.doors.ease] as [number, number, number, number];
const SOFT_EASE = [...motionSpec.secondary.ease] as [number, number, number, number];
const POP_EASE  = [...motionSpec.pop.ease] as [number, number, number, number];

/* Hero beats are scaled off the `secondary` token rather than written as raw
   seconds, so the whole entrance retimes from one number and every duration on
   the site still traces back to a curve the fig actually used. The multipliers
   carry the pacing: the panel settles slowest, the credentials snap in fastest. */
const S = motionSpec.secondary.duration;
const DUR = {
  hero:     S * 1.2,
  panel:    S * 1.6,
  clouds:   S * 1.9,
  grass:    S * 1.5,
  headline: S * 1.1,
  tagline:  S * 1.0,
  badges:   S * 0.8,
  fish:     S * 1.0,
  /* credential dot pulse — ambient, so it rides the drift tier */
  pulse:    motionSpec.drift.duration * 0.8,
} as const;

export function Hero() {
  const { x, y } = useMouseParallax();
  const still = useReducedMotion();
  const isMobile = useIsMobile();
  /* The panel's height is derived from this width on mobile — see `--band-h`. */
  const bandRef = useRef<HTMLDivElement>(null);
  const bandW = useElementWidth(bandRef);
  const L_ = isMobile ? L.mobile : L.desktop;
  const { SKY_SVH, HORIZON_PCT, CLOUD_PCT, OVERSCAN } = L_;
  const g = (pct: number) => (SKY_SVH * pct) / 100;   // % of sky band -> svh

  /* With reduced motion every beat collapses to 0 and durations to ~0:
     the scene is simply present, no curtain, no drift. */
  const t = (beat: number) => (still ? 0 : beat);
  const d = (secs: number) => (still ? 0 : secs);
  const sky  = { x: useTransform(x, [-1, 1], [-P.sky, P.sky]),   y: useTransform(y, [-1, 1], [-P.sky * 0.5, P.sky * 0.5]) };
  const mid  = { x: useTransform(x, [-1, 1], [-P.mid, P.mid]),   y: useTransform(y, [-1, 1], [-P.mid * 0.4, P.mid * 0.4]) };
  const fish = { x: useTransform(x, [-1, 1], [-P.fish, P.fish]), y: useTransform(y, [-1, 1], [-P.fish * 0.5, P.fish * 0.5]) };
  const fig  = { x: useTransform(x, [-1, 1], [-P.figure, P.figure]), y: useTransform(y, [-1, 1], [-P.figure * 0.3, P.figure * 0.3]) };
  /* text layers — same rig, speed matched to each one's z-index */
  const head = { x: useTransform(x, [-1, 1], [-P.headline, P.headline]), y: useTransform(y, [-1, 1], [-P.headline * 0.45, P.headline * 0.45]) };
  const tag  = { x: useTransform(x, [-1, 1], [-P.tagline, P.tagline]),   y: useTransform(y, [-1, 1], [-P.tagline * 0.4, P.tagline * 0.4]) };
  const badge= { x: useTransform(x, [-1, 1], [-P.badges, P.badges]),     y: useTransform(y, [-1, 1], [-P.badges * 0.3, P.badges * 0.3]) };

  return (
    <header className="relative isolate w-full overflow-x-clip">
      {/* clipPath in objectBoundingBox units — scales to whatever size the panel is */}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <clipPath id="crt-screen" clipPathUnits="objectBoundingBox">
            <path d={CRT_PATH} />
          </clipPath>
        </defs>
      </svg>
      {/* first screen — 100svh target; grows only if the cards need more room */}
      <div className="relative flex w-full flex-col">

        {/* ---------- sky band: inset to the same column as the other sections ---------- */}
        <motion.div
          ref={bandRef}
          className="relative mx-auto w-full max-w-[1280px] px-3 pt-4 sm:px-5 md:px-10 md:pt-10"
          /* Declared HERE, on the ancestor the clipped panel and the figure
             share, because the figure is the panel's SIBLING — set on the panel
             it would not inherit down to her. */
          style={{
            ["--stage-h" as string]: `${MOBILE_STAGE_H}px`,
            /* The panel's real height, in ONE place. Everything that used to be
               computed as a share of a flat `SKY_SVH` now resolves against this
               instead, so the aspect rule and the art stay in sync by
               construction rather than by matching two separate formulas.

               Note this is deliberately NOT `calc(100% / ratio)`: a percentage
               HEIGHT resolves against the parent's height (auto here), not its
               width, so that expression collapses the panel to zero. The width
               is measured and fed in as a px value instead — see `bandW`. */
            ["--band-h" as string]: isMobile
              ? /* Before the first measurement bandW is 0; fall back to the svh
                   ceiling so the panel renders at a sane height on the server
                   and on the first paint rather than collapsing. The observer
                   corrects it in the same frame the ref attaches. */
                bandW > 0
                ? `clamp(${MOBILE_MIN_H}px, ${Math.round(bandW / MOBILE_ASPECT)}px, ${MOBILE_MAX_SVH}svh)`
                : `${MOBILE_MAX_SVH}svh`
              : `${SKY_SVH}svh`,
          }}
          initial={{ opacity: still ? 1 : 0, y: still ? 0 : 26, scale: still ? 1 : 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: d(DUR.hero), ease: SOFT_EASE, delay: t(T.hero) }}
        >
        <motion.div
          initial={{ filter: "drop-shadow(0 0px 0px rgba(39,101,200,0))" }}
          animate={{ filter: "drop-shadow(0 2px 16px rgba(39,101,200,.18))" }}
          transition={{ duration: d(DUR.panel), ease: SOFT_EASE, delay: t(T.panel) }}
        >
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{
            height: "var(--band-h)",
            /* Establishes the container the hero type is sized against (`cqw`).
               Without this the cq units fall back to the viewport, which is the
               very thing they exist to avoid. */
            containerType: "inline-size",
            /* CRT screen: every edge bows outward from its own midpoint, corners
               pulled in. A path is used because border-radius can only curve
               corners — it cannot push the middle of an edge outward. */
            clipPath: "url(#crt-screen)",
            WebkitClipPath: "url(#crt-screen)",
            background: "radial-gradient(120% 100% at 50% 30%, var(--sky-main) 0%, var(--sky-edge) 100%)",
            /* The horizon is a straight percentage of THIS box's height (HORIZON_PCT),
               so it needs no container-query maths — percentage offsets already
               resolve against this element for its absolutely-positioned children. */
          }}
        >
          {/* z1 — two cloud banks: mirrored, but different scale, offset and opacity
              so the pair never reads as one image duplicated */}
          <motion.div className="pointer-events-none absolute z-[1]"
            style={{ x: sky.x, y: sky.y, inset: `-${OVERSCAN}px` }}>
            {/* inner wrapper carries the ENTRANCE; the outer one owns parallax,
                so the two never write to the same transform */}
            <motion.div className="absolute inset-0"
              initial={{ opacity: still ? 1 : 0, scale: still ? 1 : 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: d(DUR.clouds), ease: SOFT_EASE, delay: t(T.clouds) }}>
            <Image src={asset("/assets/clouds.webp")} alt="" width={2400} height={1065} priority sizes="(max-width: 767px) 130vw, 80vw"
              className="fuji-pro-400h absolute max-w-none opacity-90"
              style={{
                left: "-11%", top: `calc(${g(-4)}svh + ${OVERSCAN / 2}px)`,
                height: `${g(CLOUD_PCT * 1.18)}svh`,
                width: `calc(${g(CLOUD_PCT * 1.18)}svh * ${CLOUD_RATIO})`,
              }} />
            </motion.div>
            <motion.div className="absolute inset-0"
              initial={{ opacity: still ? 1 : 0, scale: still ? 1 : 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: d(DUR.clouds), ease: SOFT_EASE, delay: t(T.clouds + 0.08) }}>
            <Image src={asset("/assets/clouds.webp")} alt="" width={2400} height={1065} priority sizes="(max-width: 767px) 110vw, 64vw"
              className="fuji-pro-400h absolute max-w-none scale-x-[-1] opacity-[0.72]"
              style={{
                right: "-7%", top: `calc(${g(9)}svh + ${OVERSCAN / 2}px)`,
                height: `${g(CLOUD_PCT * 0.82)}svh`,
                width: `calc(${g(CLOUD_PCT * 0.82)}svh * ${CLOUD_RATIO})`,
              }} />
            </motion.div>
          </motion.div>

          {/* z2 — line 1, centred, BEHIND the grass. Its own CENTRE sits on the same
              HORIZON_PCT mark the grass plate's TOP edge is anchored to, so the type
              is half-buried by the grass no matter how the hero scales. `translateY(-50%)`
              is what converts the top-edge anchor into a centre anchor. */}
          <motion.div className="pointer-events-none absolute inset-x-0 z-[5] flex justify-center px-4 md:px-5"
               style={{ x: head.x, y: head.y, top: `${HORIZON_PCT}%` }}>
            {/* -50% lives on a plain wrapper, not on the motion element above: that
                element's `y` is a parallax MotionValue, and a static translateY on the
                same node would be overwritten by it. */}
            <div className="w-full -translate-y-1/2">
            <motion.h1 className="m-0 text-center font-display leading-[0.9] text-paper"
                style={{ fontSize: L_.headline }}
                initial={{ y: still ? 0 : "34%", opacity: still ? 1 : 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: d(DUR.headline), ease: SOFT_EASE, delay: t(T.headline) }}>
              {hero.line1}
            </motion.h1>
            </div>
          </motion.div>

          {/* z3 — grass: anchored by its TOP edge at HORIZON_PCT of the band's height.
              That single line is the whole contract — the top of the plate and the
              centre of the headline both sit at the same mark, so the type reads
              as standing on the horizon at every size.

              The plate keeps its 880x342 aspect and is width-driven, so on a wide
              band it is far TALLER than the remaining half of the band. That is
              intended: everything below the band's bottom edge is clipped away by the
              parent's `overflow-hidden`. Anchoring the top and letting the bottom fall
              off-frame is what keeps the horizon stable — anchoring the bottom (the
              previous approach) made the crest's position depend on the plate's full
              height, which grows with viewport width and pushed the horizon upward.

              On a phone the plate's natural 880:342 height lands a pixel or two
              SHORT of the band's bottom edge, so the image's own soft lower edge
              showed as a sliver of blue under the field. `minHeight` forces it
              to overshoot and be clipped, exactly as it already is on desktop —
              which is why the desktop version never had the seam. */}
          <motion.div
            className="pointer-events-none absolute z-[10]"
            style={{ x: mid.x, y: mid.y, top: `${HORIZON_PCT}%`, left: `-${OVERSCAN}px`, right: `-${OVERSCAN}px` }}
          >
            <motion.div
              className="w-full"
              /* The plate keeps its true 880:342 ratio at BOTH sizes — the
                 aspect is what makes it read as the same photograph. `minHeight`
                 only guarantees it always reaches past the band's bottom edge so
                 the clip, not the image's own soft edge, is what ends the field.
                 On desktop the ratio already overshoots by ~220px and the
                 minimum never binds; on a phone it is what closes the 1-2px gap
                 that was showing blue. */
              style={{
                aspectRatio: `${GRASS_RATIO}`,
                minHeight: `calc(var(--band-h) * ${(100 - HORIZON_PCT) / 100} + 2px)`,
              }}
              initial={{ y: still ? 0 : "9%", opacity: still ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: d(DUR.grass), ease: SOFT_EASE, delay: t(T.grass) }}>
              <Image src={asset("/assets/hero-grass.webp")} alt="" width={880} height={342} sizes="(max-width: 767px) 140vw, 110vw"
                className="fuji-pro-400h block h-full w-full" />
            </motion.div>
          </motion.div>

          {/* z4 — line 2, directly UNDER line 1 and in FRONT of the grass.
              Anchored to the same HORIZON_PCT mark as line 1, then pushed down by
              half of line 1's own height (line 1 is centred on the mark, so half of
              it hangs below) plus a small gap. Both lines therefore key off one
              number and read as a single stacked block — line 1 half-buried by the
              field, line 2 standing in front of it. */}
          <motion.div className="pointer-events-none absolute inset-x-0 z-[20] flex justify-center px-4 md:px-5"
               style={{ x: tag.x, y: tag.y, top: `${HORIZON_PCT}%` }}>
            {/* Push down by half of LINE 1's rendered height (its clamp x 0.9 leading,
                halved) so line 2 clears it exactly, at every size the clamp resolves
                to. Static transform lives on this plain wrapper, never on the motion
                element above, whose `y` is a parallax MotionValue. */}
            <div
              className="w-full"
              style={{ transform: `translateY(calc(${L_.headline} * 0.45))` }}
            >
            <motion.p className="m-0 text-center font-display leading-[0.9] text-paper text-pop"
               style={{ fontSize: L_.tagline }}
               initial={{ y: still ? 0 : "48%", opacity: still ? 1 : 0, scale: still ? 1 : 0.94 }}
               animate={{ y: 0, opacity: 1, scale: 1 }}
               transition={{ duration: d(DUR.tagline), ease: POP_EASE, delay: t(T.tagline) }}>
              {hero.line2}
            </motion.p>
            </div>
          </motion.div>

          <h2 className="sr-only">
            {hero.line1} {hero.line2} {about.name}, {about.role}, {about.location}.
          </h2>

          {/* z5 goldfish.
              On a phone the pair is repositioned to the panel's top corners: at the
              desktop offsets they land directly on the headline, which on a narrow
              band occupies the middle of the frame rather than a strip of it. */}
          <motion.div className="pointer-events-none absolute inset-0 z-[25]" style={{ x: fish.x, y: fish.y }}>
            <motion.div className="relative h-full w-full"
              initial={{ opacity: still ? 1 : 0, scale: still ? 1 : 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: d(DUR.fish), ease: POP_EASE, delay: t(T.fish) }}>
              <Image src={asset("/assets/goldfish-a.webp")} alt="" width={600} height={501} sizes="(max-width: 767px) 26vw, 20vw"
                className="sticker absolute left-[1%] top-[3%] w-[17vw] max-w-[74px] -scale-x-100 md:left-[2%] md:top-[14%] md:w-[20vw] md:max-w-[200px]" />
              <Image src={asset("/assets/goldfish-b.webp")} alt="" width={400} height={400} sizes="(max-width: 767px) 15vw, 11vw"
                className="sticker absolute right-[2%] top-[2%] w-[11vw] max-w-[48px] md:right-[38%] md:w-[11vw] md:max-w-[110px]" />
            </motion.div>
          </motion.div>

          {/* ── The stage beneath the horizon ────────────────────────────────
              On a phone the pitch, the CTA and the credentials are laid out as a
              real flex COLUMN pinned to the bottom of the panel, rather than three
              separately-positioned absolute blocks at hand-tuned percentages. A
              column cannot overlap itself, which is what guarantees the CTA is
              never buried under the figure or the tagline no matter how the clamps
              resolve. Desktop keeps its original absolute placement. */}
          {/* Desktop keeps its pitch/CTA/credentials INSIDE the plate. On
              mobile that stack lives below the picture instead — see the
              mobile stage after the panel. */}
          {!isMobile && (
            <>
              {/* credentials block — bottom-left of the screen, one unit */}
              <motion.div className="absolute bottom-5 left-5 z-[30] md:bottom-7 md:left-8"
                   style={{ x: badge.x, y: badge.y }}>
                <motion.div
                  initial={{ y: still ? 0 : 14, opacity: still ? 1 : 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: d(DUR.badges), ease: SOFT_EASE, delay: t(T.badges) }}>
                <span aria-hidden="true" className="mb-2 block h-px w-10 bg-paper/50" />
                <ul className="space-y-1.5">
                  {hero.badges.map((b, i) => (
                    <li key={b.label} className="flex items-center gap-2">
                      <motion.span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange"
                        animate={{ opacity: [1, 0.25, 1] }}
                        transition={{ duration: DUR.pulse, repeat: Infinity, ease: "easeInOut", delay: t(T.badges + 0.5) + i * 0.8 }}
                      />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-paper text-pop md:text-[11px]">
                        {b.label}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.1em] text-paper text-pop md:text-[11px]">
                        since {b.since}
                      </span>
                    </li>
                  ))}
                </ul>
                </motion.div>
              </motion.div>

              {/* z6a — the pitch, played as a call-us ad. She is already on the phone in
                  the cut-out, so the line reads as the punchline to that image, and it
                  sits directly above the CTA so the two read as one unit: brand, action.

                  Set in the BODY face rather than the display script: the two headline
                  lines above already carry the script, and repeating it here made the
                  call to action read as more decoration instead of the thing to act on. */}
              <motion.div
                className="pointer-events-none absolute inset-x-0 bottom-[26%] z-[40] px-5 text-center md:bottom-[27%]"
                initial={{ opacity: still ? 1 : 0, y: still ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: d(DUR.tagline), ease: SOFT_EASE, delay: t(T.badges - 0.15) }}
              >
                <p
                  className="m-0 font-body font-bold uppercase leading-[1] tracking-[0.04em] text-paper text-pop"
                  style={{ fontSize: L_.pitch }}
                >
                  {hero.pitchCall}
                </p>
              </motion.div>

              {/* z6 — contact CTA, INSIDE the panel: centred horizontally, sitting in the
                  band between "with ai?" and the panel's bottom edge.

                  Deliberately STILL. Everything else in this panel drifts on the pointer;
                  this is the one thing a visitor is meant to hit, so it stays exactly
                  where the eye first lands on it — no parallax rig, no idle loop. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-[8%] z-[40] flex flex-wrap justify-center gap-3 px-5">
                <motion.a
                  href={about.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Get in touch with ${about.name} on LinkedIn (opens in a new tab)`}
                  data-sfx="confirm"
                  className="pointer-events-auto group relative inline-flex min-h-[56px] items-center gap-3 rounded-full px-8 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-paper transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-paper active:translate-y-0 md:min-h-[64px] md:px-11 md:text-[15px]"
                  style={CTA_STYLE}
                  initial={{ opacity: still ? 1 : 0, y: still ? 0 : 18, scale: still ? 1 : 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: d(DUR.badges), ease: POP_EASE, delay: t(T.badges) }}
                >
                  {/* specular sweep — top half only, so the lozenge reads as glass */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-[3%] top-[5%] h-[42%] rounded-full opacity-90"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.28) 62%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-5 w-5 shrink-0 fill-current md:h-[22px] md:w-[22px]">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
                  </svg>
                  <span className="relative">{hero.cta}</span>
                </motion.a>

                <CalendlyButton className="pointer-events-auto group relative inline-flex min-h-[56px] items-center gap-3 rounded-full px-8 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-paper transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-paper active:translate-y-0 md:min-h-[64px] md:px-11 md:text-[15px]" />
              </div>
            </>
          )}

        </div>
        </motion.div>

          {/* figure — sibling of the clipped panel, so it overlaps the panel edge
              like a sticker standing on a monitor bezel, not clipped by the panel.

              The cut-out is 609x760: she is on a payphone with a hand thrust
              toward the lens, which is the fourth-wall device the source .fig uses
              too.

              DESKTOP sizes her off the band's HEIGHT and hangs her off the right
              edge. On a phone that rule produced a figure wider than the panel,
              which covered the tagline and the CTA and pushed the document past
              the viewport width. So the phone sizes her off the panel's WIDTH and
              seats her on the panel's bottom edge, in the band the type column
              deliberately leaves clear.

              Outer div owns PARALLAX (x/y MotionValues); the inner one owns the
              ENTRANCE. Both must never write the same transform axis, or the
              entrance silently overwrites the parallax and she stops tracking. */}
          <motion.div
            className="pointer-events-none absolute z-[60]"
            /* One rule for both now. The mobile branch this used to carry only
               existed because the frame was portrait there; on a 2:1 plate the
               height-driven rule produces the same silhouette at both sizes. */
            /* Her height is a share of the PLATE, not of the viewport. That is
               what makes her read at the same scale relative to the picture on a
               phone as on a laptop — the whole point of giving the plate a fixed
               aspect. `g()` could not do this on mobile: there SKY_SVH is only
               the clamp's ceiling, so `g(60)` was 60% of a height the plate
               never actually had, and she towered over it. */
            style={{
              x: fig.x, y: fig.y,
              height: `calc(var(--band-h) * ${FIG_BAND_SHARE})`,
              width: "auto",
              right: L_.figRight,
              bottom: `calc(var(--band-h) * ${-FIG_BAND_SHARE * 0.16})`,
            }}
          >
            <motion.div
              className="h-full w-auto"
              initial={{ opacity: still ? 1 : 0, x: still ? 0 : 90, rotate: still ? 0 : 4 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: d(motionSpec.doors.duration), ease: DOOR_EASE, delay: t(T.figure) }}
            >
              <Image src={asset("/assets/me-hero.webp")}
                alt={`${about.name} on a payphone, reaching a hand toward the viewer`}
                width={609} height={760} priority sizes="(max-width: 767px) 60vw, 40vw"
                className="sticker block h-full w-auto max-w-none" />
            </motion.div>
          </motion.div>

        </motion.div>


            {/* The picture above is a fixed-aspect plate, so it has no room for
                this stack. On mobile the pitch, the CTA and the credentials sit
                BELOW it, in normal flow on the page — which is what frees the
                rest of the fold for the services section. */}
            {isMobile && (
            <div className="flex flex-col items-center gap-3 px-5 pb-2 pt-5">
              <motion.p
                className="m-0 text-center font-body font-bold uppercase leading-[1] tracking-[0.04em] text-ink"
                style={{ fontSize: L_.pitch }}
                initial={{ opacity: still ? 1 : 0, y: still ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: d(DUR.tagline), ease: SOFT_EASE, delay: t(T.badges - 0.15) }}
              >
                {hero.pitchCall}
              </motion.p>

              <div className="flex flex-wrap justify-center gap-2.5">
                <motion.a
                  href={about.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Get in touch with ${about.name} on LinkedIn (opens in a new tab)`}
                  data-sfx="confirm"
                  className="pointer-events-auto group relative inline-flex min-h-[52px] items-center gap-2.5 rounded-full px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-paper transition-transform duration-200 active:translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-sky-edge"
                  style={CTA_STYLE}
                  initial={{ opacity: still ? 1 : 0, y: still ? 0 : 18, scale: still ? 1 : 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: d(DUR.badges), ease: POP_EASE, delay: t(T.badges) }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-[3%] top-[5%] h-[42%] rounded-full opacity-90"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.28) 62%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-[18px] w-[18px] shrink-0 fill-current">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
                  </svg>
                  <span className="relative">{hero.cta}</span>
                </motion.a>

                <CalendlyButton
                  className="pointer-events-auto group relative inline-flex min-h-[52px] items-center gap-2.5 rounded-full px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-paper transition-transform duration-200 active:translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-sky-edge"
                  style={CTA_STYLE}
                />
              </div>

              {/* credentials — a single centred row on a phone, so they read as a
                  caption under the CTA rather than a column fighting the figure
                  for the bottom-left corner */}
              <motion.ul
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
                initial={{ y: still ? 0 : 14, opacity: still ? 1 : 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: d(DUR.badges), ease: SOFT_EASE, delay: t(T.badges + 0.1) }}
              >
                {hero.badges.map((b, i) => (
                  <li key={b.label} className="flex items-center gap-1.5">
                    <motion.span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange"
                      animate={{ opacity: [1, 0.25, 1] }}
                      transition={{ duration: DUR.pulse, repeat: Infinity, ease: "easeInOut", delay: t(T.badges + 0.5) + i * 0.8 }}
                    />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                      {b.label}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.08em] text-ink-soft">
                      {b.since}
                    </span>
                  </li>
                ))}
              </motion.ul>
            </div>
            )}

      </div>
    </header>
  );
}
