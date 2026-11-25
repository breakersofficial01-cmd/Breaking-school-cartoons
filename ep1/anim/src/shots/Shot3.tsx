// SHOT 3 — B and C on the walkway, lines 1–4. 3D world, 2D boys (see stage.tsx).
// Acting/camera follow the owner's reference video (2026-11-25):
//   * shot / reverse-shot: each line cuts to a medium close-up (MCU) of the speaker,
//     turned 3/4 toward whoever he talks to, on a soft blurred background;
//   * reaction shots: the listener's face while the other one's voice continues;
//   * a wide two-shot only to set up the scene and while they walk (line 3), where
//     the listener turns his head to the speaker.
// Screen geography: C on the LEFT, B on the RIGHT, the girls ahead to the right.
// World units are metres (walkway along +x at z = 0).
import React from 'react';
import {Singara, Star} from '../characters/Boy';
import type {Pose} from '../characters/Boy';
import type {Cam3} from '../scenes3d/World3D';
import {idle, keys, line, shot, tw} from '../anim';
import {MCU, MCU_HEAD_Y, Stage, girlActors, mcuHeadX} from './stage';

export const SPEED = 0.55; // m / s while walking
export const GAP = 0.55; // half the distance between B and C
const S = shot(3);
const L1 = line('v01'), L2 = line('v02'), L3 = line('v03'), L4 = line('v04');

// Times of the action beats (seconds on the episode timeline)
export const BEAT = {
  bStop: L1.start - 0.6, // B freezes, snack halfway to mouth
  cStop: L1.start - 0.3,
  cu1In: L1.start - 0.3, // MCU on B
  cu2In: L1.end + 0.2, // MCU on C (line 2)
  pop: L2.end + 0.12, // sparkle pops, B deflates
  walk2: L3.start - 0.25, // both walk again during line 3
  stop2: L3.end + 0.1,
  cu4In: L4.start - 0.05, // MCU on C (line 4, glasses glint)
  glint: L4.start + 0.55,
  react4: L4.start + 1.25, // reaction MCU on B while C keeps talking
};

const walked = (t: number, spans: [number, number][]) => spans.reduce((d, [a, b]) => d + Math.max(0, Math.min(t, b) - a), 0) * SPEED;
const walking = (t: number, spans: [number, number][]) => spans.some(([a, b]) => t >= a && t < b);

export const X0 = 4.0; // world x between B and C when shot 3 starts
export const fieldBlocking = (t: number) => {
  const bSpans: [number, number][] = [[S.start - 4, BEAT.bStop], [BEAT.walk2, BEAT.stop2]];
  const cSpans: [number, number][] = [[S.start - 4, BEAT.cStop], [BEAT.walk2, BEAT.stop2]];
  const base = X0 - 4 * SPEED;
  return {
    bx: base + walked(t, bSpans) + GAP,
    cx: base + walked(t, cSpans) - GAP,
    bWalk: walking(t, bSpans) ? (walked(t, bSpans) / 0.32) * Math.PI : null,
    cWalk: walking(t, cSpans) ? (walked(t, cSpans) / 0.32) * Math.PI + 1.2 : null,
  };
};

// wide two-shot camera on the walkway
export const wideCam = (mid: number, dist = 4.6): Cam3 => ({pos: [mid, 1.1, dist], target: [mid, 1.0, 0], fov: 40});

export const Shot3: React.FC<{t: number}> = ({t}) => {
  const {bx, cx, bWalk, cWalk} = fieldBlocking(t);

  // ------------------------------------------------ B
  const sparkleOn = t >= BEAT.bStop + 0.1 && t < BEAT.pop;
  const deflate = tw(t, BEAT.pop, BEAT.pop + 0.35, 0, 1) * (1 - tw(t, BEAT.walk2 - 0.1, BEAT.walk2 + 0.2, 0, 1));
  const lift = tw(t, BEAT.bStop - 0.8, BEAT.bStop, -20, -88); // snack going up to the mouth... and freezes
  const drop = tw(t, BEAT.pop + 0.1, BEAT.pop + 0.5, 0, 1);
  const inL3 = t >= BEAT.walk2 - 0.1 && t < L4.start - 0.1;
  const fold = tw(t, BEAT.walk2 - 0.15, BEAT.walk2 + 0.2, 0, 1) * (1 - tw(t, L4.start - 0.3, L4.start, 0, 1));
  let bPose: Pose = {
    walk: bWalk,
    eyes: sparkleOn ? 'sparkle' : t >= BEAT.pop && t < BEAT.pop + 0.15 ? 'huge' : 'open',
    look: sparkleOn ? [0.6, -0.5] : [0, 0],
    mouth: sparkleOn && t < L1.start ? 'O' : t >= BEAT.pop && !inL3 ? 'frown' : undefined,
    deflate,
    armR: {sh: 8 - 26 * fold, el: lift * (1 - drop) + -30 * drop - 95 * fold},
    armL: {sh: 8 - 26 * fold, el: -6 - 112 * fold},
    handR: <Singara />,
    browTilt: t >= BEAT.pop ? 8 : 0,
    // looks at the girls (right), then at C (left) after the pop
    turn: sparkleOn ? 0.55 : t >= BEAT.pop && t < BEAT.walk2 ? -0.5 : 0,
  };
  if (inL3) {
    // fake-preachy uncle: chin up, eyes closed, shaking head, half turned to C
    bPose = {...bPose, eyes: 'closed', headTilt: Math.sin(t * 7) * 7, headY: -6, look: [0, 0], turn: -0.25, browTilt: -2, brow: 6};
  }
  bPose = idle(t, 'B', bPose);
  if (t >= BEAT.react4) {
    // caught: sweats, turns away from C, eyes dart
    bPose = {...bPose, turn: 0.6, look: [1, Math.sin(t * 5) > 0 ? 0.4 : -0.2], sweat: tw(t, BEAT.react4, BEAT.react4 + 0.3, 0, 1), browTilt: 10, mouth: 'frown', headTilt: 6};
  }

  // ------------------------------------------------ C
  const push = keys(t, [[BEAT.glint - 0.35, 0], [BEAT.glint - 0.05, 1], [BEAT.glint + 0.45, 1], [BEAT.glint + 0.8, 0]]);
  let cPose: Pose = {
    walk: cWalk,
    // line 2: bored, doesn't even look; line 3: sceptical side-eye at B; line 4: sly, knowing
    eyes: t >= L2.start - 0.2 && t < L2.end + 0.3 ? 'half' : inL3 ? 'half' : t >= L4.start - 0.2 ? 'half' : 'open',
    look: inL3 ? [1, 0] : [0, 0],
    turn: t >= L2.start - 0.3 && t < L2.end + 0.2 ? -0.15 : inL3 ? 0.55 : t >= L4.start - 0.3 ? 0.6 : 0.2,
    browTilt: inL3 ? -5 : t >= L4.start - 0.2 ? -7 : 0,
    brow: t >= L4.start - 0.2 ? -3 : 0,
    armR: {sh: 7 - 32 * push, el: -6 - 150 * push},
    glint: keys(t, [[BEAT.glint - 0.05, 0], [BEAT.glint + 0.08, 1], [BEAT.glint + 0.4, 0]]),
  };
  cPose = idle(t, 'C', cPose);
  if (inL3 && !cPose.mouth) cPose.mouth = 'smirk';
  if (t >= L4.end && t < S.end) cPose.mouth = 'sly';

  // ------------------------------------------------ camera: which view?
  const view =
    t < BEAT.cu1In ? 'wide' :
    t < BEAT.cu2In ? 'mcuB1' :
    t < BEAT.pop - 0.05 ? 'mcuC2' :
    t < BEAT.walk2 - 0.1 ? 'mcuBpop' :
    t < BEAT.cu4In ? 'wide' :
    t < BEAT.react4 ? 'mcuC4' : 'mcuB4';

  if (view === 'wide') {
    return (
      <Stage world="field" cam={wideCam((bx + cx) / 2)} t={t} actors={[
        ...girlActors(),
        {kind: 'boy', id: 'C', p: [cx, 0, 0], pose: cPose},
        {kind: 'boy', id: 'B', p: [bx, 0, 0.05], pose: bPose},
      ]} />
    );
  }
  if (view === 'mcuC2' || view === 'mcuC4') return <MCU id="C" pose={cPose} t={t} at={[cx, 0, 0]} />;

  // B close-ups: sparkles while dreaming, a star burst when the sparkle pops
  const hx = mcuHeadX(bPose.turn ?? 0);
  const popK = tw(t, BEAT.pop, BEAT.pop + 0.3, 0, 1);
  return (
    <MCU id="B" pose={bPose} t={t} at={[bx, 0, 0]}>
      {view === 'mcuB1'
        ? [[-250, -140, 34], [260, -170, 26], [-300, 90, 22], [300, 60, 30], [10, -300, 24]].map(([dx, dy, r], i) => (
            <Star key={i} x={hx + dx} y={MCU_HEAD_Y + dy} r={r * (0.6 + 0.4 * Math.abs(Math.sin(t * 8 + i)))} fill="#FFE45C" />
          ))
        : null}
      {view === 'mcuBpop' && popK > 0 && popK < 1
        ? Array.from({length: 8}).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const d = 230 + popK * 120;
            return <Star key={i} x={hx + Math.cos(a) * d} y={MCU_HEAD_Y + Math.sin(a) * d * 0.8} r={26 * (1 - popK)} fill="#FFE45C" />;
          })
        : null}
    </MCU>
  );
};
