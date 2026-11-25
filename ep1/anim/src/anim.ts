// Shared animation helpers: timing, easing, lip-sync, blinks, idle motion.
// All times are in SECONDS on the episode timeline (frame / FPS).
import {Easing, interpolate} from 'remotion';
import type {Eyes, Mouth, Pose} from './characters/Boy';
import lipsync from './generated/lipsync.json';
import timeline from './generated/timeline.json';

export const TL = timeline;
export type LineId = keyof typeof timeline.lines;
export const line = (id: LineId) => timeline.lines[id];
export const shot = (n: number) => timeline.shots.find((s) => s.id === n)!;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const EASE = Easing.inOut(Easing.cubic);

// Tween from a to b between times t0..t1 (eased, clamped).
export const tw = (t: number, t0: number, t1: number, a: number, b: number, ease = EASE) =>
  interpolate(t, [t0, t1], [a, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// Multi-key tween: keys = [[time, value], ...]
export const keys = (t: number, k: [number, number][], ease = EASE) =>
  interpolate(t, k.map((x) => x[0]), k.map((x) => x[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const backOut = Easing.out(Easing.back(1.8));

// Deterministic pseudo-random 0..1
export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Blink every 2–4 s at random (per character seed). Returns eye state override.
export const blink = (t: number, seed: number, base: Eyes = 'open'): Eyes => {
  if (base === 'closed' || base === 'happy' || base === 'sparkle') return base;
  let at = rand(seed) * 2;
  let i = 0;
  while (at < t + 1 && i < 200) {
    const d = t - at;
    if (d >= 0 && d < 0.06) return 'half';
    if (d >= 0.06 && d < 0.13) return 'closed';
    if (d >= 0.13 && d < 0.18) return 'half';
    at += 2 + rand(seed * 7 + i) * 2;
    i++;
  }
  return base;
};

const MOUTHS: Mouth[] = ['closed', 'small', 'medium', 'wide', 'O'];
// Mouth shape for a speaker during a line, null if the line isn't playing.
export const mouthFor = (t: number, id: LineId): Mouth | null => {
  const l = line(id);
  if (t < l.start || t >= l.end) return null;
  const arr = (lipsync as Record<string, number[]>)[id];
  const f = Math.floor((t - l.start) * timeline.fps);
  return MOUTHS[arr[Math.min(arr.length - 1, f)] ?? 0];
};

// Who says which lines (v09 is B and C together).
export const SPEAKS: Record<'A' | 'B' | 'C', LineId[]> = {
  A: ['v05', 'v08'],
  B: ['v01', 'v03', 'v07', 'v09'],
  C: ['v02', 'v04', 'v06', 'v09'],
};

export const talking = (t: number, who: 'A' | 'B' | 'C') => {
  for (const id of SPEAKS[who]) {
    const m = mouthFor(t, id);
    if (m) return {mouth: m, id};
  }
  return null;
};

// Idle layer for everyone on screen: breathing, blinks, small head bob when talking.
export const idle = (t: number, who: 'A' | 'B' | 'C', base: Pose = {}): Pose => {
  const seed = who === 'A' ? 11 : who === 'B' ? 23 : 37;
  const talk = talking(t, who);
  const p: Pose = {
    breath: (Math.sin(t * 2.4 + seed) + 1) / 2,
    ...base,
    eyes: blink(t, seed, base.eyes ?? 'open'),
  };
  if (talk) {
    p.mouth = talk.mouth;
    p.headY = (base.headY ?? 0) + Math.sin(t * 9 + seed) * 2.5;
    p.headTilt = (base.headTilt ?? 0) + Math.sin(t * 5.3 + seed) * 2.2;
  }
  return p;
};
