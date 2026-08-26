// Thin Web Audio wrapper. No dependencies. Muted by default. SSR-safe.
//
// AudioContext is created lazily on first real user gesture, never at module
// scope. One shared GainNode drives the mute toggle so muting is a single
// gain ramp rather than per-source silencing.
//
// One-shots only. There is no ambient bed: a looping pad under a portfolio
// page reads as a stuck sound rather than as atmosphere.

export type ClipName =
  | "ui-a"
  | "ui-b"
  | "ui-c"
  | "ui-d"
  | "cue"
  | "confirm";

const CLIP_SOURCES: Record<ClipName, { webm: string; mp3: string }> = {
  "ui-a": { webm: "/audio/ui-a.webm", mp3: "/audio/ui-a.mp3" },
  "ui-b": { webm: "/audio/ui-b.webm", mp3: "/audio/ui-b.mp3" },
  "ui-c": { webm: "/audio/ui-c.webm", mp3: "/audio/ui-c.mp3" },
  "ui-d": { webm: "/audio/ui-d.webm", mp3: "/audio/ui-d.mp3" },
  cue: { webm: "/audio/cue.webm", mp3: "/audio/cue.mp3" },
  confirm: { webm: "/audio/confirm.webm", mp3: "/audio/confirm.mp3" },
};

/* ── Hover variety ─────────────────────────────────────────────────────────
   One fixed hover blip on a page with this many interactive elements turns
   into a metronome. These four rotate instead.

   Shuffled rather than random: true random repeats the same clip back-to-back
   often enough to notice, which is the exact artefact the rotation exists to
   avoid. This walks a shuffled bag and reshuffles when it empties, so a clip
   can only repeat across a bag boundary — and even then the reshuffle rejects
   an order starting with the clip that just played.

   Pitch is also jittered per play (see `playVaried`), so even the repeat inside
   a bag boundary does not land identically. */
const HOVER_POOL: ClipName[] = ["ui-a", "ui-b", "ui-c", "ui-d"];

/* Per-clip trim. The source pack peaks every file at -1dBFS but its MEAN levels
   span ~14dB, so without this the denser clips read as much louder than the
   sparse ones even after loudness normalisation. */
const CLIP_GAIN: Partial<Record<ClipName, number>> = {
  "ui-a": 0.9,
  "ui-b": 1.0,
  "ui-c": 0.7,
  "ui-d": 0.8,
  cue: 0.75,
  confirm: 0.7,
};

const STORAGE_KEY = "portfolio:audio-muted";
const MASTER_GAIN = 0.6;
const MUTE_RAMP_SECONDS = 0.12;

function readStoredMuted(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true; // muted by default, no stored preference
    return raw !== "false";
  } catch {
    return true;
  }
}

function writeStoredMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(muted));
  } catch {
    // private window / storage disabled — no-op
  }
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function isCoarsePointer(): boolean {
  try {
    return window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

function canPlayType(el: HTMLAudioElement, mime: string): boolean {
  try {
    return el.canPlayType(mime) !== "";
  } catch {
    return false;
  }
}

class AudioBusImpl {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = true;
  private listeners = new Set<(muted: boolean) => void>();
  private buffers = new Map<ClipName, AudioBuffer>();
  private pendingLoads = new Map<ClipName, Promise<AudioBuffer | null>>();
  private initialized = false;

  /** Call once, from a real user gesture (pointerdown/click/keydown handler). */
  init(): void {
    if (this.initialized) {
      this.resume();
      return;
    }
    this.initialized = true;
    this.muted = readStoredMuted();

    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : MASTER_GAIN;
      this.masterGain.connect(this.ctx.destination);
      this.resume();
    } catch {
      this.ctx = null;
      this.masterGain = null;
    }
  }

  private resume(): void {
    try {
      if (this.ctx && this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
    } catch {
      // ignore
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  onMuteChange(cb: (muted: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    writeStoredMuted(muted);
    this.applyGain();
    this.listeners.forEach((cb) => cb(muted));

    if (!muted) {
      this.init();
      this.resume();
    }
  }

  toggleMuted(): void {
    this.setMuted(!this.muted);
  }

  private applyGain(): void {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const target = this.muted ? 0 : MASTER_GAIN;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(
        target,
        now + MUTE_RAMP_SECONDS,
      );
    } catch {
      // ignore
    }
  }

  private async loadBuffer(name: ClipName): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    const cached = this.buffers.get(name);
    if (cached) return cached;

    const existing = this.pendingLoads.get(name);
    if (existing) return existing;

    const promise = (async (): Promise<AudioBuffer | null> => {
      try {
        const probe = document.createElement("audio");
        const source = CLIP_SOURCES[name];
        const url = canPlayType(probe, 'audio/webm; codecs="opus"')
          ? source.webm
          : source.mp3;

        const res = await fetch(url);
        if (!res.ok) return null;
        const arrayBuffer = await res.arrayBuffer();
        if (!this.ctx) return null;
        const decoded = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(name, decoded);
        return decoded;
      } catch {
        // network failure or decode failure — no-op, never throw
        return null;
      } finally {
        this.pendingLoads.delete(name);
      }
    })();

    this.pendingLoads.set(name, promise);
    return promise;
  }

  /* Remaining clips in the current shuffled bag — see HOVER_POOL. */
  private hoverBag: ClipName[] = [];
  private lastHover: ClipName | null = null;

  private nextHoverClip(): ClipName {
    if (this.hoverBag.length === 0) {
      const bag = [...HOVER_POOL];
      // Fisher-Yates
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      /* Reject an order that would repeat the clip that just played across the
         bag boundary — the one case a plain shuffle can still stutter on. */
      if (bag.length > 1 && bag[0] === this.lastHover) {
        [bag[0], bag[1]] = [bag[1], bag[0]];
      }
      this.hoverBag = bag;
    }
    const next = this.hoverBag.pop() as ClipName;
    this.lastHover = next;
    return next;
  }

  /** One-shot hover feedback: rotates the pool and jitters pitch. */
  playHover(): void {
    if (!this.shouldPlay({ hoverTriggered: true })) return;
    this.play(this.nextHoverClip(), { hoverTriggered: true, jitter: 0.06 });
  }

  /** Preload a clip without playing it. Safe to call speculatively. */
  preload(name: ClipName): void {
    if (!this.ctx) return;
    void this.loadBuffer(name);
  }

  private shouldPlay(opts?: { hoverTriggered?: boolean }): boolean {
    if (this.muted) return false;
    if (prefersReducedMotion()) return false;
    if (opts?.hoverTriggered && isCoarsePointer()) return false;
    return true;
  }

  /** Fire-and-forget one-shot playback of a short clip. */
  play(
    name: ClipName,
    opts?: { hoverTriggered?: boolean; gain?: number; jitter?: number },
  ): void {
    if (!this.shouldPlay(opts)) return;
    if (!this.ctx || !this.masterGain) return;

    void this.loadBuffer(name).then((buffer) => {
      if (!buffer || !this.ctx || !this.masterGain) return;
      if (this.muted) return; // state may have changed while loading
      try {
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        /* A few percent of detune per play. Two identical hovers in a row are
           then not bit-identical, which is what stops a repeated clip reading
           as a stuck sound. playbackRate rather than a detune param because
           AudioBufferSourceNode.detune is not in Safari. */
        if (opts?.jitter) {
          src.playbackRate.value = 1 + (Math.random() * 2 - 1) * opts.jitter;
        }
        const gain = this.ctx.createGain();
        gain.gain.value = (opts?.gain ?? 1) * (CLIP_GAIN[name] ?? 1);
        src.connect(gain);
        gain.connect(this.masterGain);
        src.start();
      } catch {
        // ignore playback failure
      }
    });
  }


}

/** Singleton — safe to import anywhere; does nothing until init() is called. */
export const AudioBus = new AudioBusImpl();
