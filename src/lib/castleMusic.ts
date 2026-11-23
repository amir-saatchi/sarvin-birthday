// Procedural chiptune background music for Castle World (Web Audio, zero files).
// One original 16-bar theme, re-arranged per land: bouncy 8-bit in the garden, brass march at the
// upper castle, sleigh-bell celesta in Frozen Land, marimba + bongos in Dino Land, music box in
// My Melody & Kuromi Land. Land changes take effect on the next bar so the groove never breaks.

import { getAudioContext } from "./soundEffects";

export type CastleZone = "garden" | "castle" | "frozen" | "dino" | "sweet";

// ---------------------------------------------------------------- score
// 8 steps (eighth notes) per bar. Note = "C5", "-" = hold previous note, "." = rest.
const MELODY: string[] = [
  // A
  "G4 . C5 E5 G5 - E5 .",
  "A5 - G5 E5 C5 . D5 .",
  "F5 . A5 . C6 - A5 F5",
  "G5 - - . B4 . D5 .",
  "E5 . G5 C6 B5 - G5 .",
  "A5 . E5 . C5 D5 E5 .",
  "F5 . D5 . G5 . B4 .",
  "C5 - - . . . G4 .",
  // B
  "A4 C5 F5 . A5 . G5 F5",
  "G5 - D5 . B4 . D5 G5",
  "E5 . G5 . B5 - A5 G5",
  "A5 - - . E5 . C5 .",
  "D5 F5 A5 . F5 . D5 .",
  "B4 D5 G5 . F5 . D5 .",
  "E5 . G5 . A5 . C6 .",
  "B5 - D6 . G5 . . .",
];

// One chord per bar, or two (first half / second half)
const CHORDS: string[][] = [
  ["C"], ["Am"], ["F"], ["G"], ["C"], ["Am"], ["Dm", "G"], ["C"],
  ["F"], ["G"], ["Em"], ["Am"], ["Dm"], ["G"], ["C", "F"], ["G"],
];

const CHORD_ROOT: Record<string, number> = { C: 48, D: 50, E: 52, F: 53, G: 55, A: 57, B: 59 };
const NOTE_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function noteToMidi(n: string): number {
  const m = /^([A-G])([#b]?)(\d)$/.exec(n);
  if (!m) return 60;
  const acc = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + NOTE_PC[m[1]] + acc;
}

function chordTones(name: string): number[] {
  const root = CHORD_ROOT[name[0]];
  const minor = name.endsWith("m");
  return [root, root + (minor ? 3 : 4), root + 7];
}

type MelodyEvent = { midi: number; steps: number };
// Pre-parsed melody: per bar, per step, the note starting there (with its length in steps)
const MELODY_EVENTS: (MelodyEvent | null)[][] = (() => {
  const flat = MELODY.flatMap((bar) => bar.split(/\s+/));
  const events: (MelodyEvent | null)[] = flat.map(() => null);
  flat.forEach((tok, i) => {
    if (tok === "-" || tok === ".") return;
    let len = 1;
    while (flat[i + len] === "-") len++;
    events[i] = { midi: noteToMidi(tok), steps: len };
  });
  const bars: (MelodyEvent | null)[][] = [];
  for (let b = 0; b < MELODY.length; b++) bars.push(events.slice(b * 8, b * 8 + 8));
  return bars;
})();

// ---------------------------------------------------------------- arrangements
type LeadVoice = "pulse" | "brass" | "bell" | "marimba" | "musicbox";
type BassVoice = "triangle" | "saw" | "sine" | "logdrum";
type CompVoice = "pulse" | "brass" | "celesta" | "marimba" | "musicbox";
type Drum = "kick" | "snare" | "hat" | "sleigh" | "bongoHi" | "bongoLo" | "shaker";

interface Arrangement {
  bpm: number;
  swing: number; // 0..0.33 of a step, delays every off-beat eighth
  transpose: number; // semitones
  lead: LeadVoice;
  leadOctave: number;
  leadGain: number;
  bass: BassVoice;
  // 8 tokens: R root, 5 fifth, 3 third, 8 octave up, . rest
  bassPattern: string;
  bassGain: number;
  comp: CompVoice;
  compPattern: string; // 8 chars, x = play the chord
  compGain: number;
  drums: Partial<Record<Drum, string>>; // 8 chars per bar: x = hit, o = soft hit
}

const ARRANGEMENTS: Record<CastleZone, Arrangement> = {
  garden: {
    bpm: 138, swing: 0.14, transpose: 0,
    lead: "pulse", leadOctave: 0, leadGain: 0.085,
    bass: "triangle", bassPattern: "R . 5 . 8 . 5 .", bassGain: 0.2,
    comp: "pulse", compPattern: "..x...x.", compGain: 0.022,
    drums: { kick: "x...x...", snare: "..x...x.", hat: "oxoxoxox" },
  },
  castle: {
    bpm: 120, swing: 0, transpose: 0,
    lead: "brass", leadOctave: 0, leadGain: 0.075,
    bass: "saw", bassPattern: "R . R 5 R . R 5", bassGain: 0.11,
    comp: "brass", compPattern: "x...x...", compGain: 0.018,
    drums: { kick: "x...x...", snare: "..x.xox.", hat: "o.o.o.o." },
  },
  frozen: {
    bpm: 112, swing: 0, transpose: 2,
    lead: "bell", leadOctave: 1, leadGain: 0.07,
    bass: "sine", bassPattern: "R . . . 5 . . .", bassGain: 0.2,
    comp: "celesta", compPattern: "x.x.x.x.", compGain: 0.014,
    drums: { sleigh: "xoxoxoxo" },
  },
  dino: {
    bpm: 144, swing: 0.1, transpose: -2,
    lead: "marimba", leadOctave: 0, leadGain: 0.12,
    bass: "logdrum", bassPattern: "R . . 5 . R 5 .", bassGain: 0.26,
    comp: "marimba", compPattern: ".x...x.x", compGain: 0.03,
    drums: { bongoHi: "..x...xx", bongoLo: "x...x...", shaker: "oxoxoxox" },
  },
  sweet: {
    bpm: 126, swing: 0.2, transpose: 5,
    lead: "musicbox", leadOctave: 0, leadGain: 0.1,
    bass: "triangle", bassPattern: "R . 5 . 3 . 5 .", bassGain: 0.16,
    comp: "musicbox", compPattern: "..x...x.", compGain: 0.02,
    drums: { hat: "..o...o.", shaker: "oxoxoxox" },
  },
};

const MASTER_VOLUME = 0.5;
const LOOKAHEAD = 0.14; // seconds of audio scheduled ahead
const TICK_MS = 25;

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// ---------------------------------------------------------------- engine
export class CastleMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private pulseWave: PeriodicWave | null = null;
  private timer: number | null = null;
  private step = 0; // global eighth-note counter
  private nextTime = 0;
  private zone: CastleZone = "garden";
  private pendingZone: CastleZone = "garden";
  private tempoScale = 1;

  start(zone: CastleZone = "garden") {
    if (this.timer !== null) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    this.ctx = ctx;
    this.zone = this.pendingZone = zone;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(MASTER_VOLUME, ctx.currentTime + 0.8);
    master.connect(comp);
    comp.connect(ctx.destination);
    this.master = master;

    // 25% pulse wave: the classic thin, nasal 8-bit lead
    const n = 32;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    this.pulseWave = ctx.createPeriodicWave(real, imag);

    const len = Math.floor(ctx.sampleRate * 0.5);
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.step = 0;
    this.nextTime = ctx.currentTime + 0.12;
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    const { ctx, master } = this;
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      window.setTimeout(() => master.disconnect(), 600);
    }
    this.master = null;
  }

  /** Switch arrangement; applied at the start of the next bar. */
  setZone(zone: CastleZone) {
    this.pendingZone = zone;
  }

  /** A little faster when only one star is left. */
  setUrgent(urgent: boolean) {
    this.tempoScale = urgent ? 1.08 : 1;
  }

  /** Let a fanfare play over silence, then start the theme again from bar 1. */
  restartAfter(seconds: number) {
    if (!this.ctx) return;
    this.step = 0;
    this.nextTime = Math.max(this.nextTime, this.ctx.currentTime + seconds);
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    // Throttled background tab: drop the missed notes instead of playing them all at once
    if (this.nextTime < ctx.currentTime - 0.05) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      if (this.step % 8 === 0) this.zone = this.pendingZone;
      const arr = ARRANGEMENTS[this.zone];
      const stepDur = 60 / (arr.bpm * this.tempoScale) / 2;
      const swingDelay = this.step % 2 === 1 ? arr.swing * stepDur : 0;
      this.scheduleStep(arr, this.step, this.nextTime + swingDelay, stepDur);
      this.nextTime += stepDur;
      this.step++;
    }
  }

  private scheduleStep(arr: Arrangement, step: number, t: number, stepDur: number) {
    const bar = Math.floor(step / 8) % MELODY.length;
    const s = step % 8;
    const chords = CHORDS[bar];
    const chord = chordTones(chords[s < 4 ? 0 : chords.length - 1]).map((m) => m + arr.transpose);

    // Lead
    const ev = MELODY_EVENTS[bar][s];
    if (ev) {
      const midi = ev.midi + arr.transpose + arr.leadOctave * 12;
      this.lead(arr.lead, mtof(midi), t, ev.steps * stepDur, arr.leadGain);
    }

    // Bass
    const bt = arr.bassPattern.split(" ")[s];
    if (bt && bt !== ".") {
      const off = bt === "5" ? 7 : bt === "3" ? chord[1] - chord[0] : bt === "8" ? 12 : 0;
      this.bass(arr.bass, mtof(chord[0] - 12 + off), t, stepDur * 1.6, arr.bassGain);
    }

    // Chord comp
    if (arr.compPattern[s] === "x") {
      for (const m of chord) this.comp(arr.comp, mtof(m + 12), t, stepDur, arr.compGain);
    }

    // Drums
    for (const [drum, pattern] of Object.entries(arr.drums) as [Drum, string][]) {
      const c = pattern[s];
      if (c === "x" || c === "o") this.drum(drum, t, c === "x" ? 1 : 0.55);
    }
  }

  // ---------------------------------------------------------------- voices
  private env(g: GainNode, t: number, peak: number, attack: number, hold: number, release: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    return t + attack + hold + release + 0.02;
  }

  private osc(type: OscillatorType | "pulse", freq: number, t: number, end: number, out: AudioNode) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    if (type === "pulse" && this.pulseWave) o.setPeriodicWave(this.pulseWave);
    else o.type = type === "pulse" ? "square" : type;
    o.frequency.setValueAtTime(freq, t);
    o.connect(out);
    o.start(t);
    o.stop(end);
    return o;
  }

  private gain(out: AudioNode = this.master!) {
    const g = this.ctx!.createGain();
    g.connect(out);
    return g;
  }

  // A tone that decays on its own (bells, marimba, music box)
  private ping(type: OscillatorType, freq: number, t: number, peak: number, decay: number) {
    const g = this.gain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    this.osc(type, freq, t, t + decay + 0.02, g);
  }

  private lead(voice: LeadVoice, f: number, t: number, dur: number, peak: number) {
    switch (voice) {
      case "pulse": {
        const g = this.gain();
        const end = this.env(g, t, peak, 0.006, Math.max(dur * 0.82 - 0.006, 0.02), 0.05);
        const o = this.osc("pulse", f, t, end, g);
        // Gentle delayed vibrato on long notes
        if (dur > 0.3) {
          const lfo = this.ctx!.createOscillator();
          const depth = this.ctx!.createGain();
          lfo.frequency.value = 6;
          depth.gain.setValueAtTime(0, t);
          depth.gain.linearRampToValueAtTime(f * 0.012, t + dur * 0.6);
          lfo.connect(depth);
          depth.connect(o.frequency);
          lfo.start(t);
          lfo.stop(end);
        }
        break;
      }
      case "brass": {
        const ctx = this.ctx!;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(700, t);
        lp.frequency.exponentialRampToValueAtTime(2600, t + 0.05);
        lp.frequency.exponentialRampToValueAtTime(1500, t + 0.25);
        const g = this.gain();
        lp.connect(g);
        const end = this.env(g, t, peak, 0.02, Math.max(dur * 0.85 - 0.02, 0.02), 0.07);
        this.osc("sawtooth", f, t, end, lp);
        this.osc("sawtooth", f * 1.004, t, end, lp);
        break;
      }
      case "bell":
        this.ping("sine", f, t, peak, 1.1 + dur);
        this.ping("sine", f * 2.76, t, peak * 0.35, 0.35);
        this.ping("sine", f * 5.4, t, peak * 0.12, 0.12);
        break;
      case "marimba":
        this.ping("sine", f, t, peak, 0.42);
        this.ping("sine", f * 4, t, peak * 0.3, 0.06);
        break;
      case "musicbox":
        this.ping("triangle", f, t, peak, 0.6 + dur * 0.6);
        this.ping("sine", f * 2, t, peak * 0.3, 0.25);
        break;
    }
  }

  private bass(voice: BassVoice, f: number, t: number, dur: number, peak: number) {
    switch (voice) {
      case "triangle":
      case "sine": {
        const g = this.gain();
        const end = this.env(g, t, peak, 0.005, dur * 0.75, 0.1);
        this.osc(voice, f, t, end, g);
        break;
      }
      case "saw": {
        const lp = this.ctx!.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 520;
        const g = this.gain();
        lp.connect(g);
        const end = this.env(g, t, peak, 0.008, dur * 0.5, 0.06);
        this.osc("sawtooth", f, t, end, lp);
        break;
      }
      case "logdrum": {
        const g = this.gain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        const o = this.osc("sine", f * 1.5, t, t + 0.34, g);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.035);
        break;
      }
    }
  }

  private comp(voice: CompVoice, f: number, t: number, stepDur: number, peak: number) {
    switch (voice) {
      case "pulse": {
        const g = this.gain();
        const end = this.env(g, t, peak, 0.004, stepDur * 0.35, 0.04);
        this.osc("pulse", f, t, end, g);
        break;
      }
      case "brass": {
        const lp = this.ctx!.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 1200;
        const g = this.gain();
        lp.connect(g);
        const end = this.env(g, t, peak, 0.03, stepDur * 2.2, 0.15);
        this.osc("sawtooth", f, t, end, lp);
        break;
      }
      case "celesta":
        this.ping("sine", f * 2, t, peak, 0.5);
        break;
      case "marimba":
        this.ping("sine", f, t, peak, 0.18);
        break;
      case "musicbox":
        this.ping("triangle", f * 2, t, peak, 0.4);
        break;
    }
  }

  private noiseHit(t: number, filter: BiquadFilterType, freq: number, peak: number, decay: number, q = 1) {
    const ctx = this.ctx!;
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = filter;
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = this.gain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    src.connect(bp);
    bp.connect(g);
    // Random start so repeated hits don't sound identical
    src.start(t, Math.random() * 0.3, decay + 0.02);
  }

  private drum(drum: Drum, t: number, vel: number) {
    switch (drum) {
      case "kick": {
        const g = this.gain();
        g.gain.setValueAtTime(0.32 * vel, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        const o = this.osc("sine", 150, t, t + 0.18, g);
        o.frequency.exponentialRampToValueAtTime(45, t + 0.11);
        break;
      }
      case "snare":
        this.noiseHit(t, "bandpass", 1900, 0.13 * vel, 0.12, 0.8);
        this.ping("triangle", 190, t, 0.05 * vel, 0.07);
        break;
      case "hat":
        this.noiseHit(t, "highpass", 8000, 0.05 * vel, 0.035);
        break;
      case "shaker":
        this.noiseHit(t, "highpass", 6000, 0.035 * vel, 0.06);
        break;
      case "sleigh":
        this.noiseHit(t, "bandpass", 9000, 0.06 * vel, 0.09, 4);
        this.noiseHit(t + 0.02, "bandpass", 7200, 0.035 * vel, 0.07, 4);
        break;
      case "bongoHi":
      case "bongoLo": {
        const f = drum === "bongoHi" ? 340 : 230;
        const g = this.gain();
        g.gain.setValueAtTime(0.14 * vel, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        const o = this.osc("sine", f * 1.25, t, t + 0.15, g);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.02);
        break;
      }
    }
  }
}

/** Which land's arrangement to play for a player position (bridges switch halfway across). */
export function castleZoneAt(x: number, z: number): CastleZone {
  if (Math.abs(x) > 1e5) return "garden"; // player position not known yet
  // Castle first: the grand castle (z < -20.7) is nearly as wide as the gaps to Frozen/Dino Land
  if (z < -20.7) return "castle";
  if (x < -23.5) return "frozen";
  if (x > 23.5) return "dino";
  if (z > 24) return "sweet";
  return "garden";
}
