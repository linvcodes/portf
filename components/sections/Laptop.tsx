"use client";
import Image from "next/image";
import { useState } from "react";
import { Reveal, Pop } from "@/lib/motion/Reveal";
import { tools, timeline, projects, talks } from "@/content/site.config";
import { asset } from "@/lib/asset";

export function Laptop() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="work" aria-labelledby="work-h" className="mx-auto w-full max-w-[1280px] px-5 py-14 md:px-10 md:py-20">
      <Reveal>
        <h2 id="work-h" className="font-mono text-sm font-bold underline decoration-2 underline-offset-4 md:text-base">
          [ What&apos;s on my laptop: tools, work history &amp; projects ]
        </h2>
      </Reveal>

      <div className="mt-8 grid items-start gap-8 md:mt-10 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.25fr)]">
        {/* LEFT — tools & skills */}
        <Reveal className="order-2 lg:order-1">
          <h3 className="font-body text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">Tools &amp; skills</h3>
          <dl className="mt-4 space-y-4">
            {Object.entries(tools).map(([group, items]) => (
              <div key={group}>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-sky-edge">{group}</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {items.map((t) => (
                    <span key={t} className="rounded-full border border-sky-main/40 bg-paper px-2.5 py-1 text-[12px] text-ink-soft">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* CENTRE — laptop */}
        <Pop className="order-1 lg:order-2">
          {/* `sticker`, not `sticker-plain`: the cut-out has a real alpha channel
              (45% of the file is transparent), so the halo traces the laptop's own
              silhouette rather than boxing it. */}
          <Image src={asset("/assets/laptop.webp")} alt="An open laptop"
            width={554} height={450} sizes="(max-width: 767px) 62vw, (max-width: 1024px) 70vw, 30vw"
            className="sticker mx-auto h-auto w-full max-w-[260px] md:max-w-[420px]" />
        </Pop>

        {/* RIGHT — timeline + project squares */}
        <div className="order-3 lg:order-3">
          <Reveal>
            <h3 className="font-body text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">Work history</h3>
            <ol className="mt-4 space-y-5 border-l-2 border-sky-main/30 pl-5">
              {timeline.map((r) => (
                <li key={`${r.org}-${r.title}`} className="relative">
                  <span aria-hidden="true" className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-orange" />
                  <p className="font-mono text-[11px] uppercase tracking-wider text-sky-edge">{r.period}</p>
                  <p className="font-body text-[15px] font-bold text-ink">{r.title}</p>
                  <p className="text-[13px] font-semibold text-ink-soft">{r.org}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{r.note}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="mt-8 font-body text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">Projects</h3>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {projects.map((p) => {
                const isOpen = open === p.name;
                return (
                  <li key={p.name}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : p.name)}
                      aria-expanded={isOpen}
                      className="flex min-h-[44px] w-full flex-col items-start gap-1 rounded-xl border border-sky-main/40 bg-paper p-3 text-left transition hover:border-orange hover:shadow-[0_4px_14px_rgba(242,106,27,.22)]"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-wider text-orange">{p.tag} · {p.year}</span>
                      <span className="font-body text-[13px] font-bold leading-snug text-ink">{p.name}</span>
                    </button>
                    {isOpen && (
                      <p className="mt-2 rounded-lg bg-sky-main/10 p-3 text-[12px] leading-relaxed text-ink-soft">
                        {p.blurb}
                        {p.href && (
                          <>
                            {" "}
                            <a href={p.href} target="_blank" rel="noreferrer noopener"
                               className="font-bold text-sky-edge underline underline-offset-2">
                              Visit ↗
                            </a>
                          </>
                        )}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <h3 className="mt-8 font-body text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">Speaking</h3>
            <ul className="mt-3 space-y-2.5">
              {talks.map((t) => (
                <li key={t.title} className="text-[13px] leading-relaxed">
                  <span className="font-bold text-ink">{t.title}</span>
                  <span className="text-ink-soft">. {t.venue}, {t.year}. {t.note}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
