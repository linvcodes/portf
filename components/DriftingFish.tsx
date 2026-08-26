"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { motionSpec } from "@/content/site.config";
import { useMediaQuery } from "@/lib/motion/useBreakpoint";
import { asset } from "@/lib/asset";

/* Ambient goldfish drifting through the page behind the content.

   Two motions compose, and they are deliberately different in kind:

   - SCROLL gives vertical travel. Each fish has its own `depth`; a smaller
     depth means it moves less than the page does, so it reads as further away.
     This is parallax, so it must be driven by scroll progress rather than by a
     scroll listener writing state.
   - A LOOPING sway gives lateral drift and a slow tilt, on the `drift` tier, so
     the fish still feel alive when the page is not moving.

   The two never write to the same transform axis: scroll owns `y`, the loop
   owns `x` and `rotate`. Writing both to one axis is how the earlier version's
   parallax got silently overwritten by its own entrance animation. */

type Fish = {
  src: string;
  /** vw from the left edge */
  left: number;
  /** % down the scrollable page where this fish starts */
  top: number;
  /** rendered width in vw */
  size: number;
  /** scroll parallax factor: <1 lags the page, >1 outruns it */
  depth: number;
  /** lateral sway in px */
  sway: number;
  /** seconds offset so the shoal never pulses in unison */
  delay: number;
  flip?: boolean;
};

const SHOAL: Fish[] = [
  { src: "/assets/goldfish-c.webp", left: 6,  top: 18, size: 7,   depth: 0.28, sway: 34, delay: 0 },
  { src: "/assets/goldfish-b.webp", left: 78, top: 27, size: 5.5, depth: 0.44, sway: -28, delay: 1.4, flip: true },
  { src: "/assets/goldfish-a.webp",  left: 12, top: 44, size: 9,   depth: 0.19, sway: 42, delay: 2.6 },
  { src: "/assets/goldfish-b.webp", left: 72, top: 56, size: 6.5, depth: 0.36, sway: -32, delay: 0.8 },
  { src: "/assets/goldfish-c.webp", left: 22, top: 70, size: 5,   depth: 0.5,  sway: 24, delay: 3.2, flip: true },
  { src: "/assets/goldfish-a.webp",  left: 76, top: 82, size: 8,   depth: 0.24, sway: -38, delay: 1.9, flip: true },
];

function Drifter({ fish, mdOnly = false, narrow }: { fish: Fish; mdOnly?: boolean; narrow: boolean }) {
  const { scrollYProgress } = useScroll();
  /* Travel scales with depth: a near fish sweeps a long way up the viewport
     over the full scroll, a far one barely shifts. Negative so they rise as
     the page descends. */
  const y = useTransform(scrollYProgress, [0, 1], [0, -700 * fish.depth]);

  return (
    <motion.div
      className={`absolute ${mdOnly ? "hidden md:block" : ""}`}
      /* `left` is a PERCENTAGE of the clipped layer, not vw. vw ignores the
         scrollbar and, more importantly, a fish at left:88vw whose own width is
         another 8vw ended up past the viewport edge. Percent keeps the whole
         shoal inside the layer that clips it.

         On a phone the copy runs the full width of the column, so a fish at a
         mid-page `left` sits directly under a paragraph. `narrow` pushes each
         one out to whichever margin it is already nearer, where the only thing
         behind it is page ground. */
      style={{ left: `${narrow ? (fish.left < 50 ? -2 : 88) : fish.left}%`, top: `${fish.top}%`, y }}
    >
      <motion.div
        animate={{ x: [0, fish.sway, 0], rotate: [0, fish.sway > 0 ? 4 : -4, 0] }}
        transition={{
          duration: motionSpec.drift.duration * 6,
          ease: motionSpec.drift.ease,
          repeat: Infinity,
          delay: fish.delay,
        }}
      >
        <Image
          src={asset(fish.src)}
          alt=""
          width={220}
          height={184}
          sizes="(max-width: 767px) 12vw, 10vw"
          className={`sticker block h-auto ${fish.flip ? "-scale-x-100" : ""}`}
          /* No `minWidth` on a phone: forcing every fish to at least 44px made
             the far, small ones read at the same size as the near ones, which
             flattens the depth the whole shoal exists to create. */
          style={{ width: `${narrow ? fish.size * 0.7 : fish.size}vw`, minWidth: narrow ? 22 : 26, maxWidth: narrow ? 62 : 130 }}
        />
      </motion.div>
    </motion.div>
  );
}

export function DriftingFish() {
  const still = useReducedMotion();
  const narrow = !useMediaQuery("(min-width: 768px)");

  /* Reduced motion drops the layer entirely rather than freezing it: a static
     fish parked mid-page over the copy is just clutter, where a moving one is
     scenery. */
  if (still) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Mobile gets a thinned shoal rather than no shoal — a narrow screen has
          less room beside the copy, but hiding decorative scenery outright on the
          most common viewport would strip the page's character where most people
          actually see it. The extra fish fade in from md up. */}
      {SHOAL.map((fish, i) => (
        <Drifter key={i} fish={fish} mdOnly={i % 2 === 1} narrow={narrow} />
      ))}
    </div>
  );
}
