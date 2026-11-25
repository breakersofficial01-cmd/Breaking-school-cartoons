// Bangladeshi set pieces (low-poly, toon-shaded, code-built so nothing needs a download):
// school building with verandah, boundary wall + gate, krishnachura (flame tree),
// coconut palm, banana plant, cycle rickshaw with painted hood, tea stall ("চা"),
// electric pole with tangled wires, neighbourhood houses with roof water tanks.
// Two locations are assembled at the bottom: FieldWorld and GateWorld.
import React from 'react';
import {OBox, OCyl, OSphere, Sign, toon} from './World3D';
import type {V3} from './World3D';

// ---------------------------------------------------------------- trees
export const Tree3: React.FC<{p: V3; s?: number; tone?: number}> = ({p, s = 1, tone = 0}) => {
  const g = tone ? ['#4FA845', '#74C764'] : ['#3E9B3A', '#5DB84F'];
  return (
    <group position={p} scale={s}>
      <OCyl p={[0, 1.2, 0]} r={0.22} h={2.4} c="#8A5A33" seg={7} />
      <OSphere p={[0, 3.2, 0]} r={1.5} c={g[0]} />
      <OSphere p={[0.9, 2.7, 0.3]} r={1.0} c={g[1]} />
      <OSphere p={[-0.9, 2.8, -0.2]} r={1.05} c={g[1]} />
      <OSphere p={[0.2, 4.2, 0]} r={0.95} c={g[0]} />
    </group>
  );
};

// Krishnachura: wide umbrella canopy of flame-red blossoms.
export const Krishnachura: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => (
  <group position={p} scale={s}>
    <OCyl p={[0, 1.4, 0]} r={0.25} h={2.8} c="#7A4A2A" seg={7} />
    <OCyl p={[0.7, 2.9, 0]} r={0.12} h={1.6} c="#7A4A2A" seg={6} rot={[0, 0, -0.8]} />
    <OCyl p={[-0.7, 2.9, 0]} r={0.12} h={1.6} c="#7A4A2A" seg={6} rot={[0, 0, 0.8]} />
    {[[0, 3.6, 0, 1.6], [1.6, 3.3, 0.2, 1.2], [-1.6, 3.3, -0.2, 1.2], [0.8, 4.0, -0.6, 1.0], [-0.9, 3.9, 0.6, 1.0]].map(([x, y, z, r], i) => (
      <OSphere key={i} p={[x, y, z]} r={r} c={i % 2 ? '#F2542D' : '#E63B1F'} sy={0.55} />
    ))}
    <OSphere p={[0.3, 3.3, 0.9]} r={0.7} c="#4FA845" sy={0.5} />
  </group>
);

export const CoconutPalm: React.FC<{p: V3; s?: number; lean?: number}> = ({p, s = 1, lean = 0.12}) => (
  <group position={p} scale={s} rotation={[0, 0, lean]}>
    <OCyl p={[0, 3, 0]} r={0.16} r2={0.11} h={6} c="#9B7A55" seg={7} />
    {Array.from({length: 7}).map((_, i) => (
      <group key={i} position={[0, 6, 0]} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
        <OBox p={[1.1, -0.25, 0]} s={[2.4, 0.06, 0.5]} c="#3E9B3A" r={[0, 0, -0.35]} line={0.03} />
      </group>
    ))}
    <OSphere p={[0.15, 5.8, 0.1]} r={0.18} c="#6B8E23" />
    <OSphere p={[-0.12, 5.8, 0.12]} r={0.18} c="#6B8E23" />
  </group>
);

export const Banana: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => (
  <group position={p} scale={s}>
    <OCyl p={[0, 0.9, 0]} r={0.14} h={1.8} c="#7FA650" seg={7} />
    {Array.from({length: 5}).map((_, i) => (
      <group key={i} position={[0, 1.8, 0]} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
        <OBox p={[0.7, 0.35, 0]} s={[1.5, 0.04, 0.55]} c="#5DB84F" r={[0, 0, 0.5]} line={0.025} />
      </group>
    ))}
  </group>
);

// ---------------------------------------------------------------- school
// Two-storey cream building, green trim, blue windows, verandah columns and railings,
// Bangla name board on the roof parapet.
export const School3: React.FC<{p: V3; len?: number}> = ({p, len = 56}) => {
  const floorH = 3.4, bays = Math.floor(len / 3.6);
  const items: React.ReactNode[] = [];
  for (let f = 0; f < 2; f++) {
    const y = f * floorH;
    items.push(<OBox key={`w${f}`} p={[0, y + floorH / 2, -2.2]} s={[len, floorH, 0.3]} c="#EBD9A6" line={0.04} />);
    for (let i = 0; i < bays; i++) {
      const x = -len / 2 + 1.8 + i * 3.6;
      items.push(i % 3 === 1
        ? <OBox key={`d${f}${i}`} p={[x, y + 1.2, -2.0]} s={[1.1, 2.2, 0.1]} c="#2E7D4F" line={0.04} />
        : <OBox key={`n${f}${i}`} p={[x, y + 1.7, -2.0]} s={[1.5, 1.2, 0.1]} c="#9FD0EA" line={0.06} />);
      items.push(<OBox key={`c${f}${i}`} p={[x - 1.8, y + floorH / 2, 0]} s={[0.35, floorH, 0.35]} c="#FBF1D6" line={0.04} />);
    }
    items.push(<OBox key={`ce${f}`} p={[len / 2, y + floorH / 2, 0]} s={[0.35, floorH, 0.35]} c="#FBF1D6" line={0.04} />);
    items.push(<OBox key={`s${f}`} p={[0, y + floorH - 0.1, -1.1]} s={[len + 0.6, 0.25, 2.6]} c="#2E7D4F" line={0.04} />);
    if (f === 1) {
      items.push(<OBox key="rail" p={[0, y + 0.95, 0.05]} s={[len, 0.1, 0.1]} c="#2E7D4F" line={0.02} />);
      for (let i = 0; i < len / 0.5; i++) items.push(<OBox key={`b${i}`} p={[-len / 2 + i * 0.5, y + 0.5, 0.05]} s={[0.05, 0.9, 0.05]} c="#2E7D4F" line={0} />);
    }
  }
  items.push(<OBox key="roof" p={[0, floorH * 2 + 0.35, -1.1]} s={[len + 1.2, 0.7, 3.0]} c="#E8D5A4" />);
  items.push(<OBox key="ground" p={[0, 0.08, -1.1]} s={[len + 0.6, 0.16, 2.6]} c="#D8C08A" line={0.03} />);
  items.push(<Sign key="name" p={[0, floorH * 2 + 1.4, 0.2]} w={11} h={1.6} text="ব্রেকিং স্কুল হাই স্কুল" sub="BREAKING SCHOOL HIGH SCHOOL" bg="#1E6B3C" fg="#FFE7A0" />);
  // banner on the verandah railing
  items.push(<Sign key="banner" p={[-12, floorH + 0.55, 0.12]} w={6} h={0.9} text="বার্ষিক ক্রীড়া প্রতিযোগিতা" bg="#B3261E" fg="#FFFFFF" />);
  return <group position={p}>{items}</group>;
};

// Boundary wall (whitewashed bricks, red band) with Bangla wall writing.
export const BoundaryWall: React.FC<{z: number; from: number; to: number; gap?: [number, number]}> = ({z, from, to, gap}) => {
  const segs: [number, number][] = gap ? [[from, gap[0]], [gap[1], to]] : [[from, to]];
  return (
    <group>
      {segs.map(([a, b], i) => (
        <group key={i}>
          <OBox p={[(a + b) / 2, 0.9, z]} s={[b - a, 1.8, 0.3]} c="#F2EDE3" />
          <OBox p={[(a + b) / 2, 1.85, z]} s={[b - a + 0.1, 0.15, 0.36]} c="#B5452F" line={0.03} />
        </group>
      ))}
    </group>
  );
};

// School gate: red-brick pillars, open green gate leaves, bilingual sign arch.
export const Gate3: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    {[-2.4, 2.4].map((x) => (
      <group key={x}>
        <OBox p={[x, 2.2, 0]} s={[0.9, 4.4, 0.9]} c="#B5452F" />
        <OBox p={[x, 4.5, 0]} s={[1.1, 0.25, 1.1]} c="#D9D2C3" />
        {Array.from({length: 10}).map((_, i) => <OBox key={i} p={[x, 0.3 + i * 0.42, 0.46]} s={[0.9, 0.03, 0.02]} c="#8E3322" line={0} />)}
      </group>
    ))}
    {[-1, 1].map((sd) => (
      <group key={sd} position={[sd * 1.95, 1.3, 0.3]} rotation={[0, sd * 1.25, 0]}>
        <OBox p={[sd * 1.0, 0, 0]} s={[2.0, 2.4, 0.08]} c="#2E8B4E" />
        {Array.from({length: 5}).map((_, i) => <OBox key={i} p={[sd * (0.2 + i * 0.4), 0, 0.06]} s={[0.05, 2.3, 0.03]} c="#1E5F35" line={0} />)}
      </group>
    ))}
    <Sign p={[0, 5.6, 0.1]} w={6.2} h={1.5} text="ব্রেকিং স্কুল হাই স্কুল" sub="BREAKING SCHOOL HIGH SCHOOL" bg="#1E6B3C" fg="#FFE7A0" />
    {/* same sign on the inside (seen from the school yard) */}
    <Sign p={[0, 5.6, -0.12]} r={[0, Math.PI, 0]} w={6.2} h={1.5} text="ব্রেকিং স্কুল হাই স্কুল" sub="BREAKING SCHOOL HIGH SCHOOL" bg="#1E6B3C" fg="#FFE7A0" />
    <OBox p={[0, 4.75, 0]} s={[5.7, 0.18, 0.4]} c="#D9D2C3" />
  </group>
);

// ---------------------------------------------------------------- street life
// Cycle rickshaw: colourful hood, painted back panel, big wheels.
export const Rickshaw: React.FC<{p: V3; rotY?: number}> = ({p, rotY = 0}) => (
  <group position={p} rotation={[0, rotY, 0]}>
    {[[-0.9, 0.45, 0.55], [-0.9, 0.45, -0.55], [0.9, 0.45, 0]].map(([x, y, z], i) => (
      <group key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={toon('#222')}><torusGeometry args={[0.42, 0.05, 6, 18]} /></mesh>
      </group>
    ))}
    <OBox p={[-0.9, 0.95, 0]} s={[0.9, 0.5, 1.2]} c="#E8B923" />
    <OBox p={[-0.9, 1.25, 0]} s={[0.7, 0.12, 1.1]} c="#B3261E" />
    <OBox p={[-1.37, 0.95, 0]} s={[0.04, 0.45, 1.0]} c="#2E8B4E" />
    {/* hood with stripes */}
    <OBox p={[-1.1, 2.0, 0]} s={[0.9, 0.08, 1.3]} c="#C2185B" r={[0, 0, 0.35]} />
    <OBox p={[-1.45, 1.75, 0]} s={[0.08, 0.7, 1.3]} c="#1565C0" />
    <OBox p={[0.1, 0.9, 0]} s={[1.9, 0.08, 0.08]} c="#555" line={0.02} />
    <OBox p={[0.9, 1.25, 0]} s={[0.08, 0.7, 0.08]} c="#555" line={0.02} />
    <OBox p={[0.9, 1.6, 0]} s={[0.08, 0.08, 0.8]} c="#555" line={0.02} />
    <OBox p={[0.4, 1.05, 0]} s={[0.4, 0.08, 0.3]} c="#222" line={0.02} />
    {/* tassels */}
    {[-0.5, -0.15, 0.2, 0.5].map((z, i) => <OSphere key={i} p={[-0.7, 1.95, z]} r={0.07} c={['#FFD600', '#E91E63', '#00BCD4', '#FF5722'][i]} />)}
  </group>
);

// Tea stall (cha er dokan): bamboo frame, tin roof, kettle on a clay stove, bench, sign "চা".
export const TeaStall: React.FC<{p: V3; rotY?: number}> = ({p, rotY = 0}) => (
  <group position={p} rotation={[0, rotY, 0]}>
    {[[-1.2, -0.7], [1.2, -0.7], [-1.2, 0.7], [1.2, 0.7]].map(([x, z], i) => <OCyl key={i} p={[x, 1.2, z]} r={0.06} h={2.4} c="#C9A55C" seg={6} />)}
    <OBox p={[0, 2.45, 0]} s={[2.9, 0.08, 1.9]} c="#9AA5B1" r={[0.12, 0, 0]} />
    <OBox p={[0, 0.5, -0.5]} s={[2.4, 1.0, 0.6]} c="#8D6E63" />
    <OCyl p={[-0.6, 1.15, -0.5]} r={0.22} h={0.3} c="#B5651D" />
    <OCyl p={[-0.6, 1.42, -0.5]} r={0.16} r2={0.1} h={0.25} c="#C0C0C0" />
    {[0.2, 0.55, 0.9].map((x, i) => <OCyl key={i} p={[x, 1.15, -0.5]} r={0.12} h={0.3} c={['#FFD54F', '#FF8A65', '#AED581'][i]} />)}
    <OBox p={[0, 0.45, 1.1]} s={[2.0, 0.1, 0.4]} c="#A1887F" />
    <OBox p={[-0.8, 0.22, 1.1]} s={[0.1, 0.45, 0.35]} c="#A1887F" />
    <OBox p={[0.8, 0.22, 1.1]} s={[0.1, 0.45, 0.35]} c="#A1887F" />
    <Sign p={[0, 2.15, 0.95]} w={1.6} h={0.5} text="চা - বিস্কুট" bg="#FFF176" fg="#B3261E" />
  </group>
);

// Electric pole with a cross-arm and sagging, tangled wires to the next pole.
export const PoleLine: React.FC<{xs: number[]; z: number}> = ({xs, z}) => (
  <group>
    {xs.map((x) => (
      <group key={x}>
        <OBox p={[x, 4, z]} s={[0.25, 8, 0.25]} c="#9E9E9E" />
        <OBox p={[x, 7.4, z]} s={[1.6, 0.12, 0.12]} c="#757575" line={0.02} />
        <OCyl p={[x + 0.3, 6.6, z + 0.2]} r={0.25} h={0.5} c="#616161" />
      </group>
    ))}
    {xs.slice(0, -1).map((x, i) =>
      [-0.6, -0.2, 0.25, 0.6].map((o, k) => {
        const x2 = xs[i + 1];
        const pts = Array.from({length: 9}).map((_, j) => {
          const u = j / 8;
          return [x + o + (x2 - x) * u, 7.4 - Math.sin(u * Math.PI) * (0.6 + k * 0.25), z];
        });
        return pts.slice(0, -1).map((pt, j) => {
          const q = pts[j + 1];
          const dx = q[0] - pt[0], dy = q[1] - pt[1];
          const len = Math.hypot(dx, dy);
          return <mesh key={`${i}${k}${j}`} position={[(pt[0] + q[0]) / 2, (pt[1] + q[1]) / 2, z]} rotation={[0, 0, Math.atan2(dy, dx)]} material={toon('#1b1b1b')}><boxGeometry args={[len, 0.03, 0.03]} /></mesh>;
        });
      }),
    )}
  </group>
);

// Neighbourhood houses behind the school: flat roofs, black water tanks, balconies.
export const Houses: React.FC<{z: number; from: number; n: number}> = ({z, from, n}) => {
  const cols = ['#F4C6A5', '#B9D7EA', '#F6E3A1', '#D7C4E6', '#C8E6C9', '#FFCCBC'];
  return (
    <group>
      {Array.from({length: n}).map((_, i) => {
        const h = 7 + ((i * 37) % 4) * 2.2, w = 6 + ((i * 13) % 3);
        const x = from + i * 7.5;
        return (
          <group key={i}>
            <OBox p={[x, h / 2, z]} s={[w, h, 5]} c={cols[i % cols.length]} />
            {Array.from({length: Math.floor(h / 2.6)}).map((_, f) =>
              [2.52, -2.52].map((dz) => <OBox key={`${f}${dz}`} p={[x, 1.6 + f * 2.6, z + dz]} s={[w * 0.6, 0.9, 0.05]} c="#5D8AA8" line={0.03} />),
            )}
            <OCyl p={[x + w * 0.25, h + 0.6, z]} r={0.55} h={1.2} c={i % 2 ? '#212121' : '#1565C0'} />
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- locations
// Field + brick walkway (characters walk along z = 0) + school + neighbourhood.
export const FieldWorld: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -30]} material={toon('#7CC35A')}><planeGeometry args={[400, 100]} /></mesh>
    <OBox p={[0, 0.02, 0]} s={[400, 0.04, 2.4]} c="#C8704E" line={0.03} />
    {[-0.6, 0, 0.6].map((z) => <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, z]} material={toon('#9E5236')}><planeGeometry args={[400, 0.04]} /></mesh>)}
    <School3 p={[12, 0, -22]} />
    <Houses z={-38} from={-30} n={12} />
    <BoundaryWall z={-30} from={-40} to={70} />
    <Krishnachura p={[-10, 0, -9]} s={1.15} />
    {/* in view of the walkway shots */}
    <Krishnachura p={[9.5, 0, -9]} s={1.1} />
    <Banana p={[0.5, 0, -10]} />
    <Banana p={[2, 0, -11]} s={0.85} />
    <CoconutPalm p={[-2.5, 0, -16]} s={1.05} />
    <Krishnachura p={[38, 0, -10]} />
    <CoconutPalm p={[-22, 0, -20]} s={1.1} />
    <CoconutPalm p={[46, 0, -21]} lean={-0.1} />
    <Banana p={[-15, 0, -12]} />
    <Banana p={[32, 0, -12]} s={0.9} />
    {[-30, 2, 24, 58].map((x, i) => <Tree3 key={x} p={[x, 0, -24]} s={1.2} tone={i % 2} />)}
    <PoleLine xs={[-26, -6, 14, 34, 54]} z={-25} />
    <TeaStall p={[-24, 0, -4]} rotY={0.35} />
  </group>
);

// Street in front of the school gate: road, rickshaws, tea stall, poles.
export const GateWorld: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -20]} material={toon('#7CC35A')}><planeGeometry args={[300, 100]} /></mesh>
    <OBox p={[0, 0.01, 6]} s={[300, 0.02, 7]} c="#6B6B6B" line={0} />
    <OBox p={[0, 0.03, 0]} s={[4.2, 0.04, 30]} c="#C9B48E" line={0.02} />
    <BoundaryWall z={-6} from={-60} to={60} gap={[-2.4, 2.4]} />
    <Gate3 p={[0, 0, -6]} />
    <School3 p={[0, 0, -26]} len={40} />
    <Houses z={-44} from={-40} n={11} />
    <Krishnachura p={[-7, 0, -9]} s={1.2} />
    <CoconutPalm p={[9, 0, -10]} />
    {/* street life outside, seen through the open gate from the yard */}
    <Rickshaw p={[-1.2, 0, 4.5]} rotY={0.25} />
    <Rickshaw p={[7.5, 0, 7]} rotY={Math.PI - 0.3} />
    <TeaStall p={[-11, 0, -3.5]} rotY={0.25} />
    <TeaStall p={[3.8, 0, 9.5]} rotY={Math.PI} />
    <Houses z={15} from={-30} n={9} />
    <PoleLine xs={[-18, -4, 10, 24]} z={-5.4} />
    <PoleLine xs={[-20, -2, 16]} z={10.5} />
  </group>
);
