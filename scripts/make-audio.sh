#!/usr/bin/env bash
# Regenerates the fallback recordings in public/audio with espeak-ng + MBROLA (us1 voice).
# Needs: sudo apt-get install espeak-ng mbrola mbrola-us1 ffmpeg
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/audio
node scripts/phrases.mjs | while IFS=$'\t' read -r slug text; do
  say="$text"
  # Single letters ("A.") are read as letter names.
  [[ "$text" =~ ^[A-Z]\.$ ]] && say="${text%.}"
  espeak-ng -v mb-us1 -s 125 -w /tmp/tts.wav "$say" 2>/dev/null || espeak-ng -v en-us -s 125 -w /tmp/tts.wav "$say"
  ffmpeg -loglevel error -y -i /tmp/tts.wav -af "silenceremove=start_periods=1:start_threshold=-50dB" -ac 1 -ar 22050 -b:a 40k "public/audio/$slug.mp3" </dev/null
done
ls public/audio | wc -l
