import type { Metadata } from "next";
import { about, hero, timeline } from "@/content/site.config";
import { PrintButton } from "./PrintButton";
import { Calibrate } from "./Calibrate";
import "./card.css";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: `${about.name} — Business card`,
  description: "Printable business card.",
  robots: { index: false, follow: false },
};

/* Printable business card, two faces, one per page.

   Sizing lives entirely in card.css and is expressed in inches: 3.5x2 trim,
   0.125in bleed, 0.125in safe margin. Print to PDF at 100% scale with margins
   set to None, and the result is press-ready.

   Content is pulled from site.config so the card cannot drift out of sync with
   the site. Nothing here is authored twice. */

/* Printed without the scheme, the way a card would show it. */
const LINKEDIN_LABEL = about.linkedin.replace(/^https:\/\/(www\.)?/, "");

/* One word each, and deliberately none of them repeats a word already used in
   the title or talks above ("architect", "AI", "system", "automation" are all
   spent). No languages or frameworks: syntax is table stakes now. These name the
   judgement that is actually scarce and that the history on this card evidences. */
const KEY_SKILLS = [
  "Scale",
  "Security",
  "Reliability",
  "Orchestration",
  "Infrastructure",
  "Leadership",
  /* Concrete tooling after the judgement words: short enough to sit in the same
     row without competing, and they answer the "but what do you actually run"
     question the one-word tags invite. */
  "AWS",
  "Docker",
  "CI/CD",
  "Node",
  "Python",
  "WebGL",
] as const;

/* The joke, broken into pills like the real skills so it sits in the same rhythm
   instead of reading as a footnote. Anyone still reading the back of a business
   card has earned it. */
const CHEEKY_SKILLS = [
  "do people even read these?",
  "10 yrs XP · marketing / design / dev",
] as const;

export default function CardPage() {
  /* The two CrazyLabs rows in `timeline` are one continuous run at the same
     company, and spelling both out on a card wastes a line restating the
     employer. They collapse into the senior title over the full span; the
     founder role follows it. Both are derived from `timeline` rather than
     retyped, so titles and dates keep tracking the site. */
  const crazylabs = timeline.filter((r) => r.org === "CrazyLabs");
  const roles = [
    {
      org: "CrazyLabs",
      /* The site's full title runs 55 characters, which wraps to three lines in
         this column. The card carries the shorter form; the site keeps the long
         one. This is the only string on the card not taken verbatim from config. */
      title: "System Architect · Interactive AdTech",
      /* End date is stated on the card rather than "Present". The site's
         `timeline` still says Present, so this is deliberately not derived. */
      period: `${crazylabs[crazylabs.length - 1]?.period.split(" — ")[0] ?? ""} — Oct 2026`,
    },
    ...timeline
      .filter((r) => r.org === "LINV Design Studio")
      .map((r) => ({ org: r.org, title: r.title, period: r.period })),
  ];

  return (
    <div className="card-stage">
      <div className="card-toolbar">
        <PrintButton />
        <p className="card-hint">
          One PNG per face at <strong>85&times;55mm / 300dpi</strong> (1004&times;650px), exported
          exactly as framed &mdash; no bleed added. Type is rasterised into the image, so no font
          or layout can shift at the printer. Send both files as-is and ask for
          <strong> no scaling</strong>.
        </p>
      </div>

      <Calibrate />

      {/* ── FRONT: the site's hero, at card scale ─────────────────────────────
          Same layer order as Hero.tsx, so the card reads as the site in the hand:
          sky, clouds, headline behind the grass, grass at the horizon, "with ai?"
          in front of it, then the figure reaching out over everything. */}
      <div className="card-sheet">
        <article className="card card-face-front" aria-label="Business card, front">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/assets/clouds.webp")} alt="" className="card-clouds" aria-hidden="true" />

          <p className="card-headline">{hero.line1}</p>
          <div
            className="card-grass"
            aria-hidden="true"
            style={{ "--grass-img": `url("${asset("/assets/hero-grass.webp")}")` } as React.CSSProperties}
          />
          <p className="card-headline-2">{hero.line2}</p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/assets/me-hero.webp")}
            alt={`${about.name} on a payphone, reaching a hand toward the viewer`}
            className="card-figure"
          />

          <div className="card-idblock">
            <p className="card-name">{about.name}</p>
            <p className="card-role">{about.role}</p>
          </div>

          <div className="card-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/assets/qr-site.svg")} alt={`QR code linking to ${about.name}'s portfolio site`} />
          </div>
        </article>
      </div>

      {/* ── BACK: the "What's on my laptop" section, at card scale ────────── */}
      <div className="card-sheet">
        <article className="card card-face-back" aria-label="Business card, back">
          <div className="card-inner">
            <div className="card-back-cols">
              {/* LEFT — the laptop with the section label stacked under it, both
                  sized to the same column width so the label costs no extra row */}
              <div className="card-laptop-cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset("/assets/laptop.webp")} alt="" className="card-laptop" aria-hidden="true" />
                <p className="card-back-label">What&apos;s on my laptop</p>
              </div>

              {/* RIGHT — history, speaking, then the skills that carry weight */}
              <div>
                <ul className="card-list">
                  {roles.map((r) => (
                    <li key={`${r.org}-${r.title}`}>
                      <strong>{r.title}</strong>
                      <span>
                        {r.org}, {r.period}
                      </span>
                    </li>
                  ))}
                </ul>

                <ul className="card-tags">
                  {KEY_SKILLS.map((k) => (
                    <li className="card-tag" key={k}>
                      {k}
                    </li>
                  ))}
                  {CHEEKY_SKILLS.map((k) => (
                    <li className="card-tag card-tag--wink" key={k}>
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* The only contact detail on either face besides the QR. */}
            <p className="card-back-link">{LINKEDIN_LABEL}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
