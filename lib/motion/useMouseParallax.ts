"use client";
import { useEffect, useState } from "react";
import { useSpring, type SpringOptions } from "motion/react";

const SPRING: SpringOptions = { stiffness: 60, damping: 20, mass: 0.6 };

/** Normalised pointer position (-1..1), spring-smoothed. Idle on touch + reduced-motion. */
export function useMouseParallax() {
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;
    setActive(true);
    const onMove = (e: PointerEvent) => {
      x.set((e.clientX / window.innerWidth) * 2 - 1);
      y.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return { x, y, active };
}
