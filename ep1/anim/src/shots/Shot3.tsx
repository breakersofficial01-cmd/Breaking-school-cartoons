// SHOT 3 — side-on tracking shot on the walkway. B and C walk and talk (lines 1–4).
// Quick close-up on B for line 1 (sparkle eyes) and on C's glasses glint in line 4.
import React from 'react';
import {Boy, Singara, Star, bodyGeom} from '../characters/Boy';
import type {Pose} from '../characters/Boy';
import {GIRLS, Girl} from '../characters/Girl';
import {FieldScene, GIRLS_Y, WALK_Y} from '../scenes/Scenes';
import type {Cam} from '../scenes/Scenes';
import {PIC_H, PIC_W} from '../config';
import {backOut, idle, keys, line, shot, tw} from '../anim';

export const CAST_SCALE = 0.78;
export const SPEED = 120; // px / s while walking
const S = shot(3);
const L1 = line('v01'), L2 = line('v02'), L3 = line('v03'), L4 = line('v04');

// Times of the action beats (seconds on the episode timeline)
export const BEAT = {
  bStop: L1.start - 0.6, // B freezes, snack halfway to mouth
  cStop: L1.start - 0.3,
  cu1In: L1.start - 0.3, // close-up on B
  cu1Out: L1.end + 0.2,
  pop: L2.end + 0.12, // sparkle pops, B deflates
  walk2: L3.start - 0.25, // both walk again during line 3
  stop2: L3.end + 0.1,
  cu4In: L4.start + 0.05, // close-up on C (glasses glint)
  glint: L4.start + 0.55,
  cu4Out: L4.start + 1.35,
};

// Distance walked by time t, given walking intervals [a, b].
const walked = (t: number, spans: [number, number][]) => spans.reduce((d, [a, b]) => d + Math.max(0, Math.min(t, b) - a), 0) * SPEED;
const walking = (t: number, spans: [number, number][]) => spans.some(([a, b]) => t >= a && t < b);

export const X0 = 900; // world x between B and C when shot 3 starts
export const fieldBlocking = (t: number) => {
  const bSpans: [number, number][] = [[S.start - 3, BEAT.bStop], [BEAT.walk2, BEAT.stop2]];
  const cSpans: [number, number][] = [[S.start - 3, BEAT.cStop], [BEAT.walk2, BEAT.stop2]];
  const base = X0 - 3 * SPEED;
  return {
    bx: base + walked(t, bSpans) + 120,
    cx: base + walked(t, cSpans) - 120,
    bWalk: walking(t, bSpans) ? (walked(t, bSpans) / (SPEED * 0.5)) * Math.PI : null,
    cWalk: walking(t, cSpans) ? (walked(t, cSpans) / (SPEED * 0.5)) * Math.PI + 1.2 : null,
  };
};

export const GirlsGroup: React.FC<{t: number; x?: number}> = ({t, x = 1330}) => (
  <g>
    {GIRLS.map((g, i) => (
      <Girl key={i} x={x + [-150, -50, 60, 160][i]} y={GIRLS_Y + [0, 12, 4, 14][i]} scale={0.5} spec={g} t={t} facing={i < 2 ? 1 : -1} />
    ))}
  </g>
);

export const Shot3: React.FC<{t: number}> = ({t}) => {
  const {bx, cx, bWalk, cWalk} = fieldBlocking(t);
  const gB = bodyGeom('B'), gC = bodyGeom('C');

  // ------------------------------------------------ B
  const sparkleOn = t >= BEAT.bStop + 0.1 && t < BEAT.pop;
  const deflate = tw(t, BEAT.pop, BEAT.pop + 0.35, 0, 1) * (1 - tw(t, BEAT.walk2 - 0.1, BEAT.walk2 + 0.2, 0, 1));
  const lift = tw(t, BEAT.bStop - 0.8, BEAT.bStop, -20, -88); // snack going up to the mouth...
  const drop = tw(t, BEAT.pop + 0.1, BEAT.pop + 0.5, 0, 1);
  const inL3 = t >= BEAT.walk2 - 0.1 && t < L4.start - 0.1;
  const fold = tw(t, BEAT.walk2 - 0.15, BEAT.walk2 + 0.2, 0, 1) * (1 - tw(t, L4.start - 0.3, L4.start, 0, 1));
  let bPose: Pose = {
    walk: bWalk,
    eyes: sparkleOn ? 'sparkle' : t >= BEAT.pop && t < BEAT.pop + 0.15 ? 'huge' : 'open',
    look: sparkleOn ? [-0.6, -0.6] : t > L4.start + 0.8 ? [1, 0.4] : [-0.3, 0],
    mouth: sparkleOn && t < L1.start ? 'O' : t >= BEAT.pop && !inL3 ? 'frown' : undefined,
    deflate,
    armR: {sh: 8 - 26 * fold, el: lift * (1 - drop) + -30 * drop - 95 * fold},
    armL: {sh: 8 - 26 * fold, el: -6 - 112 * fold},
    handR: <Singara />,
    sweat: tw(t, L4.start + 0.7, L4.start + 1.1, 0, 1),
    browTilt: t >= BEAT.pop ? 6 : 0,
    lean: sparkleOn ? -3 : 0,
  };
  if (inL3) {
    // chin up, eyes closed, shaking head like a wise old uncle
    bPose = {...bPose, eyes: 'closed', headTilt: Math.sin(t * 7) * 7, headY: -6, look: [0, 0]};
  }
  bPose = idle(t, 'B', bPose);
  if (t > L4.start + 0.8) bPose.headTilt = 8; // looks away, sweating

  // ------------------------------------------------ C
  const cuC = t >= BEAT.cu4In && t < BEAT.cu4Out;
  const push = keys(t, [[BEAT.glint - 0.35, 0], [BEAT.glint - 0.05, 1], [BEAT.glint + 0.45, 1], [BEAT.glint + 0.8, 0]]);
  let cPose: Pose = {
    walk: cWalk,
    eyes: t >= L2.start - 0.2 && t < L2.end + 0.3 ? 'half' : t >= L4.start - 0.2 && t < L4.end ? 'half' : 'open',
    look: t >= L4.start - 0.3 && t < L4.end + 0.5 ? [1, 0] : t >= L2.start && t < L2.end ? [-0.4, 0] : [0.2, 0],
    armR: {sh: 7 - 32 * push, el: -6 - 150 * push},
    glint: keys(t, [[BEAT.glint - 0.05, 0], [BEAT.glint + 0.08, 1], [BEAT.glint + 0.4, 0]]),
    brow: t >= L4.start - 0.2 && t < L4.end ? -4 : 0,
  };
  cPose = idle(t, 'C', cPose);

  // ------------------------------------------------ camera
  const mid = (bx + cx) / 2;
  const camY = WALK_Y - 440; // full-frame picture: feet near the bottom, sky + building above
  const cu1 = t >= BEAT.cu1In && t < BEAT.cu1Out;
  let cam: Cam = {x: mid, y: camY, z: 1};
  if (cu1) {
    const headY = WALK_Y + (gB.headCy + 40) * CAST_SCALE;
    cam = {x: bx, y: headY, z: tw(t, BEAT.cu1In, BEAT.cu1In + 0.25, 2.2, 2.7, backOut)};
  } else if (cuC) {
    const headY = WALK_Y + (gC.headCy + 20) * CAST_SCALE;
    cam = {x: cx + 10, y: headY, z: tw(t, BEAT.cu4In, BEAT.cu4Out, 2.5, 2.7)};
  }

  // sparkles around B in the close-up + the "pop"
  const popK = tw(t, BEAT.pop, BEAT.pop + 0.3, 0, 1);
  const bHeadScreen = {x: PIC_W / 2 + (bx - cam.x) * cam.z, y: PIC_H / 2 + (WALK_Y + gB.headCy * CAST_SCALE - cam.y) * cam.z};

  return (
    <>
      <FieldScene cam={cam} t={t} girls={<GirlsGroup t={t} />}>
        <Boy id="C" x={cx} y={WALK_Y} scale={CAST_SCALE} pose={cPose} />
        <Boy id="B" x={bx} y={WALK_Y} scale={CAST_SCALE} pose={bPose} />
      </FieldScene>
      <svg width={PIC_W} height={PIC_H} style={{position: 'absolute', inset: 0}}>
        {cu1
          ? [[-260, -140, 34], [250, -170, 26], [-300, 90, 22], [290, 60, 30], [0, -300, 24]].map(([dx, dy, r], i) => (
              <Star key={i} x={PIC_W / 2 + dx} y={PIC_H / 2 + dy} r={r * (0.6 + 0.4 * Math.abs(Math.sin(t * 8 + i)))} fill="#FFE45C" />
            ))
          : null}
        {popK > 0 && popK < 1
          ? Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const d = 95 + popK * 90; // starts outside B's head so the face stays clear
              return <Star key={i} x={bHeadScreen.x + Math.cos(a) * d} y={bHeadScreen.y + Math.sin(a) * d} r={16 * (1 - popK)} fill="#FFE45C" />;
            })
          : null}
      </svg>
    </>
  );
};
