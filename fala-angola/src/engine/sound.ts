// All sound effects are synthesised with the Web Audio API, so the app ships no
// audio files for them and works on slow connections. Recorded voices and music
// beds are separate (see speech.ts and docs/assets.md).

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
  if (m) stopBeat();
}

function ac() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.18) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.05);
}

function noise(start: number, dur: number, gain = 0.08, hp = 6000) {
  const a = ac();
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  const g = a.createGain();
  f.type = "highpass";
  f.frequency.value = hp;
  g.gain.value = gain;
  src.buffer = buf;
  src.connect(f).connect(g).connect(a.destination);
  src.start(a.currentTime + start);
}

function kick(start: number) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  const t = a.currentTime + start;
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 0.25);
}

export const sfx = {
  tap: () => !muted && tone(660, 0, 0.05, "triangle", 0.08),
  correct: () => {
    if (muted) return;
    tone(523, 0, 0.12, "triangle");
    tone(784, 0.09, 0.2, "triangle");
  },
  wrong: () => {
    if (muted) return;
    tone(196, 0, 0.18, "sawtooth", 0.08);
    tone(147, 0.12, 0.22, "sawtooth", 0.08);
  },
  coin: () => {
    if (muted) return;
    tone(988, 0, 0.08, "square", 0.06);
    tone(1319, 0.07, 0.18, "square", 0.06);
  },
  tick: () => !muted && noise(0, 0.03, 0.05, 8000),
  win: () => {
    if (muted) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, "triangle", 0.15));
    kick(0);
    kick(0.44);
  },
};

// A short kuduro-style loop for game rounds: kick on every beat, shaker on the off-beats.
let beatTimer: number | null = null;
export function startBeat(bpm = 128) {
  if (muted || beatTimer !== null) return;
  const beat = 60 / bpm;
  const bar = () => {
    for (let i = 0; i < 4; i++) {
      kick(i * beat);
      noise(i * beat + beat / 2, 0.05, 0.04);
      if (i % 2 === 1) noise(i * beat, 0.08, 0.06, 2500);
    }
  };
  bar();
  beatTimer = window.setInterval(bar, beat * 4 * 1000);
}

export function stopBeat() {
  if (beatTimer !== null) window.clearInterval(beatTimer);
  beatTimer = null;
}
