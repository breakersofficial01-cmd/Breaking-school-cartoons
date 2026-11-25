// Locations, drawn as layered SVG with parallax.
//   GateScene  – red-brick pillars, open green gate, bilingual sign, trees, morning sky
//   FieldScene – 3x-wide field + walkway, two-storey school building with verandah,
//                flag pole, trees; the camera tracks sideways with parallax.
// Every scene renders into the 1080x940 picture area. `cam` = world point at the
// centre of the picture + zoom. Layers move by `x * parallax`.
import React from 'react';
import {FONT_BN, INK, PIC_H, PIC_W} from '../config';

export type Cam = {x: number; y: number; z: number; rot?: number; shakeX?: number; shakeY?: number};

export const Layer: React.FC<{cam: Cam; p: number; children: React.ReactNode}> = ({cam, p, children}) => (
  <g transform={`translate(${PIC_W / 2 + (cam.shakeX ?? 0)} ${PIC_H / 2 + (cam.shakeY ?? 0)}) rotate(${cam.rot ?? 0}) scale(${cam.z}) translate(${-cam.x * p} ${-cam.y})`}>{children}</g>
);

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={PIC_W} height={PIC_H} viewBox={`0 0 ${PIC_W} ${PIC_H}`} style={{position: 'absolute', inset: 0, ...style}}>{children}</svg>
);

// ------------------------------------------------------------- pieces
export const Tree: React.FC<{x: number; y: number; s?: number; tone?: number}> = ({x, y, s = 1, tone = 0}) => {
  const greens = [['#3E9B3A', '#2F7D2C', '#5DB84F'], ['#4FA845', '#3A8A34', '#74C764']][tone];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -16 0 L -10 -150 L 10 -150 L 16 0 Z" fill="#8A5A33" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -4 -110 L -40 -160 M 4 -120 L 36 -170" stroke="#8A5A33" strokeWidth={10} strokeLinecap="round" />
      {[[-60, -190, 70], [55, -200, 72], [0, -250, 85], [-30, -300, 60], [40, -290, 58]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={greens[i % 2]} stroke={INK} strokeWidth={5} />
      ))}
      <circle cx={10} cy={-262} r={40} fill={greens[2]} opacity={0.7} />
    </g>
  );
};

export const Cloud: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.95}>
    <path d="M -90 20 Q -100 -20 -55 -22 Q -45 -62 0 -55 Q 35 -80 65 -40 Q 110 -40 100 20 Z" fill="#fff" stroke="#e6eef8" strokeWidth={4} />
  </g>
);

const SkyGrad: React.FC<{id: string; warm?: boolean}> = ({id, warm}) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor={warm ? '#6EC3F2' : '#79CBF5'} />
    <stop offset="0.65" stopColor={warm ? '#BFE6F7' : '#CDEFFB'} />
    <stop offset="1" stopColor={warm ? '#FFE3B0' : '#F4F9E8'} />
  </linearGradient>
);

// ------------------------------------------------------------- GATE
export const GATE_GROUND = 700;
export const GateScene: React.FC<{cam: Cam; t: number; children?: React.ReactNode}> = ({cam, t, children}) => {
  const sunX = 760, sunY = 170;
  return (
    <Svg>
      <defs>
        <SkyGrad id="gsky" warm />
        <radialGradient id="sun"><stop offset="0" stopColor="#fffbe8" /><stop offset="0.3" stopColor="#fff2b0" stopOpacity={0.9} /><stop offset="1" stopColor="#fff2b0" stopOpacity={0} /></radialGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9B48E" /><stop offset="1" stopColor="#A8916A" /></linearGradient>
      </defs>
      <rect width={PIC_W} height={PIC_H} fill="url(#gsky)" />
      <Layer cam={cam} p={0.2}>
        <Cloud x={200} y={130} s={1.1} /><Cloud x={980} y={90} s={0.8} />
      </Layer>
      <Layer cam={cam} p={0.5}>
        <rect x={180} y={430} width={700} height={GATE_GROUND - 430} fill="#F3E3B8" stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={215 + i * 112} y={470} width={64} height={70} fill="#9FD0EA" stroke="#2D5FA8" strokeWidth={6} />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={'b' + i} x={215 + i * 112} y={580} width={64} height={70} fill="#9FD0EA" stroke="#2D5FA8" strokeWidth={6} />)}
        <Tree x={90} y={GATE_GROUND} s={1.1} /><Tree x={1010} y={GATE_GROUND} s={1.2} tone={1} />
      </Layer>
      <Layer cam={cam} p={1}>
        <rect x={-600} y={GATE_GROUND} width={2400} height={600} fill="#7CC35A" />
        <path d={`M 400 ${GATE_GROUND} L 680 ${GATE_GROUND} L 1000 ${GATE_GROUND + 600} L 80 ${GATE_GROUND + 600} Z`} fill="url(#road)" stroke={INK} strokeWidth={4} />
        <rect x={-600} y={GATE_GROUND - 140} width={950} height={140} fill="#B5452F" stroke={INK} strokeWidth={5} />
        <rect x={730} y={GATE_GROUND - 140} width={950} height={140} fill="#B5452F" stroke={INK} strokeWidth={5} />
        {Array.from({length: 6}).map((_, i) => (
          <line key={i} x1={-600} y1={GATE_GROUND - 120 + i * 20} x2={1680} y2={GATE_GROUND - 120 + i * 20} stroke="#8E3322" strokeWidth={2} opacity={0.5} />
        ))}
        <g stroke={INK} strokeWidth={5}>
          <path d={`M 350 ${GATE_GROUND - 240} L 230 ${GATE_GROUND - 225} L 230 ${GATE_GROUND + 18} L 350 ${GATE_GROUND + 6} Z`} fill="#2E8B4E" />
          <path d={`M 730 ${GATE_GROUND - 240} L 850 ${GATE_GROUND - 225} L 850 ${GATE_GROUND + 18} L 730 ${GATE_GROUND + 6} Z`} fill="#2E8B4E" />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={260 + i * 24} y1={GATE_GROUND - 226 + i} x2={260 + i * 24} y2={GATE_GROUND + 10} stroke="#1E5F35" />)}
          {[0, 1, 2, 3].map((i) => <line key={'r' + i} x1={760 + i * 24} y1={GATE_GROUND - 236 + i * 3} x2={760 + i * 24} y2={GATE_GROUND + 10} stroke="#1E5F35" />)}
        </g>
        {[300, 730].map((px) => (
          <g key={px}>
            <rect x={px} y={GATE_GROUND - 380} width={70} height={390} fill="#B5452F" stroke={INK} strokeWidth={6} />
            {Array.from({length: 18}).map((_, i) => <line key={i} x1={px} y1={GATE_GROUND - 360 + i * 21} x2={px + 70} y2={GATE_GROUND - 360 + i * 21} stroke="#8E3322" strokeWidth={2.5} />)}
            <rect x={px - 10} y={GATE_GROUND - 400} width={90} height={26} fill="#D9D2C3" stroke={INK} strokeWidth={5} />
          </g>
        ))}
        <rect x={290} y={GATE_GROUND - 520} width={520} height={130} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
        <rect x={300} y={GATE_GROUND - 510} width={500} height={110} rx={6} fill="#1E6B3C" />
        <text x={550} y={GATE_GROUND - 462} textAnchor="middle" fontFamily={FONT_BN} fontWeight={700} fontSize={40} fill="#FFE7A0">ব্রেকিং স্কুল হাই স্কুল</text>
        <text x={550} y={GATE_GROUND - 418} textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight={900} fontSize={27} fill="#fff" letterSpacing={1}>BREAKING SCHOOL HIGH SCHOOL</text>
        {children}
      </Layer>
      {/* sun flare + dust specks (screen space) */}
      <g style={{mixBlendMode: 'screen'}}>
        <circle cx={sunX} cy={sunY} r={260} fill="url(#sun)" opacity={0.9} />
        {[[0.35, 34, 0.25], [0.6, 18, 0.3], [0.85, 46, 0.18], [1.15, 24, 0.22]].map(([k, r, o], i) => (
          <circle key={i} cx={sunX + (PIC_W / 2 - sunX) * 2 * k} cy={sunY + (PIC_H / 2 - sunY) * 2 * k} r={r} fill="#FFE9A8" opacity={o} />
        ))}
      </g>
      {Array.from({length: 26}).map((_, i) => {
        const px = (i * 173 + t * (12 + (i % 5) * 6)) % PIC_W;
        const py = (i * 97 + Math.sin(t * 0.8 + i) * 30 + 200) % PIC_H;
        return <circle key={i} cx={px} cy={py} r={2 + (i % 3)} fill="#FFF6D5" opacity={0.55 + 0.3 * Math.sin(t * 2 + i)} />;
      })}
    </Svg>
  );
};

// ------------------------------------------------------------- FIELD
export const FIELD_W = 3240;
export const WALK_Y = 860; // feet on the walkway
export const GIRLS_Y = 640; // girls stand mid-field

const Building: React.FC = () => {
  const x0 = 120, w = 2700, base = 470, floorH = 150;
  const cols = 22;
  return (
    <g>
      <rect x={x0 - 20} y={base - floorH * 2 - 36} width={w + 40} height={30} fill="#E8D5A4" stroke={INK} strokeWidth={5} />
      <rect x={x0} y={base - floorH * 2 - 8} width={w} height={floorH * 2 + 8} fill="#F6E7BE" stroke={INK} strokeWidth={5} />
      {[0, 1].map((fl) => {
        const top = base - floorH * (fl + 1);
        return (
          <g key={fl}>
            <rect x={x0 + 10} y={top + 10} width={w - 20} height={floorH - 22} fill="#E3CF9C" />
            {Array.from({length: cols - 1}).map((_, i) => {
              const cx = x0 + 60 + i * (w / cols);
              return i % 3 === 1 ? (
                <rect key={i} x={cx} y={top + 36} width={58} height={floorH - 48} fill="#4C7BC0" stroke={INK} strokeWidth={4} />
              ) : (
                <g key={i}>
                  <rect x={cx} y={top + 40} width={70} height={60} fill="#9FD0EA" stroke="#2D5FA8" strokeWidth={7} />
                  <line x1={cx + 35} y1={top + 40} x2={cx + 35} y2={top + 100} stroke="#2D5FA8" strokeWidth={4} />
                </g>
              );
            })}
            {Array.from({length: cols + 1}).map((_, i) => (
              <rect key={i} x={x0 + i * (w / cols) - 10} y={top} width={20} height={floorH} fill="#FBF1D6" stroke={INK} strokeWidth={4} />
            ))}
            <rect x={x0} y={top + floorH - 44} width={w} height={8} fill="#2D5FA8" />
            {Array.from({length: 120}).map((_, i) => (
              <line key={i} x1={x0 + i * (w / 120)} y1={top + floorH - 40} x2={x0 + i * (w / 120)} y2={top + floorH - 12} stroke="#2D5FA8" strokeWidth={3} />
            ))}
            <rect x={x0 - 6} y={top + floorH - 12} width={w + 12} height={14} fill="#D8C08A" stroke={INK} strokeWidth={4} />
          </g>
        );
      })}
      <rect x={1270} y={base - floorH * 2 - 100} width={520} height={70} rx={8} fill="#1E6B3C" stroke={INK} strokeWidth={5} />
      <text x={1530} y={base - floorH * 2 - 53} textAnchor="middle" fontFamily={FONT_BN} fontWeight={700} fontSize={36} fill="#FFE7A0">ব্রেকিং স্কুল হাই স্কুল</text>
    </g>
  );
};

const FlagPole: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const w = Math.sin(t * 3) * 6;
  return (
    <g>
      <rect x={x - 5} y={y - 360} width={10} height={360} fill="#ccc" stroke={INK} strokeWidth={4} />
      <circle cx={x} cy={y - 364} r={9} fill="#E0B43B" stroke={INK} strokeWidth={3} />
      <path d={`M ${x + 5} ${y - 352} Q ${x + 50} ${y - 352 + w} ${x + 105} ${y - 350} L ${x + 105} ${y - 286} Q ${x + 50} ${y - 288 - w} ${x + 5} ${y - 288} Z`} fill="#006A4E" stroke={INK} strokeWidth={4} />
      <circle cx={x + 50} cy={y - 320} r={19} fill="#F42A41" />
    </g>
  );
};

// layers: clouds (p .2), far trees (p .45), building + flag (p .65),
// world (p 1) = field, girls, walkway, characters; front bushes (p 1.35).
export const FieldScene: React.FC<{cam: Cam; t: number; girls?: React.ReactNode; children?: React.ReactNode; front?: boolean; blur?: number}> = ({cam, t, girls, children, front = true, blur = 0}) => (
  <Svg style={blur ? {filter: `blur(${blur}px)`} : undefined}>
    <defs>
      <SkyGrad id="fsky" />
      <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8BD169" /><stop offset="1" stopColor="#5DAF45" /></linearGradient>
    </defs>
    <rect width={PIC_W} height={PIC_H} fill="url(#fsky)" />
    <Layer cam={cam} p={0.2}>
      <Cloud x={300} y={120} /><Cloud x={1100} y={80} s={0.7} /><Cloud x={1900} y={140} s={0.9} /><Cloud x={2700} y={90} s={0.8} />
    </Layer>
    <Layer cam={cam} p={0.45}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Tree key={i} x={i * 330 + 40} y={470} s={0.7} tone={i % 2} />)}
    </Layer>
    <Layer cam={cam} p={0.65}>
      <Building />
      <FlagPole x={2950} y={520} t={t} />
    </Layer>
    <Layer cam={cam} p={1}>
      <rect x={-1500} y={470} width={FIELD_W + 3000} height={700} fill="url(#grass)" />
      {Array.from({length: 60}).map((_, i) => (
        <path key={i} d={`M ${i * 97 - 300} ${520 + ((i * 53) % 200)} q 4 -12 8 0 q 4 -10 8 0`} fill="none" stroke="#4E9A3A" strokeWidth={3} />
      ))}
      <Tree x={-40} y={560} s={0.95} />
      <Tree x={2400} y={560} s={1.0} tone={1} />
      {girls}
      {/* brick walkway */}
      <rect x={-1500} y={WALK_Y - 90} width={FIELD_W + 3000} height={150} fill="#C8704E" stroke={INK} strokeWidth={5} />
      {Array.from({length: 4}).map((_, r) => (
        <line key={r} x1={-1500} y1={WALK_Y - 60 + r * 30} x2={FIELD_W + 1500} y2={WALK_Y - 60 + r * 30} stroke="#9E5236" strokeWidth={3} />
      ))}
      {Array.from({length: 5}).map((_, r) =>
        Array.from({length: 140}).map((__, i) => {
          const bx = -1500 + i * 46 + (r % 2) * 23;
          return <line key={r * 1000 + i} x1={bx} y1={WALK_Y - 90 + r * 30} x2={bx} y2={WALK_Y - 60 + r * 30} stroke="#9E5236" strokeWidth={3} />;
        }),
      )}
      <rect x={-1500} y={WALK_Y + 60} width={FIELD_W + 3000} height={300} fill="#5DAF45" />
      {children}
    </Layer>
    {front ? (
      <Layer cam={cam} p={1.35}>
        {[-200, 700, 1500, 2300, 3100, 3900].map((bx, i) => (
          <g key={i} transform={`translate(${bx} ${WALK_Y + 170})`}>
            {[-50, 0, 50].map((dx, j) => <circle key={j} cx={dx} cy={-20 - (j === 1 ? 30 : 0)} r={52} fill={j === 1 ? '#3E9B3A' : '#4FA845'} stroke={INK} strokeWidth={5} />)}
          </g>
        ))}
      </Layer>
    ) : null}
  </Svg>
);
