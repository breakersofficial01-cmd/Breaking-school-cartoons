// Background schoolgirls in a normal Bangladeshi girls' school uniform:
// white kameez + salwar, blue belt and cross-belt, plaits or a ponytail with
// white ribbons. Looping chat/laugh gestures only (no lines). Wholesome.
import React from 'react';
import {INK, SW} from '../config';

export type GirlSpec = {skin: string; hair: 'plaits' | 'pony'; height: number; seed: number; phase: number; orna?: boolean};

export const Girl: React.FC<{x: number; y: number; scale?: number; spec: GirlSpec; t: number; facing?: number}> = ({x, y, scale = 1, spec, t, facing = 0}) => {
  const {skin, hair, height: h, seed, phase} = spec;
  // gesture loop: chatting hand + periodic laugh
  const cyc = (t * 0.55 + phase) % 3; // 3-beat loop
  const laughing = cyc > 2.0 && cyc < 2.7;
  const talkHand = Math.sin(t * 3.4 + seed) * 18;
  const headTilt = (laughing ? -8 : Math.sin(t * 1.7 + seed) * 4) + facing * 4;
  const bob = laughing ? Math.abs(Math.sin(t * 14)) * -5 : 0;
  const blinkOn = ((t + seed * 0.37) % 3.1) < 0.12;

  const legL = 95 * h, kameezH = 210 * h, kameezTop = -(36 + legL + kameezH * 0.62);
  const shoulderY = kameezTop + 10;
  const hw = 58;
  const headCy = kameezTop - 78;
  const rx = 74, ry = 82;
  const armLen = 140 * h;
  const eyeX = 26 + facing * 6;

  const arm = (side: number, ang: number, el: number) => {
    const ax = side * (hw + 6);
    return (
      <g transform={`rotate(${-side * ang} ${ax} ${shoulderY + 10})`}>
        <rect x={ax - 11} y={shoulderY + 10} width={22} height={armLen * 0.55} rx={11} fill="#fff" stroke={INK} strokeWidth={SW} />
        <g transform={`rotate(${-side * el} ${ax} ${shoulderY + 10 + armLen * 0.5})`}>
          <rect x={ax - 10} y={shoulderY + armLen * 0.5} width={20} height={armLen * 0.5} rx={10} fill={skin} stroke={INK} strokeWidth={SW} />
          <rect x={ax - 11} y={shoulderY + armLen * 0.46} width={22} height={18} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
          <circle cx={ax} cy={shoulderY + 10 + armLen} r={13} fill={skin} stroke={INK} strokeWidth={SW} />
        </g>
      </g>
    );
  };

  const plait = (side: number) => (
    <g key={side}>
      <path d={`M ${side * (rx - 14)} ${headCy + 20} q ${side * 18} 60 ${side * 4} 130`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d={`M ${side * (rx - 14)} ${headCy + 20} q ${side * 18} 60 ${side * 4} 130`} stroke="#141414" strokeWidth={21} fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${side * (rx - 6) - 9} ${headCy + 46 + i * 24} l 16 8`} stroke="#3a3a3a" strokeWidth={3} />)}
      <g transform={`translate(${side * (rx - 10)} ${headCy + 158})`}>
        <path d="M 0 0 L -18 -12 L -18 12 Z M 0 0 L 18 -12 L 18 12 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        <circle r={6} fill="#fff" stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={hw + 26} ry={12} fill="#000" opacity={0.14} />
      {/* salwar legs + shoes */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${s * 24 - 20} ${-36 - legL} L ${s * 24 + 20} ${-36 - legL} L ${s * 24 + 15} -24 L ${s * 24 - 15} -24 Z`} fill="#fff" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d={`M ${s * 24 - 20} -2 Q ${s * 24 - 20} -28 ${s * 24} -28 Q ${s * 24 + 24} -28 ${s * 24 + 24} -2 Z`} fill="#2a2a2a" stroke={INK} strokeWidth={4.5} />
        </g>
      ))}
      <g transform={`translate(0 ${bob})`}>
        {/* kameez */}
        <path d={`M ${-hw} ${kameezTop + 6} Q 0 ${kameezTop - 8} ${hw} ${kameezTop + 6} L ${hw + 20} ${-36 - legL + 40} L ${-hw - 20} ${-36 - legL + 40} Z`} fill="#fff" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d={`M ${hw - 14} ${kameezTop + 30} L ${hw + 8} ${-36 - legL + 36} L ${hw - 6} ${-36 - legL + 36} Z`} fill="#DDE4EE" />
        {/* V neck */}
        <path d={`M -16 ${kameezTop + 1} L 0 ${kameezTop + 24} L 16 ${kameezTop + 1}`} fill="none" stroke={INK} strokeWidth={4} />
        {/* cross-belt + belt */}
        <path d={`M ${hw - 16} ${kameezTop + 8} L ${-hw + 4} ${kameezTop + kameezH * 0.5}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d={`M ${hw - 16} ${kameezTop + 8} L ${-hw + 4} ${kameezTop + kameezH * 0.5}`} stroke="#2350B8" strokeWidth={13} strokeLinecap="round" />
        <rect x={-hw - 6} y={kameezTop + kameezH * 0.46} width={hw * 2 + 12} height={20} rx={4} fill="#2350B8" stroke={INK} strokeWidth={4} />
        <rect x={-11} y={kameezTop + kameezH * 0.46 - 3} width={22} height={26} rx={4} fill="#C9A227" stroke={INK} strokeWidth={3} />
        {/* white orna (scarf) over both shoulders, ends hanging down the front */}
        {spec.orna ? (
          <g fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round">
            <path d={`M ${-hw - 4} ${kameezTop + 10} Q 0 ${kameezTop + 40} ${hw + 4} ${kameezTop + 10} L ${hw - 6} ${kameezTop - 6} Q 0 ${kameezTop + 18} ${-hw + 6} ${kameezTop - 6} Z`} />
            <path d={`M ${-hw + 2} ${kameezTop + 8} L ${-hw - 8} ${kameezTop + kameezH * 0.62} L ${-hw + 18} ${kameezTop + kameezH * 0.62} L ${-hw + 22} ${kameezTop + 14} Z`} />
            <path d={`M ${hw - 2} ${kameezTop + 8} L ${hw + 8} ${kameezTop + kameezH * 0.62} L ${hw - 18} ${kameezTop + kameezH * 0.62} L ${hw - 22} ${kameezTop + 14} Z`} />
          </g>
        ) : null}
        {/* plaits behind the head */}
        {hair === 'plaits' ? [-1, 1].map(plait) : null}
        <rect x={-12} y={kameezTop - 18} width={24} height={24} fill={skin} stroke={INK} strokeWidth={4} />
        {/* head */}
        <g transform={`translate(0 ${headCy}) rotate(${headTilt})`}>
          {hair === 'pony' ? (
            <g>
              <path d={`M ${rx - 10} ${-ry * 0.5} q 60 10 44 120 q -10 30 -26 30 q 8 -60 -30 -110 Z`} fill="#141414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
              <g transform={`translate(${rx + 4} ${-ry * 0.45})`}>
                <path d="M 0 0 L -14 -14 L -16 10 Z M 0 0 L 16 -12 L 12 14 Z" fill="#fff" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
              </g>
            </g>
          ) : null}
          <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={skin} stroke={INK} strokeWidth={SW} />
          {/* hair cap with centre parting */}
          <path d={`M ${-rx - 4} ${ry * 0.1} Q ${-rx - 8} ${-ry * 1.15} 0 ${-ry * 1.08} Q ${rx + 8} ${-ry * 1.15} ${rx + 4} ${ry * 0.1} Q ${rx * 0.7} ${-ry * 0.5} 0 ${-ry * 0.62} Q ${-rx * 0.7} ${-ry * 0.5} ${-rx - 4} ${ry * 0.1} Z`} fill="#141414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d={`M 0 ${-ry * 1.05} L 0 ${-ry * 0.64}`} stroke="#555" strokeWidth={4} />
          {/* eyes */}
          {[-1, 1].map((s) =>
            laughing || blinkOn ? (
              <path key={s} d={`M ${s * eyeX - 13} ${-2} Q ${s * eyeX} ${laughing ? -16 : 8} ${s * eyeX + 13} ${-2}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
            ) : (
              <g key={s}>
                <ellipse cx={s * eyeX} cy={-4} rx={14} ry={17} fill="#fff" stroke={INK} strokeWidth={3.5} />
                <circle cx={s * eyeX + 3 + facing * 4} cy={-1} r={7} fill={INK} />
                <circle cx={s * eyeX + 5 + facing * 4} cy={-4} r={2.4} fill="#fff" />
                <path d={`M ${s * eyeX - 14} ${-18} l -5 -5 M ${s * eyeX - 7} ${-21} l -2 -6`} stroke={INK} strokeWidth={3} strokeLinecap="round" transform={s > 0 ? `translate(${2 * s * eyeX}) scale(-1 1)` : undefined} />
              </g>
            ),
          )}
          {[-1, 1].map((s) => <path key={s} d={`M ${s * eyeX - 12} -30 q 12 -7 24 0`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />)}
          <ellipse cx={-rx * 0.52} cy={ry * 0.3} rx={12} ry={7} fill="#E0735A" opacity={0.35} />
          <ellipse cx={rx * 0.52} cy={ry * 0.3} rx={12} ry={7} fill="#E0735A" opacity={0.35} />
          <path d="M 2 12 q 7 7 -1 12" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          {laughing ? (
            <path d={`M -18 ${ry * 0.4} Q 0 ${ry * 0.4 + 30} 18 ${ry * 0.4} Z`} fill="#5a1717" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          ) : (
            <path d={`M -14 ${ry * 0.42} Q 0 ${ry * 0.42 + (Math.sin(t * 8 + seed) > 0.3 ? 14 : 8)} 14 ${ry * 0.42}`} fill={Math.sin(t * 8 + seed) > 0.3 ? '#5a1717' : 'none'} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          )}
        </g>
        {arm(-1, laughing ? 22 : 8, laughing ? -100 : -10)}
        {arm(1, 12 + (laughing ? 0 : talkHand), laughing ? -6 : -70 + talkHand)}
      </g>
    </g>
  );
};

export const GIRLS: GirlSpec[] = [
  {skin: '#C68A5E', hair: 'plaits', height: 1.0, seed: 3, phase: 0.0, orna: true},
  {skin: '#B97A4E', hair: 'pony', height: 1.05, seed: 7, phase: 1.1},
  {skin: '#D09A6C', hair: 'plaits', height: 0.95, seed: 11, phase: 2.2, orna: true},
  {skin: '#A86F44', hair: 'pony', height: 1.0, seed: 17, phase: 0.6},
];
