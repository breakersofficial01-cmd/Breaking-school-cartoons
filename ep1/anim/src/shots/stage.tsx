// Stage = a 3D location (Three.js) + 2D characters standing in it.
// Each actor has a 3D foot position; `project()` gives its screen point and
// pixels-per-metre, so the 2D rig is drawn at the right place and size and
// actors are drawn far-to-near. Used by every shot except the phone close-up.
import React from 'react';
import {Boy, bodyGeom} from '../characters/Boy';
import type {CharId, Pose} from '../characters/Boy';
import {Girl, GIRLS} from '../characters/Girl';
import type {GirlSpec} from '../characters/Girl';
import {PIC_H, PIC_W} from '../config';
import {Scene3D, project} from '../scenes3d/World3D';
import type {Cam3, V3} from '../scenes3d/World3D';
import {FieldWorld, GateWorld} from '../scenes3d/BdSets';

// rig units per metre (A = 650 units ≈ 1.65 m; girls are drawn smaller in their rig)
export const BOY_UNITS_PER_M = 394;
export const GIRL_UNITS_PER_M = 287;

export type Actor =
  | {kind: 'boy'; id: CharId; p: V3; pose: Pose}
  | {kind: 'girl'; spec: GirlSpec; p: V3; facing: number};

// the girls chatting mid-field (world metres)
export const GIRLS_AT: V3[] = [[4.2, 0, -6], [5.0, 0, -6.3], [5.8, 0, -6.1], [6.6, 0, -6.4]];
export const girlActors = (): Actor[] => GIRLS.map((spec, i) => ({kind: 'girl', spec, p: GIRLS_AT[i], facing: i < 2 ? 1 : -1}));

export const Stage: React.FC<{world: 'field' | 'gate'; cam: Cam3; t: number; actors: Actor[]; blur?: number; children?: React.ReactNode}> = ({world, cam, t, actors, blur = 0, children}) => {
  const placed = actors
    .map((a) => ({a, s: project(cam, a.p)}))
    .filter((x) => x.s.depth > 0.3)
    .sort((m, n) => n.s.depth - m.s.depth);
  return (
    <>
      <Scene3D cam={cam} blur={blur}>{world === 'gate' ? <GateWorld /> : <FieldWorld />}</Scene3D>
      <svg width={PIC_W} height={PIC_H} style={{position: 'absolute', inset: 0, filter: blur ? `blur(${blur}px)` : undefined}}>
        {placed.map(({a, s}, i) =>
          a.kind === 'boy' ? (
            <Boy key={i} id={a.id} x={s.x} y={s.y} scale={s.pxPerM / BOY_UNITS_PER_M} pose={a.pose} />
          ) : (
            <Girl key={i} x={s.x} y={s.y} scale={s.pxPerM / GIRL_UNITS_PER_M} spec={a.spec} t={t} facing={a.facing} />
          ),
        )}
      </svg>
      {children}
    </>
  );
};

// ---------------------------------------------------------------- MCU
// Medium close-up like the reference video: blurred 3D location behind, one boy big
// (head + upper chest), off-centre so there is looking room on the side he faces.
export const MCU_SCALE = 2.5;
export const MCU_HEAD_Y = 450;
export const mcuHeadX = (turn: number) => PIC_W / 2 - Math.sign(turn) * 150;

export const MCU: React.FC<{id: CharId; pose: Pose; t: number; at: V3; world?: 'field' | 'gate'; children?: React.ReactNode; extras?: Actor[]}> = ({id, pose, t, at, world = 'field', children, extras = girlActors()}) => {
  const g = bodyGeom(id);
  const turn = pose.turn ?? 0;
  // background camera: at the boy's head height, looking past him toward his facing side
  const cam: Cam3 = {pos: [at[0], 1.35, at[2] + 2.6], target: [at[0] + Math.sign(turn) * 1.5, 1.7, at[2] - 6], fov: 38};
  return (
    <>
      <Stage world={world} cam={cam} t={t} actors={extras} blur={7} />
      <svg width={PIC_W} height={PIC_H} style={{position: 'absolute', inset: 0}}>
        <Boy id={id} x={mcuHeadX(turn)} y={MCU_HEAD_Y - g.headCy * MCU_SCALE} scale={MCU_SCALE} pose={pose} />
        {children}
      </svg>
    </>
  );
};
