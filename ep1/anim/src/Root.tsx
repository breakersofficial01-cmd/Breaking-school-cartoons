// Registers the compositions. Render with e.g.
//   npx remotion render src/index.ts Main1x1 ../out/final_1x1.mp4
import React from 'react';
import {Composition} from 'remotion';
import {FPS, SIZE} from './config';
import {TL} from './anim';
import {Episode1x1, Episode9x16} from './Episode';
import type {EpisodeProps} from './Episode';
import {loadFonts} from './fonts';

loadFonts();
const frames = Math.round(TL.total * FPS);

export const Root: React.FC = () => (
  <>
    <Composition id="Main1x1" component={Episode1x1} durationInFrames={frames} fps={FPS} width={SIZE} height={SIZE} defaultProps={{captions: true, audio: true} as EpisodeProps} />
    <Composition id="Clean1x1" component={Episode1x1} durationInFrames={frames} fps={FPS} width={SIZE} height={SIZE} defaultProps={{captions: false, audio: true} as EpisodeProps} />
    <Composition id="Vertical" component={Episode9x16} durationInFrames={frames} fps={FPS} width={SIZE} height={1920} defaultProps={{captions: true, audio: true} as EpisodeProps} />
  </>
);
