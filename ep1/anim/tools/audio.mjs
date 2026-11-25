// Builds the soundtrack from the timeline. Run after prepare.mjs:  node tools/audio.mjs
//  - voices: ep1/voices/*.mp3 placed at their timeline start
//  - music : ep1/music/bgm.mp3 if present, else a code-made upbeat 2-chord loop (placeholder)
//            loud in shots 1-2, ducked to ~20% while anyone speaks, 2 s fade-out at the end
//  - sfx   : synthesised in code (whoosh, skid, sting, ding, ting, pop, rustle, taps, keys)
// Writes public/audio/{mix,voices,music,sfx}.wav and copies the stems to ep1/out/audio/.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ANIM = path.resolve(HERE, '..');
const EP = path.resolve(ANIM, '..');
const TL = JSON.parse(fs.readFileSync(path.join(ANIM, 'src/generated/timeline.json'), 'utf8'));
const SR = 44100;
const N = Math.ceil((TL.total + 0.05) * SR);
const outPub = path.join(ANIM, 'public/audio');
const outStems = path.join(EP, 'out/audio');
fs.mkdirSync(outPub, {recursive: true});
fs.mkdirSync(outStems, {recursive: true});

// ---------- helpers
let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const decode = (file) => {
  const b = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], {maxBuffer: 1 << 29});
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const place = (dst, src, at, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * gain;
};
const env = (i, n, a = 0.005, d = 1) => Math.min(1, i / (a * SR)) * Math.exp((-i / SR) * d);
const make = (sec, fn) => Float32Array.from({length: Math.round(sec * SR)}, (_, i) => fn(i, i / SR));
// one-pole filters (state kept in closures)
const lp = (k) => { let y = 0; return (x) => (y += k * (x - y)); };
const hp = (k) => { let y = 0, px = 0; return (x) => { y = k * (y + x - px); px = x; return y; }; };

// ---------- sound effects
const SFX = {
  whoosh: () => { const f = lp(0.05), g = hp(0.9); return make(0.55, (i, t) => g(f(rnd())) * Math.sin(Math.PI * Math.min(1, t / 0.55)) * 2.2); },
  skid: () => { const f = lp(0.25); return make(0.6, (i, t) => (f(rnd()) * 0.8 + 0.25 * Math.sign(Math.sin(2 * Math.PI * (900 - 600 * t) * t))) * Math.exp(-t * 3.5) * 0.7); },
  sting: () => make(1.3, (i, t) => {
    const freqs = [98, 116.5, 146.8, 196];
    let s = 0;
    for (const f of freqs) s += ((2 * ((f * t) % 1) - 1) + (2 * ((f * 1.004 * t) % 1) - 1)) * 0.12;
    const boom = Math.sin(2 * Math.PI * (60 - 20 * t) * t) * Math.exp(-t * 5) * 0.9;
    return (s * Math.min(1, t / 0.01) * Math.exp(-t * 1.6) + boom) * 0.55;
  }),
  ding: () => make(1.0, (i, t) => (Math.sin(2 * Math.PI * 1568 * t) + 0.5 * Math.sin(2 * Math.PI * 2352 * t) + 0.25 * Math.sin(2 * Math.PI * 3136 * t)) * env(i, 0, 0.002, 4.5) * 0.3),
  ting: () => make(0.45, (i, t) => (Math.sin(2 * Math.PI * 3520 * t) + 0.4 * Math.sin(2 * Math.PI * 5280 * t)) * env(i, 0, 0.001, 9) * 0.22),
  pop: () => make(0.14, (i, t) => Math.sin(2 * Math.PI * (700 - 3000 * t) * t) * env(i, 0, 0.001, 30) * 0.45),
  rustle: () => { const f = hp(0.6); return make(0.6, (i, t) => f(rnd()) * (0.5 + 0.5 * Math.sin(t * 60)) * Math.sin(Math.PI * t / 0.6) * 0.25); },
  tap: () => make(0.06, (i, t) => (Math.sin(2 * Math.PI * 1800 * t) * 0.5 + rnd() * 0.3) * env(i, 0, 0.0005, 90) * 0.4),
  key: () => make(0.04, (i, t) => (Math.sin(2 * Math.PI * 2600 * t) * 0.4 + rnd() * 0.35) * env(i, 0, 0.0003, 140) * 0.28),
  crunch: () => { const f = hp(0.7); return make(0.3, (i, t) => f(rnd()) * (Math.sin(t * 90) > 0 ? 1 : 0.3) * Math.exp(-t * 9) * 0.5); },
};

const C = TL.cues;
const sfx = new Float32Array(N);
const add = (name, at, gain = 1) => { if (at != null && at >= 0) place(sfx, SFX[name](), at, gain); };
add('pop', C.pop, 0.9);
add('ting', C.glint);
add('whoosh', C.whoosh);
add('skid', C.skid);
add('sting', C.fataibo - 0.05);
add('crunch', C.bite);
add('ding', C.ding);
add('rustle', C.rustle);
for (const t of C.taps ?? []) add('tap', t);
for (const t of C.keys ?? []) add('key', t);

// ---------- voices
const voices = new Float32Array(N);
const spans = [];
for (const [id, span] of Object.entries(TL.lines)) {
  const f = fs.readdirSync(path.join(EP, 'voices')).find((x) => x.startsWith(id + '_') && x.endsWith('.mp3'));
  if (!f) { console.log('missing voice', id); continue; }
  place(voices, decode(path.join(EP, 'voices', f)), span.start, 1);
  spans.push([span.start, span.end]);
}

// ---------- music
let music;
const bgm = path.join(EP, 'music/bgm.mp3');
if (fs.existsSync(bgm)) {
  const src = decode(bgm);
  music = Float32Array.from({length: N}, (_, i) => src[i % src.length]);
} else {
  // Placeholder: 112 bpm, I–V loop (C – G), offbeat pluck chords, bass, kick, shaker, little melody.
  const bpm = 112, beat = 60 / bpm, bar = beat * 4;
  const chords = [[261.6, 329.6, 392.0], [246.9, 293.7, 392.0]];
  const bass = [130.8, 98.0];
  const mel = [523.3, 587.3, 659.3, 784.0, 659.3, 587.3, 523.3, 392.0];
  music = new Float32Array(N);
  const shp = hp(0.85);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const b = Math.floor(t / bar) % 2;
    const tb = t % beat, t8 = t % (beat / 2);
    const tBar = t % bar;
    let s = 0;
    if (Math.floor((tBar / beat) % 2) === 0) s += Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-tb * 30)) * tb) * Math.exp(-tb * 9) * 0.55; // kick on 1 and 3
    if (t8 > 0 && Math.floor(t / (beat / 2)) % 2 === 1) for (const f of chords[b]) s += Math.sin(2 * Math.PI * f * t8) * Math.exp(-t8 * 14) * 0.12 * (1 + 0.3 * Math.sin(2 * Math.PI * f * 2 * t8)); // offbeat plucks
    s += Math.sin(2 * Math.PI * bass[b] * t) * (0.5 + 0.5 * Math.exp(-tb * 5)) * 0.16; // bass
    s += shp(rnd()) * Math.exp(-(t % (beat / 4)) * 60) * 0.08; // shaker 16ths
    const mi = Math.floor(t / (beat / 2)) % 16;
    if (mi < 8 && Math.floor(t / (bar * 2)) % 2 === 1) s += Math.sin(2 * Math.PI * mel[mi] * t) * Math.exp(-t8 * 6) * 0.08; // melody every other 2 bars
    music[i] = s * 0.8;
  }
}
// music level: loud in shots 1-2, base 0.55 after, ducked to 0.2 under voices, 2 s fade at the end
const s3 = TL.shots.find((s) => s.id === 3).start;
const DUCK = 0.2; // music level (of full) while someone speaks
const gainAt = (t) => {
  const base = t < s3 - 0.5 ? 1 : t < s3 ? 1 - 0.45 * ((t - (s3 - 0.5)) / 0.5) : 0.55;
  let k = 0; // 0 = no duck, 1 = fully ducked (0.15 s attack, 0.35 s release)
  for (const [a, b] of spans) {
    k = Math.max(k, t < a - 0.15 ? 0 : t < a ? (t - (a - 0.15)) / 0.15 : t <= b ? 1 : t < b + 0.35 ? 1 - (t - b) / 0.35 : 0);
  }
  const fade = Math.min(1, Math.max(0, (TL.total - t) / 2));
  return (base - k * Math.max(0, base - DUCK)) * fade;
};
for (let i = 0; i < N; i++) music[i] *= gainAt(i / SR) * 0.6;

// ---------- write
const writeWav = (file, ch) => {
  const n = ch[0].length, nc = ch.length;
  const buf = Buffer.alloc(44 + n * nc * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * nc * 2, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(nc, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * nc * 2, 28); buf.writeUInt16LE(nc * 2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * nc * 2, 40);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, ch[c][i])) * 32767), o); o += 2; }
  fs.writeFileSync(file, buf);
};
const mix = new Float32Array(N);
let peak = 0;
for (let i = 0; i < N; i++) { mix[i] = voices[i] + music[i] + sfx[i]; peak = Math.max(peak, Math.abs(mix[i])); }
const norm = peak > 0.97 ? 0.97 / peak : 1;
for (let i = 0; i < N; i++) mix[i] *= norm;
writeWav(path.join(outPub, 'mix.wav'), [mix, mix]);
for (const [name, a] of [['voices', voices], ['music', music], ['sfx', sfx]]) {
  writeWav(path.join(outPub, name + '.wav'), [a]);
  fs.copyFileSync(path.join(outPub, name + '.wav'), path.join(outStems, name + '.wav'));
}
console.log(`audio: ${TL.total}s, ${spans.length} voice lines, music=${fs.existsSync(bgm) ? 'bgm.mp3' : 'code-made placeholder loop'}, peak norm ${norm.toFixed(2)}`);
