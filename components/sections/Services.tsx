import { Reveal } from "@/lib/motion/Reveal";
import { services } from "@/content/site.config";

export function Services() {
  return (
    <section id="services" aria-labelledby="services-h" className="mx-auto w-full max-w-[1200px] px-5 pb-6 pt-14 md:px-10 md:pb-8 md:pt-20">
      <Reveal onLoad>
        <h2 id="services-h" className="text-balance text-center font-body text-[1.6rem] font-bold leading-tight text-ink md:text-3xl">
          What I can do for you
        </h2>
      </Reveal>
      <ul className="relative isolate mt-6 grid gap-3.5 md:mt-5 md:grid-cols-3 md:gap-4">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={0.25 + i * 0.09} onLoad>
            <li className="relative h-full list-none rounded-2xl border border-sky-main/35 bg-paper p-4 md:p-5 shadow-[0_2px_16px_rgba(39,101,200,.10)]">
              <h3 className="font-body text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
