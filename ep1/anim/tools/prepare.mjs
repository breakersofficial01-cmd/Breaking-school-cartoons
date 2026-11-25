// Step 1+2 of the pipeline. Run:  node tools/prepare.mjs
//  - copies optional brand/logo.png into public/
//  - reads every voice file (ffprobe duration + per-frame loudness envelope)
//  - builds the timeline from the REAL audio durations (0.25 s gaps + action time)
//  - writes src/generated/{assets,lipsync,timeline}.json and ep1/out/captions.srt
// If a voice file is missing, an estimated duration + fake mouth movement is used
// and the line is flagged as a placeholder (so the build never stops).
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ANIM = path.resolve(HERE, '..');
const EP = path.resolve(ANIM, '..');
const GEN = path.join(ANIM, 'src/generated');
const PUB = path.join(ANIM, 'public');
const OUT = path.join(EP, 'out');
const FPS = 30;
const SR = 44100;
fs.mkdirSync(GEN, {recursive: true});
fs.mkdirSync(OUT, {recursive: true});

// ---- script (kept in sync with src/config.ts) ----
const LINES = [
  ['v01', 'v01_B.mp3', 'B', 'মাম্মা, এইডা কিডা!'],
  ['v02', 'v02_C.mp3', 'C', 'ধুর হালা, ওইটা রাহুলের গার্লফ্রেন্ড।'],
  ['v03', 'v03_B.mp3', 'B', 'ধুর, এসব তো ঠিক না। এইসব বয়সে এইসব লুচ্চামি করে বেড়াইতেছে এরা। পাক্কা জাহান্নামী হালারা।'],
  ['v04', 'v04_C.mp3', 'C', 'তুই যে কত বড় লুচ্চা আমি ওইটা জানি।'],
  ['v05', 'v05_A.mp3', 'A', 'বলদরা, পড়াশোনা করছস কিছু? আজকে সৌমিক স্যার কিন্তু ফাটাইব পড়া না পারলে।'],
  ['v06', 'v06_C.mp3', 'C', 'আমি তো কিছুই পড়ি নাই।'],
  ['v07', 'v07_B.mp3', 'B', 'পড়াশোনা তো একটা দুর্লভ বিষয়, এটা তো আমি আর করি না, আমি তো সস্তা জিনিস করি।'],
  ['v08', 'v08_A.mp3', 'A', 'যে একখান ছোট্ট ক্লাস পাইছি, এইটা দেখ, এইটা দেখলে বাঁচে যাইব।'],
  ['v09', 'v09_BC.mp3', 'BC', 'শুরু কর বেটা, তাড়াতাড়ি কর।'],
].map(([id, file, speaker, text]) => ({id, file, speaker, text}));

// ---- optional assets ----
// logo: brand/logo.svg preferred, brand/logo.png accepted
const logoName = ['logo.svg', 'logo.png'].find((f) => fs.existsSync(path.join(EP, 'brand', f)));
const hasLogo = Boolean(logoName);
const hasMusic = fs.existsSync(path.join(EP, 'music/bgm.mp3'));
if (hasLogo) { fs.mkdirSync(path.join(PUB, 'brand'), {recursive: true}); fs.copyFileSync(path.join(EP, 'brand', logoName), path.join(PUB, 'brand', logoName)); }
fs.writeFileSync(path.join(GEN, 'assets.json'), JSON.stringify({hasLogo, logoFile: hasLogo ? 'brand/' + logoName : '', hasMusic}, null, 2));

// ---- voice analysis ----
const decode = (file) => {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], {maxBuffer: 1 << 28});
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const probe = (file) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());

// Mouth index per frame: 0 closed, 1 small, 2 medium, 3 wide, 4 "O".
const envelopeToMouths = (samples) => {
  const per = SR / FPS;
  const n = Math.ceil(samples.length / per);
  const rms = [], zcr = [];
  for (let f = 0; f < n; f++) {
    let s = 0, z = 0, c = 0;
    for (let i = Math.floor(f * per); i < Math.min(samples.length, Math.floor((f + 1) * per)); i++) {
      s += samples[i] * samples[i]; c++;
      if (i > 0 && (samples[i] >= 0) !== (samples[i - 1] >= 0)) z++;
    }
    rms.push(Math.sqrt(s / Math.max(1, c))); zcr.push(z / Math.max(1, c));
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1;
  const voicedZ = zcr.filter((_, i) => rms[i] / ref > 0.3).sort((a, b) => a - b);
  const lowZ = voicedZ[Math.floor(voicedZ.length * 0.25)] ?? 0;
  const out = rms.map((r, i) => {
    const v = r / ref;
    if (v < 0.12) return 0;
    if (v < 0.3) return 1;
    if (zcr[i] <= lowZ && v >= 0.45) return 4; // rounded vowel: "O"
    if (v < 0.6) return 2;
    return 3;
  });
  // hold each shape at least 2 frames so the mouth doesn't flicker
  for (let i = 1; i < out.length - 1; i++) if (out[i] !== out[i - 1] && out[i] !== out[i + 1]) out[i] = out[i - 1];
  return out;
};

const fakeMouths = (dur, seed) => {
  const n = Math.ceil(dur * FPS);
  const pat = [0, 2, 3, 2, 1, 4, 2, 1, 3, 2, 0, 1];
  return Array.from({length: n}, (_, i) => (i > n - 3 ? 0 : pat[(Math.floor(i / 2) + seed) % pat.length]));
};

const lipsync = {};
const report = [];
for (const [k, L] of LINES.entries()) {
  const f = path.join(EP, 'voices', L.file);
  if (fs.existsSync(f)) {
    L.dur = probe(f);
    lipsync[L.id] = envelopeToMouths(decode(f));
    L.placeholder = false;
  } else {
    L.dur = Math.max(1.2, [...L.text].length * 0.075);
    lipsync[L.id] = fakeMouths(L.dur, k * 3);
    L.placeholder = true;
  }
  report.push(L);
}
fs.writeFileSync(path.join(GEN, 'lipsync.json'), JSON.stringify(lipsync));

// ---- timeline (seconds) ----
const GAP = 0.25;
const r = (x) => Math.round(x * 1000) / 1000;
const shots = [];
const lines = {};
let t = 0;
const shot = (id, dur) => { shots.push({id, start: r(t), end: r(t + dur)}); t += dur; };
const line = (id, at) => { const L = report.find((x) => x.id === id); lines[id] = {start: r(at), end: r(at + L.dur)}; return at + L.dur; };

shot(1, 4.0);
shot(2, 2.0);
{ // shot 3: B and C walk; lines 1-4 (extra = action time before the next line)
  const s = t; let c = s + 1.2;           // walk, then B freezes + zoom
  c = line('v01', c) + GAP + 0.4;         // C answers
  c = line('v02', c) + GAP + 0.8;         // sparkle pops, B deflates
  c = line('v03', c) + GAP + 0.3;
  c = line('v04', c) + GAP + 0.7;         // B sweats, looks away
  shot(3, c - s);
}
{ const s = t; let c = s + 1.3; c = line('v05', c) + 0.5; shot(4, c - s); } // A runs in + skids first
{
  const s = t; let c = s + 0.3;
  c = line('v06', c) + GAP + 0.6;         // "really?" looks
  c = line('v07', c) + GAP + 0.6;         // big bite
  c = line('v08', c) + 0.6;               // wink + ding
  shot(5, c - s);
}
{ const s = t; let c = s + 0.25; c = line('v09', c) + 0.4; shot(6, c - s); }
shot(7, 2.0);
shot(8, 6.6);
shot(9, 1.0);
const total = r(t);

// "ফাটাইব" moment in line 5 (camera shake + sting): estimated from text position.
const l5 = report.find((x) => x.id === 'v05');
const pos = l5.text.indexOf('ফাটাইব') / l5.text.length;
const S = (n) => shots.find((s) => s.id === n);
const s8 = S(8).start;
// Phone sequence in shot 8 (seconds after shot start). Typing: one key every 0.11 s.
const TYPE = 'Breaking School';
const phone = {open: 0.25, searchTap: 0.75, typeStart: 1.0, keyDt: 0.11, result: 2.85, channelTap: 3.35, videoTap: 4.85, player: 5.05};
// Every sound-effect / action moment, shared by the picture (shots) and the sound (tools/audio.mjs).
const cues = {
  fataibo: r(lines.v05.start + l5.dur * Math.min(0.95, pos * 1.02)),
  pop: r(lines.v02.end + 0.12),
  glint: r(lines.v04.start + 0.55),
  whoosh: r(S(4).start + 0.15),
  skid: r(S(4).start + 0.75),
  ding: r(lines.v08.start + 0.15),
  bite: r(lines.v07.end + 0.45),
  rustle: r(S(7).start + 0.35),
  phone: Object.fromEntries(Object.entries(phone).map(([k, v]) => [k, k === 'keyDt' ? v : r(s8 + v)])),
  typed: TYPE,
  keys: [...TYPE].map((_, i) => r(s8 + phone.typeStart + i * phone.keyDt)),
  taps: [phone.open, phone.searchTap, phone.channelTap, phone.videoTap].map((v) => r(s8 + v)),
};

// ---- caption chunks (max ~2 lines each) ----
const MAXC = 46;
const chunk = (text) => {
  const parts = text.split(/(?<=[,।?!])\s+/);
  const res = [];
  let cur = '';
  for (const p of parts) {
    if (cur && (cur + ' ' + p).length > MAXC) { res.push(cur); cur = p; } else cur = cur ? cur + ' ' + p : p;
  }
  if (cur) res.push(cur);
  return res;
};
const captions = [];
for (const L of report) {
  const span = lines[L.id];
  const parts = chunk(L.text);
  const totalLen = parts.reduce((a, p) => a + p.length, 0);
  let a = span.start;
  for (const p of parts) {
    const d = ((span.end - span.start) * p.length) / totalLen;
    captions.push({line: L.id, text: p, start: r(a), end: r(a + d)});
    a += d;
  }
}

const timeline = {fps: FPS, total, shots, lines, cues, captions, durations: Object.fromEntries(report.map((L) => [L.id, r(L.dur)])), placeholders: report.filter((L) => L.placeholder).map((L) => L.file)};
fs.writeFileSync(path.join(GEN, 'timeline.json'), JSON.stringify(timeline, null, 2));

// ---- SRT ----
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
fs.writeFileSync(path.join(OUT, 'captions.srt'), captions.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n'));

// ---- print ----
console.log('\nAssets:', hasLogo ? logoName + ' ✓' : 'logo MISSING (placeholder)', '|', hasMusic ? 'bgm.mp3 ✓' : 'bgm.mp3 MISSING (code-made loop)');
console.log('\nVoice file      dur(s)  source');
for (const L of report) console.log(`${L.file.padEnd(14)} ${L.dur.toFixed(2).padStart(6)}  ${L.placeholder ? 'MISSING -> estimated' : 'ffprobe'}`);
console.log('\nShot  start    end    len');
for (const s of shots) console.log(`${String(s.id).padStart(4)}  ${s.start.toFixed(2).padStart(6)} ${s.end.toFixed(2).padStart(6)} ${(s.end - s.start).toFixed(2).padStart(6)}`);
console.log('\nLine  start    end');
for (const [id, l] of Object.entries(lines)) console.log(`${id}  ${l.start.toFixed(2).padStart(6)} ${l.end.toFixed(2).padStart(6)}`);
console.log(`\nTotal: ${total.toFixed(2)} s (${Math.round(total * FPS)} frames)  | "ফাটাইব" at ${cues.fataibo}s`);
