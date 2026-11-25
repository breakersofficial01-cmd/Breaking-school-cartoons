// SHOTS 1, 2, 4, 5, 6, 7 on the 3D stage (3D Bangladeshi locations, 2D boys).
// Timing comes from the timeline (TL.lines / TL.cues). Acting follows the owner's
// reference video: close-ups of the speaker turned toward his partner, reaction
// shots, wide shots only for set-ups and physical comedy. World units: metres.
import React from 'react';
import {Singara, SmallPhone, Star, Boy} from '../characters/Boy';
import type {Pose} from '../characters/Boy';
import type {Cam3} from '../scenes3d/World3D';
import {project} from '../scenes3d/World3D';
import {INK, PIC_H, PIC_W} from '../config';
import {TL, backOut, idle, keys, line, shot, talking, tw} from '../anim';
import {fieldBlocking, wideCam} from './Shot3';
import {MCU, MCU_HEAD_Y, Stage, girlActors} from './stage';

const C = TL.cues;

const Overlay: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={PIC_W} height={PIC_H} style={{position: 'absolute', inset: 0}}>{children}</svg>
);

// ------------------------------------------------------------------ SHOT 1
// Low angle inside the school yard looking at the gate; B and C walk in from the street
// in slow motion toward the camera; slow push-in. Rickshaw + tea stall outside.
export const Shot1: React.FC<{t: number}> = ({t}) => {
  const S = shot(1);
  const k = (t - S.start) / (S.end - S.start);
  const z = -1.5 - 8.5 * k; // walking toward the camera (camera looks toward +z)
  const walk = t * 3.2; // slow-motion stride
  const cam: Cam3 = {pos: [0, 0.45, -17 + 1.2 * k], target: [0, 2.3, -6], fov: 52};
  return (
    <Stage world="gate" cam={cam} t={t} actors={[
      // camera looks toward +z, so +x is screen-LEFT: C at +x stays on the left
      {kind: 'boy', id: 'C', p: [0.55, 0, z], pose: idle(t, 'C', {walk, look: [0.2, -0.3]})},
      {kind: 'boy', id: 'B', p: [-0.55, 0, z + 0.05], pose: idle(t, 'B', {walk: walk + 1.4, handR: <Singara />, armR: {sh: 10 + Math.sin(walk) * 8, el: -40}, look: [0, -0.3]})},
    ]}>
      {/* sun flare + dust specks */}
      <Overlay>
        <defs><radialGradient id="sunf"><stop offset="0" stopColor="#fffbe8" /><stop offset="0.3" stopColor="#fff2b0" stopOpacity={0.8} /><stop offset="1" stopColor="#fff2b0" stopOpacity={0} /></radialGradient></defs>
        <circle cx={760} cy={150} r={280} fill="url(#sunf)" />
        {Array.from({length: 24}).map((_, i) => (
          <circle key={i} cx={(i * 173 + t * (12 + (i % 5) * 6)) % PIC_W} cy={(i * 97 + Math.sin(t * 0.8 + i) * 30 + 200) % PIC_H} r={2 + (i % 3)} fill="#FFF6D5" opacity={0.6} />
        ))}
      </Overlay>
    </Stage>
  );
};

// ------------------------------------------------------------------ SHOT 2
// Wide of the field with a slight pan: the girls chat; B and C enter frame left.
export const Shot2: React.FC<{t: number}> = ({t}) => {
  const S = shot(2);
  const {bx, cx, bWalk, cWalk} = fieldBlocking(t);
  const x = tw(t, S.start, S.end, 6.6, 6.9);
  const cam: Cam3 = {pos: [x, 2.4, 10.5], target: [x, 1.0, -6], fov: 42};
  return (
    <Stage world="field" cam={cam} t={t} actors={[
      ...girlActors(),
      {kind: 'boy', id: 'C', p: [cx, 0, 0], pose: idle(t, 'C', {walk: cWalk})},
      {kind: 'boy', id: 'B', p: [bx, 0, 0.05], pose: idle(t, 'B', {walk: bWalk, handR: <Singara />, armR: {sh: 8, el: -30}})},
    ]} />
  );
};

// Where B and C stand after shot 3; A lands between them.
const END3 = fieldBlocking(shot(3).end);
const MID = (END3.bx + END3.cx) / 2;
const POS = {a: MID, b: END3.bx, c: END3.cx};

const shake = (t: number, at: number, amp = 0.06, dur = 0.45) => {
  const d = t - at;
  if (d < 0 || d > dur) return [0, 0];
  const a = amp * (1 - d / dur);
  return [Math.sin(d * 70) * a, Math.cos(d * 55) * a * 0.6];
};

// ------------------------------------------------------------------ SHOT 4
// Same walkway, camera stops. A runs in, skids (dust puff), arm round both; line 5.
export const Shot4: React.FC<{t: number}> = ({t}) => {
  const L5 = line('v05');
  const arrive = C.skid, stop = C.skid + 0.3;
  const ax = keys(t, [[C.whoosh, MID + 5], [arrive, MID + 0.5], [stop, MID]], (v) => v);
  const running = t >= C.whoosh && t < arrive;
  const skidding = t >= arrive && t < stop + 0.1;
  const hug = t < L5.end + 0.2 ? tw(t, stop, stop + 0.25, 0, 1) : 0;
  const scared = t >= C.fataibo - 0.1 && t < C.fataibo + 0.7;
  const lookA = t >= C.skid - 0.2;
  const runArm = (s: number) => ({sh: 30 + s * Math.sin(t * 16) * 30, el: -60});
  const armRest = {sh: 7 + 66 * hug, el: -6 - 4 * hug};
  const aPose: Pose = idle(t, 'A', {
    walk: running ? t * 16 : null,
    lean: running ? -14 : skidding ? 12 : 0,
    armL: running ? runArm(1) : skidding ? {sh: 80, el: -40} : armRest,
    armR: running ? runArm(-1) : skidding ? {sh: 80, el: -40} : armRest,
    eyes: scared ? 'huge' : 'open',
    brow: scared ? 8 : 2,
    browTilt: scared ? 0 : -4,
    mouth: talking(t, 'A') ? undefined : 'grin',
  });
  const bPose = idle(t, 'B', {look: lookA ? [-1, 0] : [1, 0.4], turn: lookA ? -0.45 : 0.4, eyes: scared ? 'huge' : 'open', sweat: scared ? 1 : 0.4, browTilt: 8, handR: <Singara />, armR: {sh: 8, el: -30}});
  const cPose = idle(t, 'C', {look: lookA ? [1, 0] : [0.2, 0], turn: lookA ? 0.45 : 0, eyes: scared ? 'huge' : 'half'});
  const punch = tw(t, C.fataibo, C.fataibo + 0.12, 0, 0.5) - tw(t, C.fataibo + 0.3, C.fataibo + 0.7, 0, 0.5);
  const [sx, sy] = shake(t, C.fataibo);
  const base = wideCam(MID, 4.8 - punch);
  const cam: Cam3 = {...base, pos: [base.pos[0] + sx, base.pos[1] + sy, base.pos[2]], target: [base.target[0] + sx, base.target[1] + sy, 0]};
  const feet = project(cam, [ax, 0, 0.1]);
  const puff = tw(t, C.skid, C.skid + 0.6, 0, 1, (v) => v);
  return (
    <Stage world="field" cam={cam} t={t} actors={[
      ...girlActors(),
      {kind: 'boy', id: 'C', p: [POS.c, 0, 0], pose: cPose},
      {kind: 'boy', id: 'B', p: [POS.b, 0, 0], pose: bPose},
      {kind: 'boy', id: 'A', p: [ax, 0, 0.1], pose: aPose},
    ]}>
      <Overlay>
        {puff > 0 && puff < 1
          ? [0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={feet.x + 50 + i * 22 + puff * 40} cy={feet.y - 8 - i * 5 - puff * 26} r={(12 + puff * 22 + i * 3) * (feet.pxPerM / 250)} fill="#E7D6B8" stroke={INK} strokeWidth={3} opacity={1 - puff} />
            ))
          : null}
        {running ? [0, 1, 2].map((i) => <line key={i} x1={feet.x + 80} y1={feet.y - 300 + i * 70} x2={feet.x + 250} y2={feet.y - 300 + i * 70} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.85} />) : null}
      </Overlay>
    </Stage>
  );
};

// ------------------------------------------------------------------ SHOT 5
// Close-ups of each speaker (lines 6 C, 7 B, 8 A) and a three-shot for the "really?" look.
export const Shot5: React.FC<{t: number}> = ({t}) => {
  const L6 = line('v06'), L7 = line('v07'), L8 = line('v08');
  const really = t >= L6.end && t < L7.start; // A and B give C a "really?" look
  const push = keys(t, [[L6.start + 0.2, 0], [L6.start + 0.5, 1], [L6.end - 0.1, 1], [L6.end + 0.2, 0]]);
  const cPose = idle(t, 'C', {
    eyes: 'half',
    turn: 0.5,
    browTilt: really ? 4 : 0,
    armR: {sh: 7 - 32 * push, el: -6 - 150 * push},
    glint: keys(t, [[L6.start + 0.45, 0], [L6.start + 0.55, 0.7], [L6.start + 0.9, 0]]),
  });
  if (really) cPose.mouth = 'closed';

  // B: proud, hand on chest, then a big bite of the singara
  const proud = t >= L7.start - 0.1 && t < C.bite - 0.5;
  const toMouth = keys(t, [[C.bite - 0.5, 0], [C.bite - 0.05, 1], [C.bite + 0.25, 1], [C.bite + 0.6, 0]]);
  const chewing = t >= C.bite && t < C.bite + 1.2;
  const bPose = idle(t, 'B', {
    turn: really ? -0.6 : -0.45,
    eyes: really ? 'half' : proud && t > L7.start + 0.4 ? 'closed' : 'open',
    browTilt: really ? -6 : 0,
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
    turn: really ? -0.5 : 0,
    eyes: really ? 'half' : 'open',
    brow: really ? 8 : 0,
    browTilt: really ? -6 : -3,
    armL: tap ? {sh: -14 + bounce * 0.3, el: -128 + bounce} : {sh: 7, el: -6},
    wink: t >= C.ding && t < C.ding + 0.6,
    mouth: talking(t, 'A') ? undefined : really ? 'smirk' : 'sly',
  });

  if (t < L6.end + 0.1) return <MCU id="C" pose={cPose} t={t} at={[POS.c, 0, 0]} />;
  if (really) {
    return (
      <Stage world="field" cam={wideCam(MID, 4.0)} t={t} actors={[
        ...girlActors(),
        {kind: 'boy', id: 'C', p: [POS.c - 0.1, 0, 0], pose: cPose},
        {kind: 'boy', id: 'B', p: [POS.b + 0.1, 0, 0], pose: bPose},
        {kind: 'boy', id: 'A', p: [POS.a, 0, -0.1], pose: aPose},
      ]} />
    );
  }
  if (t < L8.start - 0.1) return <MCU id="B" pose={bPose} t={t} at={[POS.b, 0, 0]} />;
  const ding = tw(t, C.ding, C.ding + 0.5, 0, 1, (v) => v);
  return (
    <MCU id="A" pose={aPose} t={t} at={[POS.a, 0, 0]}>
      {ding > 0 && ding < 1 ? (
        <g>
          <Star x={PIC_W / 2 + 230} y={MCU_HEAD_Y - 150} r={80 * Math.sin(ding * Math.PI)} fill="#FFE45C" />
          <Star x={PIC_W / 2 + 320} y={MCU_HEAD_Y - 60} r={38 * Math.sin(ding * Math.PI)} fill="#fff" />
        </g>
      ) : null}
    </MCU>
  );
};

// ------------------------------------------------------------------ SHOT 6
// Fast dolly-in on the three: B and C lean in to A and beg (line 9).
export const Shot6: React.FC<{t: number}> = ({t}) => {
  const S = shot(6);
  const lean = tw(t, S.start, S.start + 0.3, 0, 1, backOut);
  const beg: Pose = {armL: {sh: -12, el: -120}, armR: {sh: -12, el: -120}, browTilt: 10, eyes: 'huge'};
  const bPose = idle(t, 'B', {...beg, lean: -6 * lean, turn: -0.5, handR: <Singara bitten />});
  const cPose = idle(t, 'C', {...beg, lean: 6 * lean, turn: 0.5});
  const aPose = idle(t, 'A', {mouth: 'sly', brow: 4, browTilt: -5});
  const d = tw(t, S.start, S.start + 0.4, 4.4, 2.7, backOut);
  const cam: Cam3 = {pos: [MID + Math.sin(t * 40) * 0.01, 1.15 + (4.4 - d) * 0.08, d], target: [MID, 1.05 + (4.4 - d) * 0.12, 0], fov: 40};
  return (
    <Stage world="field" cam={cam} t={t} actors={[
      ...girlActors(),
      {kind: 'boy', id: 'A', p: [POS.a, 0, -0.15], pose: aPose},
      {kind: 'boy', id: 'C', p: [POS.c - 0.1, 0, 0], pose: cPose},
      {kind: 'boy', id: 'B', p: [POS.b + 0.1, 0, 0], pose: bPose},
    ]} />
  );
};

// ------------------------------------------------------------------ SHOT 7
// Over-the-shoulder from behind the three: A pulls the phone out, heads crowd in.
export const Shot7: React.FC<{t: number}> = ({t}) => {
  const S = shot(7);
  const up = tw(t, C.rustle, C.rustle + 0.6, 0, 1, backOut);
  const crowd = tw(t, C.rustle + 0.4, C.rustle + 1.0, 0, 1);
  const k = (t - S.start) / (S.end - S.start);
  const base = PIC_H + 330; // feet below the frame: we see heads and shoulders
  const sc = 1.45;
  const bg: Cam3 = {pos: [MID, 1.7, 2.6 - 0.3 * k], target: [MID, 1.3, -10], fov: 50};
  return (
    <>
      <Stage world="field" cam={bg} t={t} actors={girlActors()} blur={5} />
      <Overlay>
        {/* from behind: B on the left, A in the middle, C on the right */}
        <Boy id="B" x={PIC_W / 2 - 330 + 70 * crowd} y={base + 40} scale={sc} pose={{back: true, lean: 8 * crowd, headTilt: 6 * crowd, breath: (Math.sin(t * 2.4) + 1) / 2}} />
        <Boy id="C" x={PIC_W / 2 + 330 - 70 * crowd} y={base} scale={sc} pose={{back: true, lean: -8 * crowd, headTilt: -6 * crowd, breath: (Math.sin(t * 2.4 + 1) + 1) / 2}} />
        <Boy id="A" x={PIC_W / 2} y={base + 30} scale={sc} pose={{back: true, armR: {sh: -10 * up, el: -10 - 140 * up}, handR: up > 0.3 ? <SmallPhone /> : undefined, breath: 0.5}} />
      </Overlay>
    </>
  );
};
