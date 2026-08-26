export const theme = {
  skyMain: "#488ec9",
  skyEdge: "#2765c8",
  grass: "#4f8f2f",
  ink: "#0a1729",
  inkSoft: "#41597a",
  shadow: "#5c7ba6",
  paper: "#ffffff",
  orange: "#f26a1b",
  scrim: "rgba(255,255,255,0.62)",
} as const;

/* Motion vocabulary — all four tiers decoded from the source .fig, so every curve
   on the site is one the template actually used. No component defines its own
   duration or easing; a grep for `duration:` outside this file should only ever
   turn up motionSpec references. That single rule is what keeps the site reading
   as one orchestrated piece instead of a pile of separate effects. */
export const motionSpec = {
  doors:     { duration: 2.0, ease: [1.0, 0.01, 0.02, 1.0] as const },
  secondary: { duration: 1.0, ease: [0.4037, -0.0259, 0.0, 0.9886] as const },
  pop:       { duration: 1.0, ease: [1.0, -0.0296, 0.0, 1.0946] as const },
  /* 0.25s tier — 10 transitions in the fig use it, and nothing in the site did.
     This is the feedback register: hover, tap, cursor morph. Fast enough to feel
     like a response rather than an animation. */
  micro:     { duration: 0.25, ease: [0.4037, -0.0259, 0.0, 0.9886] as const },
  /* 3.0s tier — the fig's slowest. Ambient, never triggered: gate weave, widget
     drift, anything that should read as the scene breathing rather than reacting. */
  drift:     { duration: 3.0, ease: "easeInOut" as const },
  /* Parallax travel in px, ordered by depth. A layer's speed must rise
     monotonically with its z-index or the depth cue inverts. Text layers are
     interleaved at the depth they actually sit: headline is behind the grass,
     "with ai?" is in front of it, credentials sit nearest of the flat layers. */
  parallax:  { sky: 10, headline: 16, mid: 22, tagline: 30, badges: 38, fish: 46, figure: 60 },
} as const;

export const hero = {
  line1: "How do I do this",
  line2: "with ai?",
  /* The hero pitch, played as a call-us ad gag: she is already on the phone in
     the cut-out, so the line reads as the punchline to that image. */
  pitchLead: "Don't know what to do with AI?",
  pitchCall: "Call Linv!",
  cta: "Reach me here",
  /* CRT bezel labels — rendered vertically down the panel's left and right edges */
  badges: [
    { label: "Dev & Security", since: "2012" },
    { label: "AI & Stable Diffusion", since: "2019" },
  ],
} as const;

export const services = [
  { title: "Speaking & Knowledge Sharing",
    body: "Talks and hands-on workshops for teams and conferences. A live zero-to-launch build for 200+ attendees, a 6-hour WebGL workshop, guest lecturing on scaling with AI." },
  { title: "Consulting",
    body: "Where AI actually pays off in your stack, and where it does not. Agent architecture, workflow automation and prompt-injection screening, scoped so the answer survives contact with a real codebase." },
  { title: "Development",
    body: "Full-stack builds end to end: agentic tooling, internal platforms and interactive web. 80+ shipped interactive experiences, plus automation across a 200+ repo estate." },
] as const;

export const tools = {
  Languages: ["TypeScript", "JavaScript", "Python", "SQL"],
  Frontend: ["React", "Next.js", "Three.js", "PixiJS", "HTML/CSS"],
  Backend: ["Node.js", "Express", "PostgreSQL", "Supabase"],
  Infra: ["AWS", "Docker", "CI/CD", "Git"],
  AI: ["Multi-agent architecture", "LLM workflow automation", "Prompt-injection screening", "Scraping & data pipelines"],
} as const;

export type Role = {
  org: string; title: string; period: string; note: string;
};

export const timeline: Role[] = [
  { org: "CrazyLabs", title: "Interactive AdTech Expert · System Architect & Lead Dev",
    period: "May 2025 — Present",
    note: "Revived a dead ad channel into a high-conversion company asset. Automation and multi-agent tooling across 200+ repos." },
  { org: "CrazyLabs", title: "Playable Ads Developer",
    period: "May 2023 — Present",
    note: "80+ interactive ad experiences in JavaScript, WebGL and PixiJS. Framework modules, QA standards, build automation." },
  { org: "LINV Design Studio", title: "Founder",
    period: "2016 — Present",
    note: "Independent studio: UI/UX systems, automation consulting and product design for international clients." },
  { org: "EESTEC LC Skopje", title: "Contact Person · PR & IT",
    period: "2021 — 2023",
    note: "Main link between the European board and a 400-member committee. Built an email template generator still in use today." },
];

export type Project = {
  name: string; blurb: string; year: string; href?: string; tag: string;
};

export const projects: Project[] = [
  { name: "Clutterly", tag: "Product", year: "2024",
    blurb: "Reads a household's clutter and energy level, builds a task list, and maps local donation centres by what people actually discard. Research, design, architecture, build and security, all solo." },
  { name: "Soulmental.org", tag: "Client", year: "2023", href: "https://soulmental.org",
    blurb: "Webshop with orders, blog and about pages for a well-known local music producer group." },
  { name: "Liber8tech.org", tag: "Client", year: "2023", href: "https://liber8tech.org",
    blurb: "Technical writing and news blog." },
  { name: "Reskin Tool", tag: "Internal", year: "2025",
    blurb: "Web-based reskinning tool for AI-driven asset editing on playable ad builds." },
  { name: "Three.js Playable Template", tag: "Internal", year: "2025",
    blurb: "Unity-like no-code builder with an AI 'playable brain' guiding architectural decisions via Claude." },
  { name: "Email Template Generator", tag: "Internal", year: "2022",
    blurb: "Let non-technical members build branded newsletters without touching code." },
];

export const talks = [
  { title: "Building Software Without Coding: Idea to Launch", venue: "Crazy For AI 2", year: "2026", note: "200+ attendees, live zero-to-launch demo." },
  { title: "MVPs, Scaling and Marketing with AI", venue: "FINKI Entrepreneurship course", year: "2025", note: "Guest lecturer, scouted directly by a professor." },
  { title: "Game Development in Three.js", venue: "Base42 / EESTEC", year: "2023", note: "6-hour hands-on WebGL workshop." },
];

export const about = {
  name: "Kristina Mladenova",
  role: "Agentic Systems Architect",
  location: "Skopje, North Macedonia",
  email: "linv.codes@gmail.com",
  linkedin: "https://www.linkedin.com/in/kmladenova",
  bio: [
    "I've spent the past few years building little universes in code, and lately, building the builders.",
    "I started in graphic design and billboards, then found that every creative act is a system waiting to be automated, and that well-engineered beauty scales better.",
    "At this point you're not really hiring one person. You're hiring my lovingly curated team of AI agents, and I just happen to be their slightly overprotective systems architect.",
  ],
} as const;

/** Bag is the centrepiece of the About stage, not an item — kept out of this list. */
export const bagLabel = "What\u2019s in my bag";

export const interests = [
  { id: "camera",    src: "/assets/camera.webp",     label: "Olympus OM-D + Zenit glass",  note: "Vintage lenses, screw-on filters, film habits in a digital body." },
  { id: "chihuahua", src: "/assets/chihuahua.webp",  label: "My chihuahua",                note: "Chief morale officer. Very well paid." },
  /* Third entry so the two flanking columns split 3/3 rather than 2/3. */
  { id: "lighter",   src: "/assets/lighter.webp",    label: "A lighter",                   note: "Sealing paracord, shrink tubing, birthday candles at 11pm — and yes, cigarettes." },
  { id: "cyberdeck", src: "/assets/cyberdeck.webp", label: "LilyGO T-Deck & LoRa",        note: "Cyberdecks, mesh radio, and small screens that shouldn't work but do." },
  { id: "chainmail", src: "/assets/chainmail.webp",  label: "Chainmail & solder jewellery",note: "European 4-in-1, stained glass, a lot of jump rings." },
  { id: "sewing",    src: "/assets/sewing.webp",     label: "Sewing",                      note: "Because a system you can wear is still a system." },
];

export const astro = [
  { sign: "Libra",       role: "Sun" },
  { sign: "Virgo",       role: "Moon" },
  { sign: "Scorpio",     role: "Venus" },
  { sign: "Sagittarius", role: "Rising" },
] as const;

export const fontCredit = {
  text: "Display face: Cross Stitch Cursive, Web Font Free, CC BY 4.0",
  href: "http://www.webfontfree.com",
} as const;

export const coverLetter = `Once upon a time in a land far away, in always-sunny Skopje, in the wake of the new milenium dotcom craze, there was a little girl who saw the world in Technicolor. She much preferred the visual language of moving symbolism over words. If a picture can replace a thousand words, how many can we replace if that image can move? That pivotal question marked the beginning of a designer who wanted to create worlds rather than merely describe them. The answer to the question was simple, Code. Code can make symbols move and tell an interactive visual story where both the creator and the viewer create the final moving picture.

I've created visual languages, designed billboards and brands, and operated my own visual studio, LINV. I gradually came to understand that every creative act is a system that is just waiting to be automated. I discovered that well-engineered beauty scales better. My start was humble, with HTML based websites and clever Python bots and automation scripts. Simplicity is key, and often lacking in todays tech-first world where the new framework is king. A new robust technical skillset emerged, while the drive and child-like wonder towards visually told stories remained.

I was raised to lead by example, to take initiative, and to offer help in the form of a lovingly engineered skillset that's hard to ignore. Quiet overachievers often get overlooked as sometimes the enthusiastic smile doesn't match the expected image of an "industry-hardened" senior. But I've been building since my teens: not to be a company asset, but a company weapon (in the best way) and deliver quality beyond industry standards. This path has led me to a number of interesting opportunities, to mentor, to lead, to improve user experience, and I took every single one of them.

I've spent the past few years building little universes in code, and lately, building the builders. At CrazyLabs, I lead the architecture behind internal automation platforms and AI-assisted tooling, designing multi-agent workflows that generate, localize, validate, and ship production-ready code with minimal human intervention. My focus is on scalable systems, reliable pipelines, and tools that make complex engineering feel effortless.

Because at this point, you're not really hiring one person, you're hiring my lovingly curated team of AI agents, and I just happen to be their slightly overprotective systems architect.

Now I'm looking for the next world to build, a place where design meets data, where AI helps creation instead of replacing it, where imagination still has a compiler.

Thank you for reading my story. If it resonated, maybe we're building the same kind of universe.

With love and coffee from always-sunny Skopje, Kristina Mladenova.`;
