// SHOTS 8–9 — close-up of A's phone, then the push-in hand-off.
// Shot 8: a generic YouTube-style app ("Video", red play icon — NOT the real YouTube
// brand) opens, "Breaking School" is typed letter by letter, the channel is tapped,
// then a class video; the player opens with a loading circle.
// Shot 9: the camera pushes in until the (square) player box exactly fills the
// 1080x1080 picture, then holds 0.5 s on the black player = hand-off frame.
// Owner rule: the logo is ONLY the top-right watermark, so the channel uses text.
import React from 'react';
import {INK, PIC_H, PIC_W} from '../config';
import {TL, keys, shot, tw} from '../anim';
import {Stage, girlActors} from './stage';

const P = TL.cues.phone;
const TYPED = TL.cues.typed;
const KEYS = TL.cues.keys;
const SKIN = '#C98B5B';
const FONT_UI = '"Hind Siliguri", Arial, sans-serif';

// phone geometry in picture pixels
const PH = {x: 280, y: 40, w: 520, h: 1080, bezel: 18};
const SCR = {x: PH.x + PH.bezel, y: PH.y + PH.bezel, w: PH.w - PH.bezel * 2, h: PH.h - PH.bezel * 2};
const STATUS = 36;
const BOX = {x: 0, y: STATUS, w: SCR.w, h: SCR.w}; // square player box (screen coords)

const KB_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const KB_TOP = SCR.h - 300;
const keyPos = (ch: string) => {
  if (ch === ' ') return {x: SCR.w / 2, y: KB_TOP + 3 * 62 + 40};
  const c = ch.toLowerCase();
  for (let r = 0; r < 3; r++) {
    const i = KB_ROWS[r].indexOf(c);
    if (i >= 0) {
      const kw = SCR.w / 10;
      return {x: kw * i + kw / 2 + r * kw * 0.5, y: KB_TOP + r * 62 + 36};
    }
  }
  return {x: SCR.w / 2, y: KB_TOP};
};

// tap targets (screen coords)
const TAP = {
  open: {x: SCR.w * 0.375, y: 210},
  search: {x: SCR.w / 2, y: STATUS + 100},
  channel: {x: 140, y: STATUS + 200},
  video: {x: SCR.w * 0.27, y: 420},
};

const PlayIcon: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.72} viewBox="0 0 100 72">
    <rect x="0" y="0" width="100" height="72" rx="18" fill="#E62117" />
    <path d="M 40 20 L 66 36 L 40 52 Z" fill="#fff" />
  </svg>
);

const Spinner: React.FC<{t: number; size: number}> = ({t, size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{transform: `rotate(${(t * 360) % 360}deg)`}}>
    <circle cx="20" cy="20" r="15" fill="none" stroke="#444" strokeWidth="4" />
    <path d="M 20 5 A 15 15 0 0 1 35 20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Avatar: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, borderRadius: size, background: '#FFB21E', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial Black, Arial', fontWeight: 900, fontSize: size * 0.38, flexShrink: 0}}>BS</div>
);

const CLASSES = [
  {title: 'জীববিজ্ঞান: কোষ বিভাজন', bg: '#2E7D4F', dur: '৪৫:১২'},
  {title: 'রসায়ন: পর্যায় সারণি', bg: '#7A3FB0', dur: '৩৮:০৫'},
  {title: 'পদার্থবিজ্ঞান: গতি', bg: '#1E5FB4', dur: '৪২:৪০'},
  {title: 'উচ্চতর গণিত: ক্যালকুলাস', bg: '#C2410C', dur: '৫১:৩০'},
];

const Thumb: React.FC<{c: (typeof CLASSES)[number]; w: number}> = ({c, w}) => (
  <div style={{width: w, height: w * 0.5625, borderRadius: 10, background: `linear-gradient(135deg, ${c.bg}, #111)`, position: 'relative', overflow: 'hidden', padding: 8, boxSizing: 'border-box'}}>
    <div style={{fontFamily: 'Arial Black, Arial', fontSize: w * 0.06, color: '#FFB21E', letterSpacing: 1}}>BREAKING SCHOOL</div>
    <div style={{fontFamily: FONT_UI, fontWeight: 700, fontSize: w * 0.095, color: '#fff', lineHeight: 1.25, marginTop: 4}}>{c.title}</div>
    <div style={{position: 'absolute', right: 6, bottom: 6, background: 'rgba(0,0,0,.8)', color: '#fff', fontSize: w * 0.06, padding: '1px 5px', borderRadius: 4, fontFamily: FONT_UI}}>{c.dur}</div>
  </div>
);

const Header: React.FC<{search?: string; cursor?: boolean; active?: boolean}> = ({search, cursor, active}) => (
  <div>
    <div style={{height: 58, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8}}>
      <PlayIcon w={40} />
      <div style={{fontFamily: 'Arial Black, Arial', fontSize: 26, letterSpacing: -1}}>Video</div>
    </div>
    <div style={{margin: '0 14px', height: 48, borderRadius: 24, background: '#F1F1F1', border: active ? '2px solid #1a73e8' : '2px solid #F1F1F1', display: 'flex', alignItems: 'center', padding: '0 16px', fontFamily: 'Arial', fontSize: 22, color: search ? '#111' : '#888'}}>
      <span style={{marginRight: 10}}>🔍</span>
      {search || 'Search'}
      {cursor ? <span style={{width: 2, height: 26, background: '#1a73e8', marginLeft: 2}} /> : null}
    </div>
  </div>
);

// ---------------------------------------------------------------- screen states
const Screen: React.FC<{t: number}> = ({t}) => {
  const sty: React.CSSProperties = {position: 'absolute', inset: 0, background: '#fff', fontFamily: FONT_UI};
  const status = (
    <div style={{height: STATUS, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 22px', fontFamily: 'Arial', fontSize: 16, fontWeight: 700}}>
      <span>9:41</span><span>▂▄▆ ▮</span>
    </div>
  );
  // 1) home screen
  if (t < P.open + 0.15) {
    const apps = ['#34A853', '#E62117', '#4285F4', '#FBBC05', '#9C27B0', '#00ACC1', '#FF7043', '#5C6BC0', '#8D6E63', '#26A69A', '#EC407A', '#7CB342'];
    return (
      <div style={{...sty, background: 'linear-gradient(160deg,#5B8DEF,#9B6BE8)', color: '#fff'}}>
        {status}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, padding: '40px 22px'}}>
          {apps.map((c, i) => (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
              {i === 1 ? <div style={{width: 80, height: 80, borderRadius: 20, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><PlayIcon w={56} /></div> : <div style={{width: 80, height: 80, borderRadius: 20, background: c}} />}
              <div style={{fontFamily: 'Arial', fontSize: 15}}>{i === 1 ? 'Video' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // 2) app home + typing
  if (t < P.result) {
    const typing = t >= P.searchTap + 0.1;
    const n = KEYS.filter((k) => t >= k).length;
    const kbUp = tw(t, P.searchTap, P.searchTap + 0.25, 300, 0);
    const pressed = KEYS.findIndex((k) => t >= k && t < k + 0.09);
    return (
      <div style={sty}>
        {status}
        <Header search={typing ? TYPED.slice(0, n) : ''} cursor={typing && Math.floor(t * 3) % 2 === 0} active={typing} />
        {[0, 1, 2].map((i) => <div key={i} style={{margin: '16px 14px 0', height: 150, borderRadius: 12, background: '#E9E9E9'}} />)}
        {typing ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: KB_TOP - 14 + kbUp, height: 320, background: '#D5D8DD', paddingTop: 8}}>
            {KB_ROWS.map((row, r) => (
              <div key={r} style={{display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12}}>
                {[...row].map((ch) => {
                  const on = pressed >= 0 && TYPED[pressed].toLowerCase() === ch;
                  return <div key={ch} style={{width: SCR.w / 10 - 6, height: 50, borderRadius: 7, background: on ? '#9aa3ad' : '#fff', fontFamily: 'Arial', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 0 #999'}}>{ch}</div>;
                })}
              </div>
            ))}
            <div style={{margin: '0 auto', width: 260, height: 50, borderRadius: 7, background: pressed >= 0 && TYPED[pressed] === ' ' ? '#9aa3ad' : '#fff', boxShadow: '0 1px 0 #999'}} />
          </div>
        ) : null}
      </div>
    );
  }
  // 3) search results
  if (t < P.channelTap + 0.15) {
    return (
      <div style={sty}>
        {status}
        <Header search={TYPED} />
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '26px 18px'}}>
          <Avatar size={100} />
          <div>
            <div style={{fontFamily: 'Arial', fontWeight: 700, fontSize: 26}}>Breaking School</div>
            <div style={{fontSize: 18, color: '#666'}}>@breakingschool · ক্লাসের চ্যানেল</div>
            <div style={{marginTop: 8, display: 'inline-block', background: '#111', color: '#fff', borderRadius: 18, padding: '4px 16px', fontFamily: 'Arial', fontSize: 17}}>Subscribe</div>
          </div>
        </div>
        <div style={{padding: '0 14px'}}><Thumb c={CLASSES[0]} w={SCR.w - 28} /></div>
      </div>
    );
  }
  // 4) channel page
  if (t < P.videoTap + 0.15) {
    return (
      <div style={sty}>
        {status}
        <div style={{height: 120, background: 'linear-gradient(90deg,#FFB21E,#FF7A1A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
          <div style={{fontFamily: 'Arial Black, Arial', fontSize: 30, color: '#111'}}>BREAKING SCHOOL</div>
          <div style={{fontWeight: 700, fontSize: 20, color: '#111'}}>পড়া হবে মজায়!</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px'}}>
          <Avatar size={64} />
          <div style={{fontFamily: 'Arial', fontWeight: 700, fontSize: 24}}>Breaking School</div>
        </div>
        <div style={{display: 'flex', gap: 22, padding: '0 18px 10px', fontFamily: 'Arial', fontSize: 18, borderBottom: '1px solid #ddd'}}>
          <span>Home</span><span style={{fontWeight: 700, borderBottom: '3px solid #111'}}>Videos</span><span>Playlists</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14}}>
          {CLASSES.map((c, i) => (
            <div key={i}>
              <Thumb c={c} w={(SCR.w - 40) / 2} />
              <div style={{fontWeight: 700, fontSize: 15, marginTop: 4, lineHeight: 1.3}}>{c.title}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // 5) player: black square box with a loading circle
  return (
    <div style={sty}>
      {status}
      <div style={{position: 'absolute', left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Spinner t={t} size={44} />
      </div>
      <div style={{position: 'absolute', top: BOX.y + BOX.h + 14, left: 16, right: 16}}>
        <div style={{fontWeight: 700, fontSize: 22, lineHeight: 1.3}}>{CLASSES[0].title}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 10}}>
          <Avatar size={40} />
          <span style={{fontFamily: 'Arial', fontWeight: 700, fontSize: 18}}>Breaking School</span>
        </div>
      </div>
    </div>
  );
};

// where A's thumb is (screen coords) and whether it is pressing
const thumbAt = (t: number) => {
  const rest = {x: SCR.w + 40, y: SCR.h - 80};
  const targets: {at: number; p: {x: number; y: number}}[] = [
    {at: P.open, p: TAP.open},
    {at: P.searchTap, p: TAP.search},
    ...KEYS.map((k, i) => ({at: k, p: keyPos(TYPED[i])})),
    {at: P.channelTap, p: TAP.channel},
    {at: P.videoTap, p: TAP.video},
  ];
  let best = null as null | {at: number; p: {x: number; y: number}};
  for (const g of targets) if (Math.abs(t - g.at) < 0.35 && (!best || Math.abs(t - g.at) < Math.abs(t - best.at))) best = g;
  if (!best) return {...rest, press: 0};
  const d = Math.abs(t - best.at);
  const k = d < 0.06 ? 1 : 1 - (d - 0.06) / 0.29;
  const isKey = KEYS.includes(best.at);
  const from = isKey ? {x: best.p.x + 20, y: best.p.y + 40} : rest;
  return {x: from.x + (best.p.x - from.x) * k, y: from.y + (best.p.y - from.y) * k, press: d < 0.06 ? 1 : 0};
};

export const PhoneShots: React.FC<{t: number}> = ({t}) => {
  const s8 = shot(8), s9 = shot(9);
  // shot 9: interpolate the box rect from its place on the phone to the full picture
  const z = tw(t, s9.start, s9.start + 0.5, 0, 1);
  const boxOnPic = {x: SCR.x + BOX.x, y: SCR.y + BOX.y, w: BOX.w};
  const rw = boxOnPic.w + (PIC_W - boxOnPic.w) * z;
  const rx = boxOnPic.x * (1 - z), ry = boxOnPic.y * (1 - z);
  const zs = rw / boxOnPic.w;
  const sway = t < s9.start ? Math.sin(t * 1.3) * 4 : 0;
  const push = keys(t, [[s8.start, 1], [s8.end, 1.04]]);
  // shot 8: slow push-in around the picture centre; shot 9: box -> full picture
  const tx = z > 0 ? rx - boxOnPic.x * zs : (PIC_W / 2) * (1 - push);
  const ty = z > 0 ? ry - boxOnPic.y * zs : (PIC_H / 2) * (1 - push);
  const scale = z > 0 ? zs : push;
  const th = thumbAt(t);
  const tapRipple = [P.open, P.searchTap, P.channelTap, P.videoTap].find((a) => t >= a && t < a + 0.35);
  const rip = tapRipple != null ? (t - tapRipple) / 0.35 : -1;
  const ripP = tapRipple === P.open ? TAP.open : tapRipple === P.searchTap ? TAP.search : tapRipple === P.channelTap ? TAP.channel : TAP.video;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
      <Stage world="field" cam={{pos: [5, 1.5, 3], target: [5, 1.6, -8], fov: 45}} t={t} actors={girlActors()} blur={12} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty + sway}px) scale(${scale})`}}>
        {/* phone body */}
        <div style={{position: 'absolute', left: PH.x, top: PH.y, width: PH.w, height: PH.h, borderRadius: 60, background: '#111', border: `5px solid ${INK}`, boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,.45)'}} />
        <div style={{position: 'absolute', left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, borderRadius: 44, overflow: 'hidden', background: '#fff'}}>
          <Screen t={t} />
          {rip >= 0 ? <div style={{position: 'absolute', left: ripP.x - 40 * (0.4 + rip), top: ripP.y - 40 * (0.4 + rip), width: 80 * (0.4 + rip), height: 80 * (0.4 + rip), borderRadius: '50%', background: 'rgba(0,0,0,.18)', opacity: 1 - rip}} /> : null}
        </div>
        {/* hands (A's skin): left hand grips the left edge, right thumb taps */}
        <svg width={PIC_W} height={PIC_H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d={`M ${PH.x - 70} ${PIC_H + 40} Q ${PH.x - 60} ${PIC_H - 300} ${PH.x + 10} ${PIC_H - 330} Q ${PH.x + 60} ${PIC_H - 330} ${PH.x + 50} ${PIC_H - 250} Q ${PH.x + 40} ${PIC_H - 120} ${PH.x + 90} ${PIC_H + 40} Z`} fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${PH.x + PH.w + 80} ${PIC_H + 40} Q ${PH.x + PH.w + 60} ${PIC_H - 260} ${PH.x + PH.w - 10} ${PIC_H - 300} L ${PH.x + PH.w - 40} ${PIC_H + 40} Z`} fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {z === 0 ? (
            <g transform={`translate(${SCR.x + th.x} ${SCR.y + th.y + (th.press ? 4 : 0)})`}>
              <path d={`M -26 0 Q -30 -30 0 -32 Q 30 -30 26 0 L 60 260 L -10 280 Z`} fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              <ellipse cx={0} cy={-14} rx={16} ry={12} fill="#E9B48C" />
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
};
