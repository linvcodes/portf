"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { motionSpec } from "@/content/site.config";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** true = animate immediately on mount (above-the-fold content, no scroll needed) */
  onLoad?: boolean;
};

/** Scroll-in reveal on the fig's secondary curve. */
export function Reveal({ children, delay = 0, y = 28, className, onLoad = false }: Props) {
  const run = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(onLoad
        ? { animate: run }
        : { whileInView: run, viewport: { once: true, margin: "-12% 0px" } })}
      transition={{
        duration: motionSpec.secondary.duration,
        ease: [...motionSpec.secondary.ease],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Sticker entrance with the fig's overshoot curve. */
export function Pop({ children, delay = 0, className, onLoad = false }: Props) {
  const run = { opacity: 1, scale: 1, rotate: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.72, rotate: -6 }}
      {...(onLoad
        ? { animate: run }
        : { whileInView: run, viewport: { once: true, margin: "-10% 0px" } })}
      transition={{
        duration: motionSpec.pop.duration,
        ease: [...motionSpec.pop.ease],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
