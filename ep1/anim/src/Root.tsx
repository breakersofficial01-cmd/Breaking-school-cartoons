// Registers the compositions. Render with e.g.
//   npx remotion render src/index.ts Main1x1 ../out/final_1x1.mp4
import React from 'react';
import {Composition} from 'remotion';
import {FPS, SIZE} from './config';
import {TL} from './anim';
import {Episode1x1, Episode9x16} from './Episode';
import type {EpisodeProps} from './Episode';
import {loadFonts} from './fonts';
import {Scene3D} from './scenes3d/World3D';
import {FieldWorld, GateWorld} from './scenes3d/BdSets';

const Test3D: React.FC<{world: 'field' | 'gate'}> = ({world}) =>
  world === 'gate' ? (
    <Scene3D cam={{pos: [0, 1.0, 14], target: [0, 3.2, -6], fov: 50}}><GateWorld /></Scene3D>
  ) : (
    <Scene3D cam={{pos: [4, 1.6, 9], target: [4, 2.2, -6], fov: 45}}><FieldWorld /></Scene3D>
  );

loadFonts();
const frames = Math.round(TL.total * FPS);

export const Root: React.FC = () => (
  <>
    <Composition id="Main1x1" component={Episode1x1} durationInFrames={frames} fps={FPS} width={SIZE} height={SIZE} defaultProps={{captions: true, audio: true} as EpisodeProps} />
    <Composition id="Clean1x1" component={Episode1x1} durationInFrames={frames} fps={FPS} width={SIZE} height={SIZE} defaultProps={{captions: false, audio: true} as EpisodeProps} />
    {/* look-dev: one still of a 3D location, e.g. --props='{"world":"gate"}' */}
    <Composition id="Test3D" component={Test3D} durationInFrames={30} fps={FPS} width={SIZE} height={SIZE} defaultProps={{world: 'field' as 'field' | 'gate'}} />
    <Composition id="Vertical"component={Episode9x16} durationInFrames={frames} fps={FPS} width={SIZE} height={1920} defaultProps={{captions: true, audio: true} as EpisodeProps} />
  </>
);
