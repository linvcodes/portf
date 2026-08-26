import Image from "next/image";
import { about } from "@/content/site.config";
import { asset } from "@/lib/asset";

/* Footer reads as the closing plate of the scene rather than a utility strip:
   the same sky the hero opens on, a thin cloud band at the top, a low grass line
   at the bottom, and the contact block sitting straight on the sky.

   Deliberately compact. There is no panel or card wrapping the content, because
   a container here only added height without adding meaning. Frutiger Aero comes
   from the glossy pill button and the sky gradient alone. No bubble field, no
   grass wall, no copyright line. */

export function Footer() {
  return (
    <footer
      id="contact"
      aria-labelledby="contact-h"
      className="relative isolate mt-6 overflow-hidden pt-10 md:pt-12"
      style={{ background: "radial-gradient(120% 130% at 50% 100%, var(--sky-main) 0%, var(--sky-edge) 100%)" }}
    >
      {/* thin cloud band along the top edge, softening the join from the page above */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[56px] overflow-hidden">
        <Image
          src={asset("/assets/clouds.webp")} alt="" width={2400} height={1065} sizes="70vw" loading="lazy"
          className="fuji-pro-400h absolute left-0 top-0 max-w-none opacity-70"
          style={{ height: 56, width: `calc(56px * ${5000 / 2219})` }}
        />
        <Image
          src={asset("/assets/clouds.webp")} alt="" width={2400} height={1065} sizes="70vw" loading="lazy"
          className="fuji-pro-400h absolute right-0 top-0 max-w-none -scale-x-100 opacity-70"
          style={{ height: 56, width: `calc(56px * ${5000 / 2219})` }}
        />
      </div>

      {/* one small fish, tucked into the upper left */}
      <Image
        src={asset("/assets/goldfish-c.webp")} alt="" width={350} height={350} loading="lazy"
        sizes="(max-width: 767px) 10vw, 7vw"
        className="sticker pointer-events-none absolute left-[7%] top-[14%] z-0 w-[10vw] max-w-[44px] -scale-x-100"
      />

      {/* No card, no panel: the content sits straight on the sky. One centred
          column, tight vertical rhythm, everything on one or two lines. */}
      <div className="relative z-10 mx-auto flex w-full max-w-[640px] flex-col items-center px-5 pb-12 text-center md:px-10 md:pb-20">
        <h2 id="contact-h" className="m-0 font-display text-[1.9rem] leading-tight text-paper text-pop md:text-4xl">
          Let&apos;s build something
        </h2>
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper/85">
          Speaking · Consulting · Development
        </p>

        <div className="mt-5 flex justify-center">
          {/* glossy lozenge, same surface language as the hero CTA */}
          <a
            href={about.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${about.name} on LinkedIn (opens in a new tab)`}
            data-sfx="confirm"
            className="group relative inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-8 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-paper transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-paper"
            style={{
              background: "linear-gradient(180deg, #6fb7ec 0%, var(--sky-main) 46%, var(--sky-edge) 100%)",
              boxShadow: [
                "inset 0 2px 1px rgba(255,255,255,.95)",
                "inset 0 -3px 8px rgba(11,45,92,.55)",
                "inset 0 0 0 1px rgba(255,255,255,.32)",
                "0 10px 26px rgba(39,101,200,.42)",
                "0 2px 5px rgba(10,23,41,.25)",
              ].join(", "),
              textShadow: "0 1px 2px rgba(10,23,41,.45)",
            }}
          >
            {/* specular sweep — upper half only, so the lozenge reads as glass */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[3%] top-[5%] h-[42%] rounded-full opacity-90"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.28) 62%, rgba(255,255,255,0) 100%)",
              }}
            />
            <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-4 w-4 shrink-0 fill-current">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
            </svg>
            <span className="relative">LinkedIn</span>
          </a>
        </div>

      </div>

      {/* low grass line at the very bottom, roughly half the previous height, so it
          reads as a horizon the page settles onto rather than a wall */}
      <div
        aria-hidden="true"
        className="fuji-pro-400h pointer-events-none absolute inset-x-0 bottom-0 z-0"
        style={{
          height: 38,
          backgroundImage: `url("${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/assets/footer-grass-tile.webp")`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "left bottom",
          backgroundSize: "auto 38px",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.75) 50%, rgba(0,0,0,1) 85%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.75) 50%, rgba(0,0,0,1) 85%)",
        }}
      />
    </footer>
  );
}
