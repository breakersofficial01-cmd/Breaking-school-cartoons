#!/usr/bin/env bash
# Final renders and exports (prompt section 7). Run from ep1/anim:  bash tools/export.sh
# Long: run it in the background and watch the log.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=../out
mkdir -p "$OUT/scenes" "$OUT/audio"
R="npx remotion render src/index.ts --gl=swangle --codec=h264 --log=error"

echo "== timeline + audio"
node tools/prepare.mjs
node tools/audio.mjs

echo "== 1. final_1x1.mp4 (captions)"
$R Main1x1 "$OUT/final_1x1.mp4" --crf=18 --audio-bitrate=192k
echo "== 3. clean_1x1.mp4 (no captions)"
$R Clean1x1 "$OUT/clean_1x1.mp4" --crf=18 --audio-bitrate=192k
echo "== 2. final_9x16.mp4"
$R Vertical "$OUT/final_9x16.mp4" --crf=20 --audio-bitrate=192k

echo "== 4. picture_only_1x1.mp4 (no audio, no captions)"
ffmpeg -v error -y -i "$OUT/clean_1x1.mp4" -an -c:v copy "$OUT/picture_only_1x1.mp4"

echo "== 7. scenes/shotNN.mp4 (from the clean version, with audio)"
node -e "
const tl=require('./src/generated/timeline.json');
for (const s of tl.shots) console.log(String(s.id).padStart(2,'0'), s.start, (s.end-s.start).toFixed(3));
" | while read -r n start dur; do
  ffmpeg -v error -y -ss "$start" -i "$OUT/clean_1x1.mp4" -t "$dur" -c:v libx264 -crf 18 -c:a aac -b:a 192k "$OUT/scenes/shot$n.mp4" < /dev/null
done

echo "== 8. last_frame.png (hand-off frame)"
LAST=$(node -e "const tl=require('./src/generated/timeline.json'); console.log(Math.round(tl.total*tl.fps)-1)")
npx remotion still src/index.ts Clean1x1 "$OUT/last_frame.png" --frame="$LAST" --gl=swangle --log=error

echo "== sizes (must stay under 90 MB each)"
find "$OUT" -type f \( -name '*.mp4' -o -name '*.wav' -o -name '*.png' -o -name '*.srt' \) -exec du -h {} + | sort -h
