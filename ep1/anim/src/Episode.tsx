// The episode: full-frame picture (active shot) + logo watermark + captions + audio. No title bar.
// Used by every composition in Root.tsx (1:1 with/without captions, 9:16).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FPS, FONT_BN, PIC_H, PIC_W, SIZE} from './config';
import {TL} from './anim';
import {Caption, PictureArea, Watermark} from './ui/Frame';
import {Shot3} from './shots/Shot3';
import {Shot1, Shot2, Shot4, Shot5, Shot6, Shot7} from './shots/ShotsField';
import {PhoneShots} from './shots/ShotPhone';

// Fallback card if a shot id has no component (should not happen).
const Pending: React.FC<{n: number}> = ({n}) => (
  <div style={{width: PIC_W, height: PIC_H, background: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BN, fontSize: 60}}>
    Shot {n}
  </div>
);

const SHOTS: Record<number, React.FC<{t: number}>> = {1: Shot1, 2: Shot2, 3: Shot3, 4: Shot4, 5: Shot5, 6: Shot6, 7: Shot7, 8: PhoneShots, 9: PhoneShots};

export const captionAt = (t: number) => TL.captions.find((c) => t >= c.start && t < c.end)?.text ?? '';

export const Picture: React.FC<{t: number}> = ({t}) => {
  const s = TL.shots.find((x) => t >= x.start && t < x.end) ?? TL.shots[TL.shots.length - 1];
  const C = SHOTS[s.id];
  return <PictureArea>{C ? <C t={t} /> : <Pending n={s.id} />}</PictureArea>;
};

// Square 1080x1080 frame (title bar + picture). `captions` burns in the Bangla captions.
export const Square: React.FC<{captions: boolean}> = ({captions}) => {
  const t = useCurrentFrame() / FPS;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE, overflow: 'hidden', background: '#000'}}>
      <Picture t={t} />
      <Watermark />
      {captions ? <Caption text={captionAt(t)} /> : null}
    </div>
  );
};

export type EpisodeProps = {captions: boolean; audio: boolean};

export const Episode1x1: React.FC<EpisodeProps> = ({captions, audio}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Square captions={captions} />
    {audio ? <Audio src={staticFile('audio/mix.wav')} /> : null}
  </AbsoluteFill>
);

// 1080x1920: the 1:1 picture centred, dark bars, captions in the lower bar.
export const Episode9x16: React.FC<EpisodeProps> = ({captions, audio}) => {
  const t = useCurrentFrame() / FPS;
  const top = (1920 - SIZE) / 2;
  return (
    <AbsoluteFill style={{background: '#14161c'}}>
      <div style={{position: 'absolute', left: 0, top, width: SIZE, height: SIZE}}>
        <Square captions={false} />
      </div>
      {captions ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: top + SIZE, height: 1920 - top - SIZE}}>
          <Caption text={captionAt(t)} bottom={170} fontSize={58} />
        </div>
      ) : null}
      {audio ? <Audio src={staticFile('audio/mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
