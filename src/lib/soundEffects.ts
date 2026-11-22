// Lightweight Web Audio API sound effects (zero external files, instant playback)

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

export function playPopSound(pitchMultiplier = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(340 * pitchMultiplier, now);
  osc.frequency.exponentialRampToValueAtTime(980 * pitchMultiplier, now + 0.08);

  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.13);
}

export function playSparkleSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0.001, now + idx * 0.06);
    gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.26);
  });
}

export function playCandleBlowSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Soft whoosh + chime
  const bufferSize = ctx.sampleRate * 0.18;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);

  // Tiny fairy bell after blow
  const osc = ctx.createOscillator();
  const bellGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now + 0.06);
  bellGain.gain.setValueAtTime(0.12, now + 0.06);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc.connect(bellGain);
  bellGain.connect(ctx.destination);
  osc.start(now + 0.06);
  osc.stop(now + 0.36);
}

export function playVictoryFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const melody = [
    { freq: 523.25, time: 0, dur: 0.14 },
    { freq: 659.25, time: 0.13, dur: 0.14 },
    { freq: 783.99, time: 0.26, dur: 0.14 },
    { freq: 1046.5, time: 0.4, dur: 0.42 },
  ];
  const now = ctx.currentTime;

  melody.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(n.freq, now + n.time);

    gain.gain.setValueAtTime(0.001, now + n.time);
    gain.gain.linearRampToValueAtTime(0.2, now + n.time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur + 0.02);
  });
}
