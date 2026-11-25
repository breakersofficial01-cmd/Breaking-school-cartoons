// Logo (ep1/brand/logo.svg — horizontal amber wordmark, 732x256), watermark and captions.
// There is NO title bar: the owner removed it on 2026-11-25.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {FONT_BN, PIC_H, PIC_W, TITLE_H, WATERMARK_OPACITY, WATERMARK_W} from '../config';
import assets from '../generated/assets.json';

const LOGO_RATIO = 256 / 732;

// The Breaking School logo at a given width. A soft dark shadow keeps the amber
// readable on the bright sky; `plain` drops it (e.g. on the phone's white UI).
export const LogoMark: React.FC<{width: number; plain?: boolean}> = ({width, plain}) => {
  const style: React.CSSProperties = {width, height: width * LOGO_RATIO, objectFit: 'contain', display: 'block',
    filter: plain ? undefined : 'drop-shadow(0 0 3px rgba(0,0,0,0.55)) drop-shadow(0 2px 6px rgba(0,0,0,0.35))'};
  if (assets.hasLogo) return <Img src={staticFile(assets.logoFile)} style={style} />;
  // fallback if the logo file is ever missing
  return <div style={{...style, background: '#FFB21E', color: '#111', fontFamily: 'Arial Black, Arial', fontWeight: 900, fontSize: width * 0.12, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>BREAKING SCHOOL</div>;
};

export const Watermark: React.FC = () => (
  <div style={{position: 'absolute', right: 22, top: TITLE_H + 22, opacity: WATERMARK_OPACITY, zIndex: 40}}>
    <LogoMark width={WATERMARK_W} />
  </div>
);

// Burned-in caption: white text, thick black outline, bottom of the picture area, max 2 lines.
export const Caption: React.FC<{text: string; bottom?: number; width?: number; fontSize?: number}> = ({
  text, bottom = 34, width = PIC_W - 120, fontSize = 50,
}) => {
  if (!text) return null;
  const style: React.CSSProperties = {
    fontFamily: FONT_BN, fontWeight: 700, fontSize, lineHeight: 1.35, textAlign: 'center',
    maxWidth: width, textWrap: 'balance' as React.CSSProperties['textWrap'], paddingTop: 6,
  };
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', zIndex: 45}}>
      <div style={{position: 'relative'}}>
        {/* stroke layer under the fill layer, so the outline never eats into the letters */}
        <div style={{...style, color: '#000', WebkitTextStroke: '12px #000'}}>{text}</div>
        <div style={{...style, color: '#fff', position: 'absolute', inset: 0}}>{text}</div>
      </div>
    </div>
  );
};

// The picture area: everything below the title bar is clipped to this box.
export const PictureArea: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 0, top: TITLE_H, width: PIC_W, height: PIC_H, overflow: 'hidden', background: '#000'}}>
    {children}
  </div>
);
