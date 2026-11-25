// SHOTS 1, 2, 4, 5, 6, 7 (everything outside shot 3 and the phone shots 8–9).
// All timing comes from the timeline (TL.lines / TL.cues), so when the voices change
// the action follows automatically.
import React from 'react';
import {Boy, Singara, SmallPhone, Star} from '../characters/Boy';
import type {Pose} from '../characters/Boy';
import {FieldScene, GATE_GROUND, GateScene, WALK_Y} from '../scenes/Scenes';
import type {Cam} from '../scenes/Scenes';
import {INK, PIC_H, PIC_W} from '../config';
import {TL, backOut, idle, keys, line, shot, talking, tw} from '../anim';
import {CAST_SCALE, GirlsGroup, fieldBlocking} from './Shot3';

const C = TL.cues;
const CAM_Y = WALK_Y - 440;
const SC = CAST_SCALE;

// Overlay svg in screen space (sparkles, speed lines, etc.)
const Overlay: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={PIC_W} height={PIC_H} style={{position: 'absolute', inset: 0}}>{children}</svg>
);

// ------------------------------------------------------------------ SHOT 1
// Low angle at the gate, slow push-in. B and C walk through the gate in slow motion.
export const Shot1: React.FC<{t: number}> = ({t}) => {
  const S = shot(1);
  const k = (t - S.start) / (S.end - S.start);
  const e = k * k * (3 - 2 * k) * 0.6 + k * 0.4;
  const sc = 0.42 + 0.5 * e;
  const y = GATE_GROUND + 40 + 300 * e;
  const walk = t * 3.2; // slow-motion stride
  const cam: Cam = {x: 540, y: 560 - 20 * k, z: 1 + 0.12 * k};
  return (
    <GateScene cam={cam} t={t}>
      <Boy id="C" x={520 - 90 * e} y={y} scale={sc} pose={idle(t, 'C', {walk, look: [0.2, -0.1]})} />
      <Boy id="B" x={600 + 100 * e} y={y + 6} scale={sc} pose={idle(t, 'B', {walk: walk + 1.4, handR: <Singara />, armR: {sh: 10 + Math.sin(walk) * 8, el: -40}})} />
    </GateScene>
  );
};

// ------------------------------------------------------------------ SHOT 2
// Wide of the field with a slight pan: the girls chat; B and C enter frame left.
export const Shot2: React.FC<{t: number}> = ({t}) => {
  const S = shot(2);
  const {bx, cx, bWalk, cWalk} = fieldBlocking(t);
  const cam: Cam = {x: tw(t, S.start, S.end, 1400, 1450), y: 304, z: 0.72};
  return (
    <FieldScene cam={cam} t={t} girls={<GirlsGroup t={t} />}>
      <Boy id="C" x={cx} y={WALK_Y} scale={SC} pose={idle(t, 'C', {walk: cWalk})} />
      <Boy id="B" x={bx} y={WALK_Y} scale={SC} pose={idle(t, 'B', {walk: bWalk, handR: <Singara />, armR: {sh: 8, el: -30}})} />
    </FieldScene>
  );
};

// Where everyone stands after shot 3 (B and C stopped), and where A lands between them.
const END3 = fieldBlocking(shot(3).end);
const MID = (END3.bx + END3.cx) / 2;
const SPREAD = 40; // B and C step apart to make room for A

const shake = (t: number, at: number, amp = 18, dur = 0.45) => {
  const d = t - at;
  if (d < 0 || d > dur) return {shakeX: 0, shakeY: 0};
  const a = amp * (1 - d / dur);
  return {shakeX: Math.sin(d * 70) * a, shakeY: Math.cos(d * 55) * a * 0.6};
};

// A's position in shot 4: runs in from the right, skids, stops between B and C.
const aBlock = (t: number) => {
  const arrive = C.skid, stop = C.skid + 0.3;
  const x = keys(t, [[C.whoosh, MID + 900], [arrive, MID + 130], [stop, MID]], (v) => v);
  return {x, running: t >= C.whoosh && t < arrive, skidding: t >= arrive && t < stop + 0.1, hug: tw(t, stop, stop + 0.25, 0, 1)};
};

// ------------------------------------------------------------------ SHOT 4
// Same walkway, camera stops. A runs in, skids (dust puff), arm round both; line 5.
export const Shot4: React.FC<{t: number}> = ({t}) => {
  const L5 = line('v05');
  const a = aBlock(t);
  const apart = tw(t, C.skid, C.skid + 0.35, 0, SPREAD);
  const scared = t >= C.fataibo - 0.1 && t < C.fataibo + 0.7;
  const lookA = t >= C.skid - 0.2;
  const hugK = t < L5.end + 0.2 ? a.hug : 0;
  const runArm = (s: number) => ({sh: 30 + s * Math.sin(t * 16) * 30, el: -60});
  const armRest = {sh: 7 + 66 * hugK, el: -6 - 4 * hugK};
  const aPose: Pose = idle(t, 'A', {
    walk: a.running ? t * 16 : null,
    lean: a.running ? -14 : a.skidding ? 12 : 0,
    armL: a.running ? runArm(1) : a.skidding ? {sh: 80, el: -40} : armRest,
    armR: a.running ? runArm(-1) : a.skidding ? {sh: 80, el: -40} : armRest,
    eyes: scared ? 'huge' : 'open',
    brow: scared ? 8 : 2,
    mouth: talking(t, 'A') ? undefined : 'grin',
  });
  const bPose = idle(t, 'B', {look: lookA ? [-1, 0] : [1, 0.4], eyes: scared ? 'huge' : 'open', sweat: scared ? 1 : 0.4, browTilt: 6, handR: <Singara />, armR: {sh: 8, el: -30}});
  const cPose = idle(t, 'C', {look: lookA ? [1, 0] : [0.2, 0], eyes: scared ? 'huge' : 'half'});
  const punch = tw(t, C.fataibo, C.fataibo + 0.12, 0, 0.08) - tw(t, C.fataibo + 0.3, C.fataibo + 0.7, 0, 0.08);
  const cam: Cam = {x: MID, y: CAM_Y, z: 1.05 + punch, ...shake(t, C.fataibo)};
  const puff = tw(t, C.skid, C.skid + 0.6, 0, 1, (v) => v); // dust at A's feet while skidding
  const ax = PIC_W / 2 + (a.x - MID) * cam.z;
  return (
    <>
      <FieldScene cam={cam} t={t} girls={<GirlsGroup t={t} />}>
        <Boy id="C" x={END3.cx - apart} y={WALK_Y} scale={SC} pose={cPose} />
        <Boy id="B" x={END3.bx + apart} y={WALK_Y} scale={SC} pose={bPose} />
        {puff > 0 && puff < 1
          ? [0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={a.x + 60 + i * 26 + puff * 40} cy={WALK_Y - 10 - i * 6 - puff * 30} r={14 + puff * 26 + i * 3} fill="#E7D6B8" stroke={INK} strokeWidth={3} opacity={1 - puff} />
            ))
          : null}
        <Boy id="A" x={a.x} y={WALK_Y} scale={SC} pose={aPose} />
      </FieldScene>
      {a.running ? (
        <Overlay>
          {[0, 1, 2].map((i) => <line key={i} x1={ax + 90} y1={600 + i * 60} x2={ax + 260} y2={600 + i * 60} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.8} />)}
        </Overlay>
      ) : null}
    </>
  );
};

// Positions in shots 5–6 (A between B and C)
const POS = {a: MID, b: END3.bx + SPREAD, c: END3.cx - SPREAD};
const headY = (id: 'A' | 'B' | 'C') => WALK_Y + ({A: -517, B: -455, C: -507}[id] + 40) * SC;

// ------------------------------------------------------------------ SHOT 5
// Three-shot with small cuts between faces: lines 6 (C), 7 (B), 8 (A).
export const Shot5: React.FC<{t: number}> = ({t}) => {
  const L6 = line('v06'), L7 = line('v07'), L8 = line('v08');
  let cam: Cam = {x: POS.a, y: CAM_Y, z: 1.05};
  if (t < L6.end + 0.1) cam = {x: POS.c + 20, y: headY('C') + 60, z: 1.75};
  else if (t < L7.start - 0.05) cam = {x: POS.a, y: CAM_Y, z: 1.05};
  else if (t < L8.start - 0.1) cam = {x: POS.b, y: headY('B') + 60, z: tw(t, L7.start, C.bite, 1.7, 1.85)};
  else cam = {x: POS.a, y: headY('A') + 90, z: 1.6};

  const really = t >= L6.end && t < L7.start; // A and B give C a "really?" look
  const push = keys(t, [[L6.start + 0.2, 0], [L6.start + 0.5, 1], [L6.end - 0.1, 1], [L6.end + 0.2, 0]]);
  const cPose = idle(t, 'C', {
    eyes: t < L6.end ? 'half' : 'open',
    look: t >= L7.start ? [1, 0] : [0, 0],
    armR: {sh: 7 - 32 * push, el: -6 - 150 * push},
    glint: keys(t, [[L6.start + 0.45, 0], [L6.start + 0.55, 0.7], [L6.start + 0.9, 0]]),
  });

  // B: proud, hand on chest, then a big bite of the singara
  const proud = t >= L7.start - 0.1 && t < C.bite - 0.5;
  const toMouth = keys(t, [[C.bite - 0.5, 0], [C.bite - 0.05, 1], [C.bite + 0.25, 1], [C.bite + 0.6, 0]]);
  const chewing = t >= C.bite && t < C.bite + 1.2;
  const bPose = idle(t, 'B', {
    look: really ? [-1, 0] : [0, 0],
    eyes: really ? 'half' : proud && t > L7.start + 0.4 ? 'closed' : 'open',
    browTilt: really ? -4 : 0,
    brow: really ? 6 : 0,
    headY: proud ? -6 : 0,
    headTilt: proud ? -4 : 0,
    armL: proud ? {sh: -18, el: -118} : {sh: 8, el: -6},
    armR: {sh: 8 - 24 * toMouth, el: -30 - 110 * toMouth},
    handR: <Singara bitten={t >= C.bite} />,
  });
  if (toMouth > 0.6 && t < C.bite) bPose.mouth = 'wide';
  if (chewing) bPose.mouth = Math.sin(t * 22) > 0 ? 'closed' : 'small';

  // A: taps his shirt pocket, winks, "ding" sparkle
  const tap = t >= L8.start - 0.1;
  const bounce = tap && t < C.ding + 0.5 ? Math.abs(Math.sin((t - L8.start) * 9)) * 10 : 0;
  const aPose = idle(t, 'A', {
    look: really ? [-1, 0] : t >= L7.start && t < L8.start ? [1, 0] : [0, 0],
    eyes: really ? 'half' : 'open',
    brow: really ? 8 : 0,
    armL: tap ? {sh: -14 + bounce * 0.3, el: -128 + bounce} : {sh: 7, el: -6},
    wink: t >= C.ding && t < C.ding + 0.6,
    mouth: talking(t, 'A') ? undefined : 'grin',
  });
  const ding = tw(t, C.ding, C.ding + 0.5, 0, 1, (v) => v);
  return (
    <>
      <FieldScene cam={cam} t={t} girls={<GirlsGroup t={t} />}>
        <Boy id="C" x={POS.c} y={WALK_Y} scale={SC} pose={cPose} />
        <Boy id="B" x={POS.b} y={WALK_Y} scale={SC} pose={bPose} />
        <Boy id="A" x={POS.a} y={WALK_Y} scale={SC} pose={aPose} />
      </FieldScene>
      {ding > 0 && ding < 1 ? (
        <Overlay>
          <Star x={PIC_W / 2 + 170} y={PIC_H / 2 - 120} r={70 * Math.sin(ding * Math.PI)} fill="#FFE45C" />
          <Star x={PIC_W / 2 + 250} y={PIC_H / 2 - 40} r={34 * Math.sin(ding * Math.PI)} fill="#fff" />
        </Overlay>
      ) : null}
    </>
  );
};

// ------------------------------------------------------------------ SHOT 6
// Fast push-in on the three: B and C lean in to A and beg (line 9).
export const Shot6: React.FC<{t: number}> = ({t}) => {
  const S = shot(6);
  const lean = tw(t, S.start, S.start + 0.3, 0, 1, backOut);
  const beg: Pose = {armL: {sh: -12, el: -120}, armR: {sh: -12, el: -120}, browTilt: 10, eyes: 'huge'};
  const bPose = idle(t, 'B', {...beg, lean: -6 * lean, look: [-1, 0], handR: <Singara bitten />});
  const cPose = idle(t, 'C', {...beg, lean: 6 * lean, look: [1, 0]});
  const aPose = idle(t, 'A', {mouth: 'grin', brow: 4});
  const cam: Cam = {x: POS.a, y: tw(t, S.start, S.start + 0.4, CAM_Y, headY('A') + 120, backOut), z: tw(t, S.start, S.start + 0.4, 1.05, 1.5, backOut), shakeX: Math.sin(t * 40) * 2};
  // A is drawn first (behind) so B's and C's begging faces stay visible as they lean in
  return (
    <FieldScene cam={cam} t={t} girls={<GirlsGroup t={t} />}>
      <Boy id="A" x={POS.a} y={WALK_Y} scale={SC} pose={aPose} />
      <Boy id="C" x={POS.c - 25} y={WALK_Y} scale={SC} pose={cPose} />
      <Boy id="B" x={POS.b + 25} y={WALK_Y} scale={SC} pose={bPose} />
    </FieldScene>
  );
};

// ------------------------------------------------------------------ SHOT 7
// Over-the-shoulder from behind the three: A pulls the phone from his pocket, heads crowd in.
export const Shot7: React.FC<{t: number}> = ({t}) => {
  const S = shot(7);
  const up = tw(t, C.rustle, C.rustle + 0.6, 0, 1, backOut);
  const crowd = tw(t, C.rustle + 0.4, C.rustle + 1.0, 0, 1);
  const k = (t - S.start) / (S.end - S.start);
  const base = PIC_H + 330; // feet below the frame: we see heads and shoulders
  const sc = 1.45;
  const bg: Cam = {x: 1700, y: 380, z: 0.9 + 0.06 * k};
  return (
    <>
      <FieldScene cam={bg} t={t} blur={5} front={false} />
      <Overlay>
        {/* from behind: B on the left, A in the middle, C on the right */}
        <Boy id="B" x={PIC_W / 2 - 330 + 70 * crowd} y={base + 40} scale={sc} pose={{back: true, lean: 8 * crowd, headTilt: 6 * crowd, breath: (Math.sin(t * 2.4) + 1) / 2}} />
        <Boy id="C" x={PIC_W / 2 + 330 - 70 * crowd} y={base} scale={sc} pose={{back: true, lean: -8 * crowd, headTilt: -6 * crowd, breath: (Math.sin(t * 2.4 + 1) + 1) / 2}} />
        <Boy id="A" x={PIC_W / 2} y={base + 30} scale={sc} pose={{back: true, armR: {sh: -10 * up, el: -10 - 140 * up}, handR: up > 0.3 ? <SmallPhone /> : undefined, breath: 0.5}} />
      </Overlay>
    </>
  );
};
