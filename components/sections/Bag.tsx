"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { interests, motionSpec } from "@/content/site.config";
import { useMediaQuery } from "@/lib/motion/useBreakpoint";
import { asset } from "@/lib/asset";

const POP = { duration: motionSpec.pop.duration, ease: [...motionSpec.pop.ease] };

type Interest = (typeof interests)[number];

/* One bag entry: sticker + structured dl row, matching Laptop's
   dt (mono uppercase, sky-edge) / dd (pill) treatment exactly. Emerges from
   the bag's direction so the motion still reads as "out of the bag" even
   though the final position is grid-driven, not absolute. */
function BagEntry({ it, i, still, from, stacked }: { it: Interest; i: number; still: boolean | null; from: "left" | "right"; stacked: boolean }) {
  const dir = from === "left" ? -1 : 1;
  /* The "out of the bag" slide is a LATERAL move, and it only has somewhere to
     come from while the entries sit in narrow columns flanking the bag. Stacked
     into one full-width column on a phone, that same 46% offset starts the row
     off the side of the screen — and because the reveal only fires once the row
     scrolls into view, the row sits there at its initial offset, widening the
     document until then. So on mobile the entry rises instead of sliding. */
  const enter = stacked
    ? { opacity: 0, scale: 0.72, y: 22 }
    : { opacity: 0, scale: 0.3, x: `${dir * 46}%`, y: 26 };
  return (
    <motion.div
      className="flex min-w-0 flex-row items-center gap-3 text-left lg:gap-2"
      initial={still ? { opacity: 1 } : enter}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ ...POP, delay: 0.35 + i * 0.16 }}
    >
      {/* rotation lives on the IMAGE only — the caption below stays upright */}
      <motion.div
        className="shrink-0"
        initial={still ? { rotate: i % 2 ? 3 : -3 } : { rotate: stacked ? dir * -7 : dir * -14 }}
        whileInView={{ rotate: i % 2 ? 3 : -3 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ ...POP, delay: 0.35 + i * 0.16 }}
      >
        <Image src={asset(it.src)} alt="" width={220} height={220}
          sizes="(max-width: 767px) 20vw, 15vw"
          className="sticker h-auto w-[74px] max-w-none object-contain md:mx-auto md:w-full md:max-w-[96px]" />
      </motion.div>
      <dl className="min-w-0">
        <dt className="font-mono text-[11px] uppercase tracking-wider text-sky-edge">{it.label}</dt>
        <dd className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-sky-main/40 bg-paper px-2.5 py-1 text-[12px] text-ink-soft">
            {it.note}
          </span>
        </dd>
      </dl>
    </motion.div>
  );
}

export function Bag() {
  const still = useReducedMotion();
  /* Below `lg` the three columns collapse into one, which is what makes the
     lateral bag-entry slide impossible — see BagEntry. */
  const stacked = !useMediaQuery("(min-width: 1024px)");

  return (
    <section
      id="bag"
      aria-labelledby="bag-h"
      className="relative mx-auto w-full max-w-[1400px] px-5 pb-14 md:px-10 md:pb-20"
    >
      {/* ---------- what's in my bag: own label, full width ---------- */}
      <h2 id="bag-h" className="font-mono text-sm font-bold underline decoration-2 underline-offset-4 md:text-base">
        [ What&rsquo;s in my bag? ]
      </h2>

      {/* Same grid geometry AND same content treatment as the Laptop section
          above: structured dl columns flanking a centred hero image. Interests
          are split across the two flanking columns (rather than one full-width
          skills dl) so the stickers keep emerging from the bag on both sides —
          the choreography is the point, the dl/dt/dd pairing is what makes each
          entry read as real content instead of a caption under a photo. */}
      <div className="mx-auto mt-8 w-full min-w-0 max-w-[1280px] md:mt-10 md:px-10">
        <div className="grid min-w-0 items-start gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.25fr)]">

          {/* LEFT — first half of the interests, structured like Laptop's Tools & skills */}
          <div className="order-2 min-w-0 lg:order-1">
            <h3 className="font-body text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">Always in there</h3>
            <div className="mt-4 space-y-4 md:space-y-5">
              {interests.slice(0, 3).map((it, i) => (
                <BagEntry key={it.id} it={it} i={i} still={still} from="right" stacked={stacked} />
              ))}
            </div>
          </div>

          {/* CENTRE — the bag, in the same cell the laptop occupies above */}
          <motion.div
            className="order-1 lg:order-2"
            initial={still ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={POP}
          >
            <Image src={asset("/assets/bag.webp")} alt="My bag" width={500} height={500}
              sizes="(max-width: 767px) 55vw, (max-width: 1024px) 60vw, 30vw"
              className="sticker mx-auto h-auto w-full max-w-[230px] md:max-w-[420px]" />
          </motion.div>

          {/* RIGHT — remaining interests, same structured treatment */}
          <div className="order-3 min-w-0 lg:order-3">
            <h3 className="font-body text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">Depends on the day</h3>
            <div className="mt-4 space-y-4 md:space-y-5">
              {interests.slice(3).map((it, i) => (
                <BagEntry key={it.id} it={it} i={i + 3} still={still} from="left" stacked={stacked} />
              ))}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
