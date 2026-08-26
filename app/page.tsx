import { Hero } from "@/components/sections/Hero";
import { Laptop } from "@/components/sections/Laptop";
import { About } from "@/components/sections/About";
import { Bag } from "@/components/sections/Bag";
import { Footer } from "@/components/sections/Footer";
import { Services } from "@/components/sections/Services";
import { DriftingFish } from "@/components/DriftingFish";
import { ScrollCue } from "@/components/ScrollCue";

export default function Page() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Hero />
      {/* Ambient shoal drifts behind the body sections. It sits on the scrolling
          page rather than in layout's fixed overlay stack, so scroll parallax has
          something to key off. `relative` gives the -z-10 layer a containing block. */}
      <main id="main" className="relative">
        <DriftingFish />
        <Services />
        {/* Cue down into the first content section; a real anchor, not just a
            glyph. Points at #about, which now follows the services. */}
        <ScrollCue href="#about" label="Read about me" />
        <About />
        <Laptop />
        <Bag />
      </main>
      <Footer />
    </>
  );
}
