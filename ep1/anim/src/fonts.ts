// Loads the Bangla fonts from public/fonts (copied from the @fontsource npm
// packages, so renders never depend on the network). Rendering waits until
// every face is ready, so Bangla conjuncts are shaped with the right font.
import {continueRender, delayRender, staticFile} from 'remotion';

const FACES: {family: string; file: string; weight: string; range?: string}[] = [
  {family: 'Hind Siliguri', file: 'hind-siliguri-bengali-500-normal.woff2', weight: '500'},
  {family: 'Hind Siliguri', file: 'hind-siliguri-bengali-700-normal.woff2', weight: '700'},
  {family: 'Hind Siliguri', file: 'hind-siliguri-latin-500-normal.woff2', weight: '500', range: 'U+0000-00FF,U+2000-206F'},
  {family: 'Hind Siliguri', file: 'hind-siliguri-latin-700-normal.woff2', weight: '700', range: 'U+0000-00FF,U+2000-206F'},
  {family: 'Noto Sans Bengali', file: 'noto-sans-bengali-bengali-700-normal.woff2', weight: '700'},
  {family: 'Noto Sans Bengali', file: 'noto-sans-bengali-bengali-900-normal.woff2', weight: '900'},
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading Bangla fonts');
  Promise.all(
    FACES.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile('fonts/' + f.file)}) format('woff2')`, {
        weight: f.weight,
        unicodeRange: f.range ?? 'U+0951-0952,U+0964-0965,U+0980-09FE,U+200C-200D,U+20B9,U+25CC',
      });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error('Font load failed', e);
      continueRender(handle);
    });
};
