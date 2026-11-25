// 3D world for Episode 1 (owner choice 2026-11-25: "3D world, 2D boys", Bangladeshi vibe).
// Toon-shaded Three.js meshes with black inverted-hull outlines so the 3D sets match
// the 2D characters' ink style. Characters stay 2D: shots project a 3D point to the
// screen with `project()` (same maths as the Three camera) and draw the Boy there.
//
// Units: metres. Walkway runs along +x at z = 0 (characters stand here).
// Field: z from -2 to -12; school building at z = -16. Camera looks toward -z.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {PIC_H, PIC_W} from '../config';

export type V3 = [number, number, number];
export type Cam3 = {pos: V3; target: V3; fov: number};

// ---------------------------------------------------------------- projection
// World point -> screen pixels + pixels-per-metre at that depth (for scaling 2D sprites).
export const project = (cam: Cam3, p: V3) => {
  const c = new THREE.PerspectiveCamera(cam.fov, PIC_W / PIC_H, 0.1, 500);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  const depth = -new THREE.Vector3(...p).applyMatrix4(c.matrixWorldInverse).z;
  const pxPerM = PIC_H / 2 / (Math.tan(((cam.fov / 2) * Math.PI) / 180) * depth);
  return {x: ((v.x + 1) / 2) * PIC_W, y: ((1 - v.y) / 2) * PIC_H, pxPerM, depth};
};

// ---------------------------------------------------------------- toon look
let ramp: THREE.DataTexture | null = null;
const toonRamp = () => {
  if (ramp) return ramp;
  const data = new Uint8Array([120, 120, 120, 255, 195, 195, 195, 255, 255, 255, 255, 255]); // 3 bands
  ramp = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  ramp.minFilter = THREE.NearestFilter;
  ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
};
const mats = new Map<string, THREE.Material>();
export const toon = (color: string) => {
  if (!mats.has(color)) mats.set(color, new THREE.MeshToonMaterial({color, gradientMap: toonRamp()}));
  return mats.get(color)!;
};
export const INK_MAT = new THREE.MeshBasicMaterial({color: '#1b1b1b', side: THREE.BackSide});

// A box with a black outline shell (inverted hull). size in metres.
export const OBox: React.FC<{p: V3; s: V3; c: string; line?: number; r?: V3}> = ({p, s, c, line = 0.05, r}) => (
  <group position={p} rotation={r}>
    <mesh material={toon(c)}><boxGeometry args={s} /></mesh>
    {line > 0 ? <mesh material={INK_MAT}><boxGeometry args={[s[0] + line * 2, s[1] + line * 2, s[2] + line * 2]} /></mesh> : null}
  </group>
);

export const OSphere: React.FC<{p: V3; r: number; c: string; sy?: number}> = ({p, r, c, sy = 1}) => (
  <group position={p} scale={[1, sy, 1]}>
    <mesh material={toon(c)}><icosahedronGeometry args={[r, 1]} /></mesh>
    <mesh material={INK_MAT}><icosahedronGeometry args={[r * 1.06, 1]} /></mesh>
  </group>
);

export const OCyl: React.FC<{p: V3; r: number; h: number; c: string; seg?: number; r2?: number; rot?: V3}> = ({p, r, h, c, seg = 10, r2, rot}) => (
  <group position={p} rotation={rot}>
    <mesh material={toon(c)}><cylinderGeometry args={[r2 ?? r, r, h, seg]} /></mesh>
    <mesh material={INK_MAT}><cylinderGeometry args={[(r2 ?? r) + 0.04, r + 0.04, h + 0.04, seg]} /></mesh>
  </group>
);

// Flat sign with Bangla text drawn on a canvas texture (fonts are loaded before render).
export const Sign: React.FC<{p: V3; w: number; h: number; text: string; bg: string; fg: string; sub?: string; r?: V3}> = ({p, w, h, text, bg, fg, sub, r}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = Math.round((1024 * h) / w);
    const g = c.getContext('2d')!;
    g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(c.height * (sub ? 0.42 : 0.6))}px "Hind Siliguri", "Noto Sans Bengali", sans-serif`;
    g.fillText(text, c.width / 2, c.height * (sub ? 0.38 : 0.52));
    if (sub) { g.font = `900 ${Math.round(c.height * 0.2)}px Arial`; g.fillText(sub, c.width / 2, c.height * 0.8); }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [w, h, text, bg, fg, sub]);
  return (
    <group position={p} rotation={r}>
      <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} /></mesh>
      <mesh position={[0, 0, -0.03]} material={INK_MAT}><boxGeometry args={[w + 0.12, h + 0.12, 0.04]} /></mesh>
    </group>
  );
};

// ---------------------------------------------------------------- sky + canvas
const Sky: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2; c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#5FB8EE'); grd.addColorStop(0.7, '#BDE7F8'); grd.addColorStop(1, '#FFF1D2');
    g.fillStyle = grd; g.fillRect(0, 0, 2, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return <primitive attach="background" object={tex} />;
};

// keeps the Three camera in sync with the shot's camera every frame
const CamSync: React.FC<{cam: Cam3}> = ({cam}) => {
  const {camera} = useThree();
  const pc = camera as THREE.PerspectiveCamera;
  pc.fov = cam.fov;
  pc.position.set(...cam.pos);
  pc.lookAt(...cam.target);
  pc.updateProjectionMatrix();
  return null;
};

export const Scene3D: React.FC<{cam: Cam3; children: React.ReactNode; blur?: number}> = ({cam, children, blur = 0}) => (
  <div style={{position: 'absolute', inset: 0, filter: blur ? `blur(${blur}px)` : undefined}}>
    <ThreeCanvas width={PIC_W} height={PIC_H} gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: cam.fov, position: cam.pos, near: 0.1, far: 500}}>
      <CamSync cam={cam} />
      <Sky />
      <ambientLight intensity={1.5} />
      <directionalLight position={[8, 14, 10]} intensity={2.0} />
      {children}
    </ThreeCanvas>
  </div>
);
