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
- **The logo appears ONLY in the top-right corner** (2026-11-25). Nowhere else: not on the
  phone app's channel page or thumbnails (use plain "Breaking School" text there instead),
  not on signs. The red "B" shirt badge is part of the uniform, not the logo.

- **Acting style** (2026-11-25) follows the owner's reference video: shot/reverse-shot
  medium close-ups of the speaker turned 3/4 toward his partner on a blurred background,
  reaction shots, strong brow/eye acting; wide shots only for set-ups and physical comedy.
- **3D world, 2D boys** (2026-11-25): locations are Three.js (`src/scenes3d/`), toon-shaded
  with ink outlines; the 2D rigs are projected into them (`src/shots/stage.tsx`).
- **Bangladeshi vibe**: krishnachura, coconut + banana trees, rickshaws, tea stall ("চা"),
  poles with tangled wires, houses with roof water tanks, Bangla signboards/banner.
  Character tweaks allowed by the owner: boys wear a school ID card on a red lanyard;
  two girls wear a white orna.
- 3D renders need `--gl=swangle` in this cloud session.
- Optional upgrade: Quaternius CC0 packs (itch.io is blocked here; owner can upload them
  to Google Drive and they load via `drive.usercontent.google.com`).

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
