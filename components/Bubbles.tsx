"use client";
import { motion, useReducedMotion } from "motion/react";

type B = { left: number; size: number; delay: number; dur: number; drift: number };

const FIELD: B[] = [
  { left: 4,  size: 34, delay: 0,   dur: 15, drift: 26 },
  { left: 11, size: 20, delay: 2.4, dur: 12, drift: -18 },
  { left: 18, size: 48, delay: 4.8, dur: 18, drift: 34 },
  { left: 74, size: 26, delay: 1.2, dur: 14, drift: -24 },
  { left: 83, size: 40, delay: 3.6, dur: 17, drift: 20 },
  { left: 92, size: 22, delay: 6,   dur: 13, drift: -30 },
  { left: 60, size: 30, delay: 7.5, dur: 16, drift: 22 },
  { left: 40, size: 18, delay: 9,   dur: 11, drift: -16 },
];

/** Coded bubbles — iridescent CSS spheres drifting upward. Decorative only. */
export function Bubbles({ className = "" }: { className?: string }) {
  const still = useReducedMotion();
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {FIELD.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${b.left}%`,
            bottom: -80,
            width: b.size,
            height: b.size,
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.35) 18%, rgba(255,170,220,.28) 42%, rgba(150,225,255,.30) 66%, rgba(255,240,160,.26) 82%, rgba(255,255,255,.10) 100%)",
            boxShadow: "inset 0 0 10px rgba(255,255,255,.65), 0 0 12px rgba(150,225,255,.35)",
            border: "1px solid rgba(255,255,255,.55)",
          }}
          animate={
            still
              ? { opacity: 0.5 }
              : { y: [0, -820], x: [0, b.drift, 0], opacity: [0, 0.85, 0.85, 0] }
          }
          transition={
            still
              ? undefined
              : { duration: b.dur, delay: b.delay, repeat: Infinity, ease: "linear", times: [0, 0.12, 0.8, 1] }
          }
        />
      ))}
    </div>
  );
}
