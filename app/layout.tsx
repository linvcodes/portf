import type { Metadata } from "next";
import { theme, about } from "@/content/site.config";
import { AudioToggle } from "@/components/AudioToggle";
import { AudioInteractions } from "@/components/AudioInteractions";
import "./globals.css";

export const metadata: Metadata = {
  title: `${about.name} — ${about.role}`,
  description:
    "Agentic systems architect in Skopje. I build the internal automation platforms and AI-assisted tooling that build the products.",
};

const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const cssVars = `:root{
  --sky-main:${theme.skyMain};
  --sky-edge:${theme.skyEdge};
  --grass:${theme.grass};
  --ink:${theme.ink};
  --ink-soft:${theme.inkSoft};
  --shadow:${theme.shadow};
  --paper:${theme.paper};
  --orange:${theme.orange};
  --scrim:${theme.scrim};
  --f-display:"CrossStitch","Comic Sans MS",cursive;
  --f-body:ui-monospace,"SFMono-Regular","Menlo","Consolas",monospace;
  --f-mono:ui-monospace,"SFMono-Regular","Menlo","Consolas",monospace;
}
@font-face{
  font-family:"CrossStitch";
  src:url("${bp}/fonts/CrossStitchCursive.woff2") format("woff2");
  font-display:swap;
  font-weight:400;
}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      {/* Overlay stack is documented in globals.css: vignette 9997, film-cast
          9998, grain 9999, cursor 10000.

          .gate-weave carries a transform, which makes it a containing block for
          any position:fixed descendant. So it wraps the PAGE CONTENT ONLY — the
          cursor and audio toggle are fixed and mount as siblings outside it,
          or they would weave along with the frame instead of staying put. */}
      <body className="grain vignette">
        <div className="film-cast">
          <div className="gate-weave">{children}</div>
        </div>
        <AudioToggle />
        <AudioInteractions />
      </body>
    </html>
  );
}
