// ---------------------------------------------------------------------------
// Episode 1 settings. Change text / colours here, not inside the components.
// ---------------------------------------------------------------------------

export const FPS = 30;
export const SIZE = 1080; // square canvas
// No title bar (owner's decision, 2026-11-25): the picture fills the whole frame.
export const TITLE_H = 0;
export const PIC_W = SIZE;
export const PIC_H = SIZE - TITLE_H;

// Breaking School logo (ep1/brand/logo.svg, horizontal amber wordmark) as a watermark.
export const WATERMARK_OPACITY = 0.7;
export const WATERMARK_W = 230; // px wide, top-right corner

// Fonts (files live in public/fonts, loaded in src/fonts.ts)
export const FONT_BN = '"Hind Siliguri", "Noto Sans Bengali", "Noto Color Emoji", sans-serif';

export const INK = '#1b1b1b';
export const SW = 5.5; // outline width

// The script. File names match ep1/voices/.
export type Speaker = 'A' | 'B' | 'C' | 'BC';
export const LINES: {id: string; file: string; speaker: Speaker; text: string}[] = [
  {id: 'v01', file: 'v01_B.mp3', speaker: 'B', text: 'মাম্মা, এইডা কিডা!'},
  {id: 'v02', file: 'v02_C.mp3', speaker: 'C', text: 'ধুর হালা, ওইটা রাহুলের গার্লফ্রেন্ড।'},
  {id: 'v03', file: 'v03_B.mp3', speaker: 'B', text: 'ধুর, এসব তো ঠিক না। এইসব বয়সে এইসব লুচ্চামি করে বেড়াইতেছে এরা। পাক্কা জাহান্নামী হালারা।'},
  {id: 'v04', file: 'v04_C.mp3', speaker: 'C', text: 'তুই যে কত বড় লুচ্চা আমি ওইটা জানি।'},
  {id: 'v05', file: 'v05_A.mp3', speaker: 'A', text: 'বলদরা, পড়াশোনা করছস কিছু? আজকে সৌমিক স্যার কিন্তু ফাটাইব পড়া না পারলে।'},
  {id: 'v06', file: 'v06_C.mp3', speaker: 'C', text: 'আমি তো কিছুই পড়ি নাই।'},
  {id: 'v07', file: 'v07_B.mp3', speaker: 'B', text: 'পড়াশোনা তো একটা দুর্লভ বিষয়, এটা তো আমি আর করি না, আমি তো সস্তা জিনিস করি।'},
  {id: 'v08', file: 'v08_A.mp3', speaker: 'A', text: 'যে একখান ছোট্ট ক্লাস পাইছি, এইটা দেখ, এইটা দেখলে বাঁচে যাইব।'},
  {id: 'v09', file: 'v09_BC.mp3', speaker: 'BC', text: 'শুরু কর বেটা, তাড়াতাড়ি কর।'},
];
