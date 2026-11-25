# Episode 1 build (Remotion)

Code-built 2D cartoon for `ep1/CLAUDE_CODE_PROMPT.md`. Run everything from `ep1/anim/`.

```bash
npm install
python3 tools/gen_voices.py          # only if ep1/voices/ is missing lines (Gemini TTS)
node tools/prepare.mjs               # ffprobe voices -> timeline, lip-sync, captions.srt
node tools/audio.mjs                 # music loop + SFX + ducking -> public/audio/mix.wav + stems
npx remotion studio src/index.ts     # preview in a browser
npx remotion render src/index.ts Main1x1 ../out/final_1x1.mp4
```

## Owner decisions that override the prompt
- **No title bar** in any scene (2026-11-25). The picture fills the whole 1080x1080 frame.
- **Logo** = `ep1/brand/logo.svg` (horizontal amber "BREAKING SCHOOL"), watermark top-right at 70%.

## Gemini TTS facts (found by testing; ai.google.dev is blocked in the cloud session)
- `gemini-3.8-flash-tts` reads text word for word; an English preamble is spoken aloud.
- `systemInstruction` is rejected and there is no style field, so acting direction goes in a
  leading `[bracket tag]`, which is not spoken. Every line is checked with `gemini-3.5-transcribe`.
- Free tier: 10 TTS requests per day per model.

## Layout
- `src/config.ts` sizes, colours, script · `src/anim.ts` timing, blinks, lip-sync helpers
- `src/characters/` rigged Boy (A/B/C) and Girl · `src/scenes/` gate + field (parallax)
- `src/shots/ShotN.tsx` one file per shot · `src/Episode.tsx` frame + captions + audio
- `src/generated/` written by `tools/prepare.mjs` (do not edit by hand)
