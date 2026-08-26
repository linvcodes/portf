"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionSpec } from "@/content/site.config";

/* Scroll cue sitting between the services cards and the work section.

   It is a real anchor rather than a decorative glyph: it moves focus and the
   viewport to the same place a click does, so keyboard and screen-reader users
   get the affordance too. The bob is the only thing that is purely decorative,
   and it stops under reduced motion.

   Frutiger Aero surface, same language as the hero CTA and the footer button:
   a glossy blue lozenge with a bright specular sweep across the upper half, an
   inner top highlight, an inner bottom shadow, and an outer glow. */

export function ScrollCue({ href = "#work", label = "See my work" }: { href?: string; label?: string }) {
  const still = useReducedMotion();

  return (
    <div className="flex w-full justify-center pb-4 pt-2">
      <motion.a
        href={href}
        aria-label={label}
        data-sfx="cue"
        className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full text-paper transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-sky-edge active:translate-y-0"
        style={{
          background: "linear-gradient(180deg, #7cc0ee 0%, var(--sky-main) 48%, var(--sky-edge) 100%)",
          boxShadow: [
            "inset 0 2px 1px rgba(255,255,255,.95)",
            "inset 0 -3px 8px rgba(11,45,92,.5)",
            "inset 0 0 0 1px rgba(255,255,255,.34)",
            "0 8px 22px rgba(39,101,200,.4)",
            "0 2px 5px rgba(10,23,41,.22)",
          ].join(", "),
        }}
        /* The bob rides the drift tier, so it reads as ambient rather than as a
           reaction to anything the visitor did. */
        animate={still ? undefined : { y: [0, 5, 0] }}
        transition={
          still
            ? undefined
            : {
                duration: motionSpec.drift.duration * 0.8,
                ease: motionSpec.drift.ease,
                repeat: Infinity,
              }
        }
      >
        {/* specular sweep — upper half only, so the lozenge reads as glass */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[14%] top-[7%] h-[38%] rounded-full opacity-90"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.3) 60%, rgba(255,255,255,0) 100%)",
          }}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="relative h-6 w-6 fill-none stroke-current"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 1px 1px rgba(10,23,41,.4))" }}
        >
          <path d="M12 5v13M6 12.5l6 6 6-6" />
        </svg>
      </motion.a>
    </div>
  );
}
