"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Bubbles } from "@/components/Bubbles";
import { about, astro, motionSpec } from "@/content/site.config";
import { CoverLetterPlayer } from "@/components/CoverLetterPlayer";
import { asset } from "@/lib/asset";

const POP = { duration: motionSpec.pop.duration, ease: [...motionSpec.pop.ease] };

export function About() {
  const still = useReducedMotion();

  return (
    <section
      id="about"
      aria-labelledby="about-h"
      className="relative mx-auto w-full max-w-[1400px] px-5 py-14 md:px-10 md:py-20"
    >
      <Bubbles className="-z-10" />

      <h2 id="about-h" className="font-mono text-sm font-bold underline decoration-2 underline-offset-4 md:text-base">
        [ About me ]
      </h2>

      {/* ---------- me + bio ---------- */}
      <div className="mt-8 grid items-center gap-8 md:mt-10 md:gap-12 lg:grid-cols-[0.85fr_1fr]">
        <motion.div
          initial={still ? { opacity: 1 } : { opacity: 0, scale: 0.86, rotate: -4 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={POP}
        >
          {/* Plain `sticker`: the white cut-out halo, same as the hero figure. On
              the white page ground the halo itself is not what separates the image
              from the page; the drop-shadow at the end of the filter chain does
              that, and the white edge keeps the die-cut sticker read consistent
              with every other sticker on the site. */}
          <Image
            src={asset("/assets/me-about.webp")}
            alt={`${about.name} sitting between two retro PC towers, reading a handheld console`}
            width={760} height={909} sizes="(max-width: 767px) 68vw, (max-width: 1024px) 78vw, 36vw"
            className="sticker mx-auto h-auto w-full max-w-[300px] md:max-w-[440px]" />
        </motion.div>

        <div>
          <p className="font-display text-3xl leading-tight text-ink md:text-4xl">{about.name}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-sky-edge">
            {about.role} · {about.location}
          </p>
          {about.bio.map((p) => (
            <p key={p} className="mt-4 font-mono text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
              {p}
            </p>
          ))}

          <dl className="mt-6 flex flex-wrap gap-2">
            {astro.map((a) => (
              <div key={a.role} className="rounded-full bg-sky-main/12 px-3 py-1.5">
                <dt className="inline font-mono text-[10px] uppercase tracking-wider text-sky-edge">{a.role}</dt>
                <dd className="ml-1.5 inline font-mono text-[13px] font-bold text-ink">{a.sign}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4">
            <CoverLetterPlayer />
          </div>
        </div>
      </div>

    </section>
  );
}
