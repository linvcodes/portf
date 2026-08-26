"use client";

import { useEffect, useRef, useState } from "react";
import { coverLetter } from "@/content/site.config";

/* Frutiger Aero: glossy horizontal capsule, aqua glass over a dark track —
   same language as the hero CTA pill, just compact. */

function pickFemaleVoice(voices: SpeechSynthesisVoice[]) {
  const en = voices.filter((v) => v.lang.startsWith("en"));
  const pool = en.length ? en : voices;
  const female = /female|samantha|zira|susan|karen|victoria|aria|jenny|serena|moira|tessa|fiona|kate|salli|joanna|ivy|amy|emma/i;
  const natural = pool.find((v) => /natural|online|neural/i.test(v.name) && female.test(v.name));
  if (natural) return natural;
  const named = pool.find((v) => female.test(v.name));
  return named ?? pool[0] ?? null;
}

function getVoicesAsync(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const existing = synth.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve) => {
    synth.onvoiceschanged = () => resolve(synth.getVoices());
  });
}

export function CoverLetterPlayer() {
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const toggle = async () => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (playing) {
      synth.cancel();
      setPlaying(false);
      return;
    }

    const voices = await getVoicesAsync(synth);
    const utter = new SpeechSynthesisUtterance(coverLetter);
    const voice = pickFemaleVoice(voices);
    if (voice) utter.voice = voice;
    utter.rate = 0.85;
    utter.pitch = 1.1;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    utterRef.current = utter;
    synth.speak(utter);
    setPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Stop reading cover letter aloud" : "Read cover letter aloud"}
      className="group relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-paper transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-sky-edge active:translate-y-0"
      style={{
        background: "linear-gradient(180deg, #eaf6ff 0%, var(--sky-main) 50%, var(--sky-edge) 100%)",
        boxShadow: [
          "inset 0 2px 1px rgba(255,255,255,.95)",
          "inset 0 -3px 6px rgba(11,45,92,.5)",
          "inset 0 0 0 1px rgba(255,255,255,.35)",
          "0 6px 14px rgba(39,101,200,.35)",
        ].join(", "),
        textShadow: "0 1px 2px rgba(10,23,41,.45)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[4%] top-[8%] h-[42%] rounded-full opacity-90"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,.95) 0%, rgba(255,255,255,.25) 70%, rgba(255,255,255,0) 100%)",
        }}
      />
      {playing ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-3.5 w-3.5 shrink-0 fill-current">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-3.5 w-3.5 shrink-0 fill-current">
          <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5z" />
        </svg>
      )}
      <span className="relative">{playing ? "Stop" : "Listen to my cover letter"}</span>
    </button>
  );
}
