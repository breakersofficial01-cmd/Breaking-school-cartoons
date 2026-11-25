# Breaking School Cartoon — Episode 1: "Soumik Sir's Class"

You are making a short 2D cartoon comedy video for **Breaking School**, an edtech brand in Bangladesh. Build it in code, render it to MP4, and export CapCut-ready parts. Work through the steps in order. After the style-test step, stop and wait for my approval.

## Running in a cloud session (read first)

This runs in a Claude Code cloud session on my GitHub repo, not on my computer. So:

- **Long renders:** a foreground command times out after a few minutes. Run every Remotion render and long ffmpeg job **in the background**, write its log to a file, and check the log until it finishes. Render in parts (per shot) where that helps.
- **Delivering results:** I can only get files through GitHub. When a step produces something I need to review (voices, test clip, preview, final exports), **commit it and push to the branch `ep1-output`**, then tell me the file paths.
- **File sizes:** keep every committed file under 90 MB (GitHub refuses files over 100 MB). If a file is bigger, lower its bitrate. Never commit `node_modules/`, caches or intermediate frames: add them to `.gitignore`.
- **Fonts and packages** come from npm and Google Fonts, which this environment can reach.

## 0. Project folder (already prepared by me)

```
ep1/
├── CLAUDE_CODE_PROMPT.md   ← this file
├── reference/
│   ├── characters.png      ← approved character designs (A, B, C)
│   └── characters.js       ← SVG source of those characters (reuse it)
├── voices/                 ← 9 voice files, named exactly as in section 3
├── music/
│   └── bgm.mp3             ← background music (optional, see section 6)
└── brand/
    └── logo.png            ← Breaking School logo, transparent PNG
```

If a file is missing, tell me which one and continue with a placeholder instead of stopping.

## 0b. Generate the voices with Gemini TTS (only if `voices/` is empty)

If the 9 files from section 3 don't exist, generate them with Google's Gemini TTS through the REST API at `generativelanguage.googleapis.com`. My AI Studio key is stored as a **network secret** on this cloud environment: the proxy adds the `x-goog-api-key` header automatically, so send requests **without** a key (if an SDK insists on one, pass the dummy string `proxy`). If requests fail with 401/403, stop and tell me the secret isn't working.

- First read the current Gemini API text-to-speech docs (ai.google.dev, "Speech generation") and use the newest TTS model listed there (as of Nov 2026, `gemini-3.8-flash-tts`). Follow its current request format exactly.
- The newer TTS models read the input text **word for word**. Never put stage directions or speaker names inside the text. Put the acting direction in the model's style/speaker metadata field, as the docs describe.
- Language: **Bangladeshi colloquial Bangla (Dhaka street style)**, not formal or Kolkata Bangla. Speakers are 13–14-year-old boys, so voices should sound young, light and fast.
- One request per line. Save each line as WAV, then convert to `voices/vNN_X.mp3` (44.1 kHz, mono, 192 kbps). Trim leading and trailing silence to 0.1 s.
- Line 9 (`v09_BC`): generate it once with B's voice and once with C's, offset C by 0.05 s, and mix the two into one file so it sounds like both are shouting together.

| Character | Voice (pick from the docs' voice list) | Base style for every line |
| --- | --- | --- |
| A, the Prankster | An upbeat, bright young male voice (e.g. Puck) | Cocky, fast, teasing, loud |
| B, the Foodie | An excitable, slightly heavier young male voice (e.g. Fenrir) | Over-dramatic, whiny, comic |
| C, the Topper | A calm, dry young male voice (e.g. Charon) | Deadpan, flat, sarcastic |

Extra direction per line (add it to the base style):
1. v01_B: stunned and dreamy, a gasp before the line
2. v02_C: bored, can't-be-bothered
3. v03_B: fake-preachy, like an old uncle giving a sermon, slower
4. v04_C: slow, knowing, smug
5. v05_A: shouting from a distance, then urgent, stress "ফাটাইব"
6. v06_C: totally calm, innocent lie
7. v07_B: proud and philosophical, slow, then a cheeky end
8. v08_A: confident whisper, like sharing a secret
9. v09_BC: desperate, rushed, loud

After generating, play-check every file's duration with ffprobe and print a table. If a line sounds wrong (bookish pronunciation, wrong speed), regenerate that line with a clearer style instruction, at most twice per line. Then tell me the voices are AI placeholders I can replace with real recordings using the same file names.

## 1. Tech setup

- Use **Remotion** (React + TypeScript) for the animation and rendering. Use ffmpeg/ffprobe for audio analysis and the extra exports.
- Install what's needed (`npx create-video@latest` or add Remotion to a blank project), plus the Bengali fonts **Hind Siliguri** and **Noto Sans Bengali** from Google Fonts. Check that Bangla text renders correctly, with no broken conjuncts (যুক্তাক্ষর), before rendering anything long.
- Canvas: **1080 × 1080, 30 fps**. Also render a 1080 × 1920 version (section 7).
- Build every character as layered SVG React components with separate parts: head, eyes (open / half / closed), eyebrows, 5 mouth shapes (closed, small, medium, wide, "O"), torso, two arms with shoulder and elbow pivots, two legs. Animate the parts. Never use static images of whole characters.

## 2. Look and characters

**Style:** flat 2D cartoon with thick black outlines (5–6 px), simple cel shading, bright colours, and expressive big eyes. It's a Bangladeshi school comedy in the spirit of Hardtoonz-style YouTube cartoons. Reuse the shapes, proportions and colours from `reference/characters.js` and `characters.png`.

**Uniform (all boys):** white short-sleeve shirt with a red shield school badge on the pocket, **blue half pants**, white socks with a blue stripe, black school shoes.

| Code | Character | Look | Personality in this episode |
| --- | --- | --- | --- |
| A | The Prankster | Tall, skinny, spiky black hair, big grin, shirt untucked | The "saviour" who brings the class on his phone |
| B | The Foodie | Short, chubby, bowl cut, rosy cheeks, always holding a snack | Spots the girl, then turns moral when he learns she's taken |
| C | The Topper (nerd) | Glasses, neat side parting, thick eyebrows, bag strap across chest | Calls out B's hypocrisy, claims he hasn't studied |
| Girls (background, 4) | Schoolgirls | Bangladeshi girls' school uniform: white kameez and salwar, blue belt and cross-belt, hair in two plaits or a ponytail with white ribbons | Chatting and laughing in a group in the field (looping gestures only, no lines) |

Keep the girls wholesome and non-sexual: a normal school scene, normal uniforms, normal chatting.

**Locations (draw as layered SVG with parallax):**
1. **School gate:** a red-brick gate pillar with a green metal gate open, a sign reading "Breaking School High School" in Bangla and English, trees, morning sky.
2. **School field and walkway:** green field, a two-storey cream school building with blue window frames and a long verandah behind, a few trees, a flag pole. The girls stand in a group mid-field. Build it wide (about 3× the frame) so the camera can track sideways as the boys walk.
3. **Phone close-up:** A's hands holding a smartphone, with the background blurred.

**Fixed title bar (every frame):** a cream bar (#FDF1CF), 140 px tall, across the top. It reads **সৌমিক স্যারের ক্লাস 😂🤣** in bold black, with "ক্লাস" in orange #E8541E. Put it in a variable so I can change it. The picture area sits below it. Put the Breaking School logo as a small semi-transparent watermark (about 70% opacity) in the top-right corner of the picture area.

## 3. Voice files and script

Lines are in Bangla. Lay the timeline out **from the real audio durations** (use ffprobe). Leave 0.25 s between lines, plus the extra action time written in the "Action" column. Captions use the exact text below.

| # | File | Speaker | Line | Action / acting |
| --- | --- | --- | --- | --- |
| 1 | `voices/v01_B.mp3` | B | মাম্মা, এইডা কিডা! | B stops walking and his snack freezes halfway to his mouth. His eyes go huge and sparkle, staring at one girl. Quick zoom on his face. |
| 2 | `voices/v02_C.mp3` | C | ধুর হালা, ওইটা রাহুলের গার্লফ্রেন্ড। | C says it flatly without looking. The sparkle in B's eyes "pops" and he deflates. |
| 3 | `voices/v03_B.mp3` | B | ধুর, এসব তো ঠিক না। এইসব বয়সে এইসব লুচ্চামি করে বেড়াইতেছে এরা। পাক্কা জাহান্নামী হালারা। | B folds his arms and shakes his head like a wise old uncle, chin up, eyes closed, walking again. |
| 4 | `voices/v04_C.mp3` | C | তুই যে কত বড় লুচ্চা আমি ওইটা জানি। | C gives a slow side-eye and pushes his glasses up, and they glint. B sweats and looks away. |
| 5 | `voices/v05_A.mp3` | A | বলদরা, পড়াশোনা করছস কিছু? আজকে সৌমিক স্যার কিন্তু ফাটাইব পড়া না পারলে। | A runs in from the right edge, skids to a stop with a dust puff, and throws an arm round both of them. Dramatic sting on "ফাটাইব". |
| 6 | `voices/v06_C.mp3` | C | আমি তো কিছুই পড়ি নাই। | C says it calmly, pushing his glasses up (the topper's classic lie). B and A give him a "really?" look. |
| 7 | `voices/v07_B.mp3` | B | পড়াশোনা তো একটা দুর্লভ বিষয়, এটা তো আমি আর করি না, আমি তো সস্তা জিনিস করি। | B is proud and philosophical, hand on chest, then takes a big bite of his snack. |
| 8 | `voices/v08_A.mp3` | A | যে একখান ছোট্ট ক্লাস পাইছি, এইটা দেখ, এইটা দেখলে বাঁচে যাইব। | A taps his shirt pocket with a confident wink and a "ding" sparkle. |
| 9 | `voices/v09_BC.mp3` | B + C together | শুরু কর বেটা, তাড়াতাড়ি কর। | B and C both lean in close to A, desperate. Quick push-in. |

**Lip-sync:** read each voice file's loudness envelope per frame, with ffmpeg or `@remotion/media-utils`, and map it to the 5 mouth shapes. Only the speaker's mouth moves. Add automatic blinks every 2–4 s at random, small head bobs while talking, and idle breathing (a 1–2% torso scale loop) for everyone on screen.

## 4. Shot list

| Shot | Approx. time | Camera | What happens | Audio |
| --- | --- | --- | --- | --- |
| 1 | 0:00–0:04 | Low angle at the gate, slow push-in | Cinematic entrance: B and C walk through the gate side by side in slow motion. Morning sun flare and dust specks. | BGM starts strong |
| 2 | 0:04–0:06 | Wide of the field, slight pan | The girls chatting and laughing in the field. B and C enter frame left, walking. | BGM continues, lowered |
| 3 | line 1 → line 4 | Side-on tracking shot, background scrolling with parallax | B and C walk and talk (lines 1–4) with the acting from section 3. Cut to a quick close-up for line 1 and for C's glasses glint on line 4. | BGM ducked under voices |
| 4 | line 5 | Same walkway, camera stops | A enters, skids, line 5. A camera shake hits on "ফাটাইব". | Whoosh, skid, sting |
| 5 | lines 6–8 | Three-shot, small cuts between faces | Reactions as in section 3. | Comedy "ding" on line 8 |
| 6 | line 9 | Fast push-in on the three | B and C beg. | — |
| 7 | about 2 s | Over-the-shoulder from behind the three | A pulls the phone from his pocket. All three heads crowd together. | Pocket rustle |
| 8 | about 6–7 s | Close-up of the phone screen | A video app opens (see below). The search bar types **Breaking School** letter by letter with tap sounds. The channel result appears with the Breaking School logo, and he taps it. The channel page shows a grid of class videos, and he taps one. The player screen opens with a loading circle. | Tap and keyboard clicks |
| 9 | about 1 s | Zoom into the phone | The camera pushes into the phone until its screen exactly fills the picture area under the title bar. Hold for 0.5 s on a black player screen with a small loading circle. **The video ends here.** | BGM fades out |

**Phone app:** design a clean YouTube-style video app (white UI, search bar, round channel avatar, thumbnail grid). Use a **generic red play-button icon and the name "Video"**, not the real YouTube logo or wordmark. Put the Breaking School logo on the channel page and make the class thumbnails show Breaking School branding.

**Hand-off frame:** the last 0.5 s must be the phone screen filling the whole picture area, so I can place my own class video right after it in CapCut and it looks like the class starts playing on the phone.

## 5. Sound effects

If I haven't provided sound effects, generate simple ones in code (ffmpeg sine/noise synthesis or Web Audio rendered offline): whoosh, skid, dramatic sting, "ding", glasses glint "ting", pocket rustle, screen taps, keyboard clicks. Keep them short and at modest volume.

## 6. Music

Use `music/bgm.mp3` if it exists. Keep it loud for shots 1–2, then **duck it to about 20%** while anyone speaks, and fade it out over the last 2 s. If the file doesn't exist, make a light, upbeat 2-chord loop in code and tell me it's a placeholder.

## 7. Renders and exports (put everything in `ep1/out/`)

1. `final_1x1.mp4`: 1080×1080, H.264, AAC 192 kbps, burned-in Bangla captions (white text with black outline, bottom of the picture area, max 2 lines).
2. `final_9x16.mp4`: 1080×1920. Put the same 1:1 picture with its title bar in the centre, a solid dark background above and below, and captions in the lower dark area.
3. `clean_1x1.mp4`: same as #1 but **without captions** (for CapCut caption styling).
4. `picture_only_1x1.mp4`: no audio at all.
5. `audio/voices.wav`, `audio/music.wav`, `audio/sfx.wav`: separate stems, aligned to the timeline.
6. `captions.srt`: Bangla subtitles with exact timings.
7. `scenes/shot01.mp4` … `shot09.mp4`: each shot as its own clip, with audio.
8. `last_frame.png`: the final hand-off frame.

## 8. Working order

1. Set up the project, fonts and assets. Report any missing files.
2. Run ffprobe on all voice files and print the timeline (shot, start, end).
3. **Style test:** render only shot 3, lines 1–2 (about 5 s), to `out/test_shot3.mp4` and stop. Wait for my "OK" or my changes before building the rest.
4. Build every shot and render the low-res preview `out/preview_540.mp4`. Tell me the total duration.
5. After my approval, do the final renders and exports from section 7.
6. Finish with a short report: total length, the files produced, and anything that used a placeholder.
