// Rigged schoolboy (A, B, C). Geometry, colours and proportions are ported
// from ep1/reference/characters.js. Every part is separate and posable:
// legs, shorts, torso (breathing), arms with shoulder + elbow pivots, head,
// eyes (open/half/closed/huge/sparkle), brows, 5 mouth shapes + expressions.
//
// Coordinates: origin = between the feet on the ground, y goes up negative.
// Arm angles use an "outward" convention for both sides (degrees):
//   shoulder +  = arm swings away from the body, - = across the body
//   elbow    -  = forearm folds up toward the chest.
import React from 'react';
import {INK, SW} from '../config';

export type CharId = 'A' | 'B' | 'C';
export type Mouth = 'closed' | 'small' | 'medium' | 'wide' | 'O' | 'grin' | 'frown' | 'smirk';
export type Eyes = 'open' | 'half' | 'closed' | 'huge' | 'sparkle' | 'happy';
export type Arm = {sh: number; el: number};

export type Pose = {
  mouth?: Mouth;
  eyes?: Eyes;
  look?: [number, number]; // pupil offset, -1..1
  brow?: number; // +up / -down (px)
  browTilt?: number; // + = worried, - = angry
  headTilt?: number; // deg
  headX?: number;
  headY?: number;
  bob?: number; // upper-body y offset
  lean?: number; // deg, around the feet
  breath?: number; // 0..1 torso scale (1 = +1.8%)
  walk?: number | null; // walk phase in radians (null = standing)
  armL?: Arm;
  armR?: Arm;
  handL?: React.ReactNode; // item drawn in the left hand
  handR?: React.ReactNode;
  sweat?: number; // 0..1
  blush?: number; // 0..1
  glint?: number; // 0..1 glasses glint
  deflate?: number; // 0..1 sag
  stretch?: number; // vertical squash/stretch, 1 = normal
};

type Spec = {
  skin: string; skinShade: string; headRx: number; headRy: number; torsoW: number; torsoH: number;
  shortsH: number; legL: number; legW: number; hair: 'spiky' | 'bowl' | 'side'; glasses?: boolean;
  eyeR: number; brows: 'raised' | 'normal' | 'thick'; belly?: number; bag?: boolean; untucked?: boolean;
  cheeks?: boolean; rest: Mouth;
};

export const SPECS: Record<CharId, Spec> = {
  A: {skin: '#C98B5B', skinShade: '#A86F44', headRx: 92, headRy: 104, torsoW: 128, torsoH: 168, shortsH: 92, legL: 150, legW: 30, hair: 'spiky', brows: 'raised', untucked: true, eyeR: 24, rest: 'grin'},
  B: {skin: '#B9784A', skinShade: '#955D35', headRx: 112, headRy: 104, torsoW: 170, torsoH: 150, shortsH: 92, legL: 92, legW: 38, hair: 'bowl', brows: 'normal', belly: 22, cheeks: true, eyeR: 20, rest: 'small'},
  C: {skin: '#D49A69', skinShade: '#B27A4C', headRx: 94, headRy: 108, torsoW: 140, torsoH: 162, shortsH: 92, legL: 128, legW: 30, hair: 'side', brows: 'thick', glasses: true, bag: true, eyeR: 21, rest: 'smirk'},
};

const SHOE_H = 20, SOCK_H = 34;

// Key heights for a character (used to frame close-ups).
export const bodyGeom = (id: CharId) => {
  const s = SPECS[id];
  const legTop = -(SHOE_H + SOCK_H + s.legL);
  const shortsBottom = legTop + 6;
  const shortsTop = shortsBottom - s.shortsH;
  const shirtBottom = shortsTop + (s.untucked ? 26 : 12);
  const shirtTop = shirtBottom - s.torsoH;
  const headCy = shirtTop - s.headRy * 0.82;
  return {legTop, shortsBottom, shortsTop, shirtBottom, shirtTop, headCy, top: headCy - s.headRy * 1.3};
};

// ---------------------------------------------------------------- hair
const Hair: React.FC<{kind: Spec['hair']; rx: number; ry: number}> = ({kind, rx, ry}) => {
  if (kind === 'spiky') {
    const pts: string[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      const r = i % 2 === 0 ? 1.0 : 1.26;
      pts.push(`${(Math.cos(a) * rx * r * 1.04).toFixed(1)} ${(Math.sin(a) * ry * r - ry * 0.08).toFixed(1)}`);
    }
    return <path d={`M ${-rx - 4} ${-ry * 0.05} L ${pts.join(' L ')} L ${rx + 4} ${-ry * 0.05} Q ${rx * 0.4} ${-ry * 0.5} 0 ${-ry * 0.42} Q ${-rx * 0.5} ${-ry * 0.5} ${-rx - 4} ${-ry * 0.05} Z`} fill="#141414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />;
  }
  if (kind === 'bowl') {
    return (
      <g>
        <path d={`M ${-rx - 6} ${-ry * 0.02} Q ${-rx - 10} ${-ry * 1.18} 0 ${-ry * 1.12} Q ${rx + 10} ${-ry * 1.18} ${rx + 6} ${-ry * 0.02} L ${rx * 0.75} ${-ry * 0.3} L ${rx * 0.45} ${-ry * 0.36} L ${rx * 0.15} ${-ry * 0.3} L ${-rx * 0.15} ${-ry * 0.36} L ${-rx * 0.45} ${-ry * 0.3} L ${-rx * 0.75} ${-ry * 0.36} Z`} fill="#141414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d={`M ${-rx * 0.4} ${-ry * 0.9} q 30 -16 60 -6`} fill="none" stroke="#444" strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <path d={`M ${-rx - 6} ${ry * 0.05} Q ${-rx - 14} ${-ry * 1.2} ${rx * 0.1} ${-ry * 1.14} Q ${rx + 18} ${-ry * 1.05} ${rx + 6} 0 Q ${rx * 0.8} ${-ry * 0.55} ${rx * 0.25} ${-ry * 0.6} Q ${-rx * 0.2} ${-ry * 0.68} ${-rx * 0.35} ${-ry * 0.45} Q ${-rx * 0.6} ${-ry * 0.55} ${-rx - 6} ${ry * 0.05} Z`} fill="#141414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M ${-rx * 0.35} ${-ry * 0.95} Q ${-rx * 0.3} ${-ry * 0.7} ${-rx * 0.35} ${-ry * 0.47}`} fill="none" stroke="#555" strokeWidth={4} />
      <path d={`M 0 ${-ry} q 40 -6 70 30`} fill="none" stroke="#444" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

// ---------------------------------------------------------------- mouth
export const MouthShape: React.FC<{m: Mouth; y: number}> = ({m, y}) => {
  const st = {stroke: INK, strokeWidth: 4.5, strokeLinejoin: 'round' as const};
  switch (m) {
    case 'closed':
      return <path d={`M -18 ${y} Q 0 ${y + 10} 18 ${y}`} fill="none" {...st} strokeWidth={5} strokeLinecap="round" />;
    case 'smirk':
      return <path d={`M -20 ${y + 4} Q 6 ${y + 12} 24 ${y - 6}`} fill="none" {...st} strokeWidth={5} strokeLinecap="round" />;
    case 'frown':
      return <path d={`M -20 ${y + 10} Q 0 ${y - 4} 20 ${y + 10}`} fill="none" {...st} strokeWidth={5} strokeLinecap="round" />;
    case 'small':
      return <ellipse cx={0} cy={y + 3} rx={13} ry={7} fill="#5a1717" {...st} />;
    case 'medium':
      return (
        <g>
          <path d={`M -22 ${y - 2} Q 0 ${y - 6} 22 ${y - 2} Q 18 ${y + 22} 0 ${y + 22} Q -18 ${y + 22} -22 ${y - 2} Z`} fill="#5a1717" {...st} />
          <path d={`M -10 ${y + 15} q 10 -6 20 0 q -10 6 -20 0`} fill="#e2625a" />
        </g>
      );
    case 'wide':
      return (
        <g>
          <path d={`M -32 ${y - 6} Q 0 ${y - 10} 32 ${y - 6} Q 26 ${y + 34} 0 ${y + 34} Q -26 ${y + 34} -32 ${y - 6} Z`} fill="#5a1717" {...st} />
          <path d={`M -26 ${y - 4} L 26 ${y - 4} L 23 ${y + 5} L -23 ${y + 5} Z`} fill="#fff" />
          <path d={`M -13 ${y + 25} q 13 -9 26 0 q -13 8 -26 0`} fill="#e2625a" />
        </g>
      );
    case 'O':
      return (
        <g>
          <ellipse cx={0} cy={y + 6} rx={14} ry={18} fill="#5a1717" {...st} />
          <path d={`M -8 ${y + 16} q 8 -5 16 0 q -8 5 -16 0`} fill="#e2625a" />
        </g>
      );
    case 'grin':
    default:
      return (
        <g>
          <path d={`M -34 ${y - 6} Q 0 ${y + 34} 34 ${y - 6} Z`} fill="#5a1717" {...st} />
          <path d={`M -28 ${y - 3} L 28 ${y - 3} L 24 ${y + 6} L -24 ${y + 6} Z`} fill="#fff" />
          <path d={`M -12 ${y + 18} q 12 -8 24 0 q -12 8 -24 0`} fill="#e2625a" />
        </g>
      );
  }
};

// ---------------------------------------------------------------- eyes
export const Star: React.FC<{x: number; y: number; r: number; fill?: string}> = ({x, y, r, fill = '#fff'}) => (
  <path d={`M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`} fill={fill} />
);

const Eye: React.FC<{x: number; y: number; r: number; state: Eyes; look: [number, number]; skin: string}> = ({x, y, r, state, look, skin}) => {
  if (state === 'closed') return <path d={`M ${x - r} ${y + 2} Q ${x} ${y + r * 0.7} ${x + r} ${y + 2}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
  if (state === 'happy') return <path d={`M ${x - r} ${y + 6} Q ${x} ${y - r * 0.9} ${x + r} ${y + 6}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
  const k = state === 'huge' || state === 'sparkle' ? 1.35 : 1;
  const rx = r * k, ry = r * 1.15 * k;
  const px = x + 4 + look[0] * r * 0.42, py = y + 4 + look[1] * r * 0.4;
  const pr = r * (state === 'sparkle' ? 0.62 : state === 'huge' ? 0.3 : 0.42);
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={4} />
      {state === 'sparkle' ? (
        <g>
          <circle cx={x + look[0] * 3} cy={y + 2} r={pr} fill="#2b1a10" />
          <Star x={x - 3 + look[0] * 3} y={y - 4} r={pr * 0.75} />
          <circle cx={x + 7} cy={y + 9} r={pr * 0.2} fill="#fff" />
        </g>
      ) : (
        <g>
          <circle cx={px} cy={py} r={pr} fill={INK} />
          <circle cx={px + 3} cy={py - 4} r={r * 0.13} fill="#fff" />
        </g>
      )}
      {state === 'half' ? <path d={`M ${x - rx - 2} ${y + 2} L ${x - rx - 2} ${y - ry - 3} L ${x + rx + 2} ${y - ry - 3} L ${x + rx + 2} ${y + 2} Q ${x} ${y - 4} ${x - rx - 2} ${y + 2} Z`} fill={skin} stroke={INK} strokeWidth={4} /> : null}
    </g>
  );
};

// ---------------------------------------------------------------- head
export const Head: React.FC<{id: CharId; pose: Pose}> = ({id, pose}) => {
  const s = SPECS[id];
  const {headRx: rx, headRy: ry} = s;
  const eyes = pose.eyes ?? 'open';
  const look = pose.look ?? [0, 0];
  const ey = -ry * 0.05, ex = rx * 0.36;
  const by = ey - s.eyeR * 1.35 - (s.glasses ? 10 : 0) - (pose.brow ?? 0) - (eyes === 'huge' || eyes === 'sparkle' ? 8 : 0);
  const bt = pose.browTilt ?? 0;
  const my = ry * 0.48;
  const mouth = pose.mouth ?? s.rest;
  const blush = Math.min(1, (s.cheeks ? 0.45 : 0) + (pose.blush ?? 0) * 0.5);
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse cx={side * (rx - 2)} cy={6} rx={13} ry={18} fill={s.skin} stroke={INK} strokeWidth={SW} />
          <path d={`M ${side * (rx - 2)} -2 q ${side * 6} 8 0 16`} fill="none" stroke={s.skinShade} strokeWidth={4} />
        </g>
      ))}
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={s.skin} stroke={INK} strokeWidth={SW} />
      {/* simple cel shade on the right side of the face */}
      <path d={`M ${rx * 0.55} ${-ry * 0.75} Q ${rx * 1.0} 0 ${rx * 0.5} ${ry * 0.86} Q ${rx * 0.82} 0 ${rx * 0.55} ${-ry * 0.75} Z`} fill={s.skinShade} opacity={0.35} />
      {blush > 0 ? (
        <g opacity={blush}>
          <ellipse cx={-rx * 0.55} cy={ry * 0.32} rx={16} ry={9} fill="#E0735A" />
          <ellipse cx={rx * 0.55} cy={ry * 0.32} rx={16} ry={9} fill="#E0735A" />
        </g>
      ) : null}
      <Hair kind={s.hair} rx={rx} ry={ry} />
      {[-1, 1].map((side) => <Eye key={side} x={side * ex} y={ey} r={s.eyeR} state={eyes} look={look} skin={s.skin} />)}
      {s.glasses ? (
        <g fill="none" stroke={INK} strokeWidth={5}>
          {[-1, 1].map((side) => <rect key={side} x={side * ex - s.eyeR - 8} y={ey - s.eyeR - 8} width={s.eyeR * 2 + 16} height={s.eyeR * 2.3 + 12} rx={12} fill="#bfe3ff" fillOpacity={0.25} />)}
          <path d={`M ${-ex + s.eyeR + 8} ${ey - 2} q ${ex - s.eyeR - 8} -8 ${2 * (ex - s.eyeR - 8)} 0`} />
          <line x1={-ex - s.eyeR - 8} y1={ey - 6} x2={-rx + 4} y2={ey - 10} />
          <line x1={ex + s.eyeR + 8} y1={ey - 6} x2={rx - 4} y2={ey - 10} />
          {(pose.glint ?? 0) > 0 ? (
            <g opacity={pose.glint} stroke="none">
              <path d={`M ${-ex - 14} ${ey + 14} L ${-ex + 8} ${ey - 20} L ${-ex + 16} ${ey - 20} L ${-ex - 6} ${ey + 14} Z`} fill="#fff" />
              <path d={`M ${ex - 14} ${ey + 14} L ${ex + 8} ${ey - 20} L ${ex + 16} ${ey - 20} L ${ex - 6} ${ey + 14} Z`} fill="#fff" />
              <Star x={ex + 22} y={ey - 26} r={28 * (pose.glint ?? 0)} />
            </g>
          ) : null}
        </g>
      ) : null}
      {s.brows === 'thick' ? (
        <g stroke={INK} strokeWidth={10} strokeLinecap="round">
          <path d={`M ${-ex - 18} ${by + 2 + bt * 0.5} L ${-ex + 16} ${by - 4 - bt}`} />
          <path d={`M ${ex - 16} ${by - 4 - bt} L ${ex + 18} ${by + 2 + bt * 0.5}`} />
        </g>
      ) : s.brows === 'raised' ? (
        <g fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round">
          <path d={`M ${-ex - 16} ${by} q 16 ${-14 - bt} 32 ${-2 - bt}`} />
          <path d={`M ${ex - 16} ${by - 6 - bt} q 16 -8 32 ${4 + bt}`} />
        </g>
      ) : (
        <g fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round">
          <path d={`M ${-ex - 14} ${by} q 14 -8 28 ${-bt}`} />
          <path d={`M ${ex - 14} ${by - bt} q 14 ${-8 + bt} 28 ${bt}`} />
        </g>
      )}
      <path d={`M 2 ${ry * 0.12} q 10 10 -2 16`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <MouthShape m={mouth} y={my} />
      {(pose.sweat ?? 0) > 0 ? (
        <g opacity={Math.min(1, pose.sweat ?? 0)}>
          <path d={`M ${rx * 0.78} ${-ry * 0.55} q -14 22 0 30 q 14 -8 0 -30 Z`} fill="#8fd3ff" stroke={INK} strokeWidth={3} />
          <path d={`M ${rx * 0.95} ${-ry * 0.15} q -10 16 0 22 q 10 -6 0 -22 Z`} fill="#8fd3ff" stroke={INK} strokeWidth={3} />
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- full body
export const Boy: React.FC<{id: CharId; x?: number; y?: number; scale?: number; pose?: Pose}> = ({id, x = 0, y = 0, scale = 1, pose = {}}) => {
  const s = SPECS[id];
  const g = bodyGeom(id);
  const hw = s.torsoW / 2;
  const belly = s.belly ?? 0;
  const legGap = Math.max(10, s.torsoW * 0.12);
  const deflate = pose.deflate ?? 0;
  const walk = pose.walk;
  const lift = (side: number) => (walk == null ? 0 : Math.max(0, Math.sin(walk) * side) * 22);
  const walkBob = walk == null ? 0 : -Math.abs(Math.cos(walk)) * 7;
  const breath = 1 + 0.018 * (pose.breath ?? 0);
  const armSwing = walk == null ? 0 : Math.sin(walk) * 16;
  const armL = pose.armL ?? {sh: 7 + armSwing, el: -6};
  const armR = pose.armR ?? {sh: 7 - armSwing, el: -6};
  const bodyY = (pose.bob ?? 0) + walkBob + deflate * 10;
  const stretch = pose.stretch ?? 1;

  const armLen = s.torsoH * 0.9;
  const up = armLen * 0.52, fore = armLen * 0.48;
  const {shirtTop, shirtBottom, shortsTop, shortsBottom, legTop} = g;

  const drawArm = (side: number, a: Arm, item?: React.ReactNode) => {
    const ax = side * (hw + 12 + belly * 0.5);
    const py = shirtTop + 14;
    const rotSh = -side * a.sh, rotEl = -side * a.el;
    return (
      <g transform={`rotate(${rotSh} ${ax} ${py})`}>
        <rect x={ax - 12} y={py} width={24} height={up + 14} rx={12} fill={s.skin} stroke={INK} strokeWidth={SW} />
        <g transform={`rotate(${rotEl} ${ax} ${py + up})`}>
          <rect x={ax - 12} y={py + up - 12} width={24} height={fore + 12} rx={12} fill={s.skin} stroke={INK} strokeWidth={SW} />
          <circle cx={ax} cy={py + up} r={10.5} fill={s.skin} />
          {item ? <g transform={`translate(${ax} ${py + up + fore}) rotate(${-(rotSh + rotEl)})`}>{item}</g> : null}
          <circle cx={ax} cy={py + up + fore} r={16} fill={s.skin} stroke={INK} strokeWidth={SW} />
        </g>
        <path d={`M ${ax - 22} ${py - 6} Q ${ax} ${py - 18} ${ax + 22} ${py - 6} L ${ax + 24} ${py + 48} Q ${ax} ${py + 56} ${ax - 24} ${py + 48} Z`} fill="#fff" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      </g>
    );
  };

  const sw2 = hw + 4 + belly * 0.4;
  const bw = hw + belly;
  const px = -hw * 0.55;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${pose.lean ?? 0}) scale(1 ${stretch})`}>
      <ellipse cx={0} cy={4} rx={hw + 40} ry={14} fill="#000" opacity={0.14} />
      {[-1, 1].map((side) => {
        const lx = side * (legGap / 2 + s.legW / 2);
        const l = lift(side);
        const toe = side * 22;
        return (
          <g key={side} transform={`translate(0 ${-l})`}>
            <rect x={lx - s.legW / 2} y={legTop + l} width={s.legW} height={s.legL + 4 - l} rx={s.legW / 2.4} fill={s.skin} stroke={INK} strokeWidth={SW} />
            <rect x={lx - s.legW / 2 - 2} y={-(SHOE_H + SOCK_H)} width={s.legW + 4} height={SOCK_H + 6} rx={6} fill="#fff" stroke={INK} strokeWidth={SW} />
            <line x1={lx - s.legW / 2 + 2} y1={-(SHOE_H + SOCK_H) + 9} x2={lx + s.legW / 2 - 2} y2={-(SHOE_H + SOCK_H) + 9} stroke="#2f55b8" strokeWidth={4} />
            <path d={`M ${lx - s.legW / 2 - 8 + Math.min(0, toe)} 0 Q ${lx - s.legW / 2 - 10 + Math.min(0, toe)} ${-SHOE_H - 4} ${lx} ${-SHOE_H - 4} Q ${lx + s.legW / 2 + 10 + Math.max(0, toe)} ${-SHOE_H - 2} ${lx + s.legW / 2 + 12 + Math.max(0, toe)} 0 Z`} fill="#222" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            <path d={`M ${lx - 6} ${-SHOE_H + 2} q 8 -6 16 0`} fill="none" stroke="#666" strokeWidth={3} />
          </g>
        );
      })}
      <g transform={`translate(0 ${bodyY})`}>
        <path d={`M ${-sw2} ${shortsTop} L ${sw2} ${shortsTop} L ${sw2 + 10} ${shortsBottom} L ${legGap / 2} ${shortsBottom} L 0 ${shortsTop + s.shortsH * 0.45} L ${-legGap / 2} ${shortsBottom} L ${-sw2 - 10} ${shortsBottom} Z`} fill="#2350B8" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d={`M ${sw2 - 8} ${shortsTop + 10} L ${sw2 + 2} ${shortsBottom - 6}`} stroke="#163a8c" strokeWidth={5} fill="none" />
        <path d={`M ${-sw2 + 8} ${shortsTop + 10} L ${-sw2 - 2} ${shortsBottom - 6}`} stroke="#163a8c" strokeWidth={5} fill="none" />
        {!s.untucked ? (
          <g>
            <rect x={-sw2} y={shortsTop - 2} width={sw2 * 2} height={14} fill="#151515" stroke={INK} strokeWidth={3} />
            <rect x={-12} y={shortsTop - 4} width={24} height={18} rx={3} fill="#C9A227" stroke={INK} strokeWidth={3} />
          </g>
        ) : null}
        <g transform={`translate(0 ${shirtBottom}) scale(${1 + (breath - 1) * 0.5} ${breath}) translate(0 ${-shirtBottom})`}>
          <path d={`M ${-hw + 4} ${shirtTop + 8} Q ${-hw - 6} ${shirtTop + s.torsoH * 0.5} ${-bw} ${shirtBottom} L ${bw} ${shirtBottom} Q ${hw + 6} ${shirtTop + s.torsoH * 0.5} ${hw - 4} ${shirtTop + 8} Q 0 ${shirtTop - 8} ${-hw + 4} ${shirtTop + 8} Z`} fill="#fff" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d={`M ${bw - 26} ${shirtTop + 30} Q ${bw - 4} ${shirtTop + s.torsoH * 0.6} ${bw - 6} ${shirtBottom - 4} L ${bw - 22} ${shirtBottom - 4} Z`} fill="#DDE4EE" />
          {s.untucked ? <path d={`M ${-bw + 6} ${shirtBottom - 2} q 18 -8 30 2`} fill="none" stroke="#c6cfdc" strokeWidth={4} /> : null}
          <line x1={0} y1={shirtTop + 22} x2={0} y2={shirtBottom - 4} stroke="#c6cfdc" strokeWidth={3} />
          {[0, 1, 2].map((i) => <circle key={i} cx={0} cy={shirtTop + 36 + (i * (s.torsoH - 50)) / 3} r={4} fill="#fff" stroke="#8a95a5" strokeWidth={2} />)}
          <rect x={px - 20} y={shirtTop + 34} width={40} height={40} rx={4} fill="#fff" stroke="#9aa5b5" strokeWidth={3} />
          <path d={`M ${px - 12} ${shirtTop + 40} h 24 v 14 q 0 12 -12 16 q -12 -4 -12 -16 Z`} fill="#B3261E" stroke={INK} strokeWidth={2.5} />
          <text x={px} y={shirtTop + 57} fontFamily="Arial Black, Arial" fontWeight={900} fontSize={12} fill="#fff" textAnchor="middle">B</text>
          <path d={`M -26 ${shirtTop + 2} L 0 ${shirtTop + 26} L -6 ${shirtTop + 34} L -34 ${shirtTop + 14} Z`} fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M 26 ${shirtTop + 2} L 0 ${shirtTop + 26} L 6 ${shirtTop + 34} L 34 ${shirtTop + 14} Z`} fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {s.bag ? (
            <g strokeLinecap="round">
              <path d={`M ${hw - 30} ${shirtTop + 4} L ${-hw + 14} ${shirtBottom - 6}`} stroke={INK} strokeWidth={18} />
              <path d={`M ${hw - 30} ${shirtTop + 4} L ${-hw + 14} ${shirtBottom - 6}`} stroke="#8B4A22" strokeWidth={10} />
            </g>
          ) : null}
        </g>
        <rect x={-14} y={shirtTop - 14} width={28} height={26} fill={s.skinShade} stroke={INK} strokeWidth={4} />
        <g transform={`translate(${pose.headX ?? 0} ${g.headCy + (pose.headY ?? 0) + deflate * 12}) rotate(${pose.headTilt ?? 0})`}>
          <Head id={id} pose={pose} />
        </g>
        {drawArm(-1, armL, pose.handL)}
        {drawArm(1, armR, pose.handR)}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- props
// Singara (Bangladeshi samosa) for B. `bitten` shows a bite mark.
export const Singara: React.FC<{bitten?: boolean}> = ({bitten}) => (
  <g transform="translate(0 -34)">
    <path d={bitten ? 'M -30 34 L -8 -10 Q 0 -2 8 -10 L 30 34 Q 0 44 -30 34 Z' : 'M -30 34 L 0 -26 L 30 34 Q 0 44 -30 34 Z'} fill="#E0A33B" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M -14 22 q 8 -6 14 2 M 2 10 q 6 -4 10 2" fill="none" stroke="#B87420" strokeWidth={3} strokeLinecap="round" />
  </g>
);

// Generic smartphone in a hand (screen faces the viewer).
export const SmallPhone: React.FC = () => (
  <g transform="translate(0 -38)">
    <rect x={-20} y={-34} width={40} height={74} rx={8} fill="#222" stroke={INK} strokeWidth={4} />
    <rect x={-15} y={-27} width={30} height={58} rx={4} fill="#e9f3ff" />
    <path d="M -5 -4 L 7 3 L -5 10 Z" fill="#E62117" />
  </g>
);
