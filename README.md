# אנגלית לכיתה ד׳ (PWA)

React + Vite app for practicing the 4th-grade English test: letters (handwriting with in-browser recognition), prepositions, CVC reading, numbers, colors and vocabulary, plus a mock exam and a parent screen.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/ (relative base path, works on GitHub Pages and Netlify)
npm run preview    # serve dist/ on http://localhost:4173
```

## Where things are

- `src/data/content.js` – all learning content (letters, words, colors, numbers, prepositions). Edit this for the next test.
- `src/lib/recognizer.js` – handwriting recognition (TensorFlow.js core, CPU backend). Weights in `public/model/`.
- `ml/train.py` – trains the letter model on EMNIST "balanced" (47 classes; digits dropped → 37 letter classes) plus stroke-rendered print letters from `ml/synth.py` (Hershey single-line fonts). Put `emnist-balanced.mat` in `ml/data/` (EMNIST, NIST; a mirror is github.com/retzl4ff/emnist-balanced), run `python3 synth.py` then `python3 train.py`, and copy `out/meta.json` + `out/weights.bin` to `public/model/`. Letters whose upper/lower shapes are identical in EMNIST (c, o, s, u, v, w, x, z, ...) get their case from the notebook guide lines.
- `scripts/letter-strokes.js`, `scripts/hershey-letters.json` – synthetic handwriting used to test recognition in the browser.
- `src/lib/speech.js` – Web Speech API (en-US) with fallback to the recordings in `public/audio/`.
- `scripts/make-audio.sh` – regenerates the fallback recordings (espeak-ng + MBROLA us1).
- `scripts/check-model.mjs` – runs the browser inference code in Node on EMNIST test samples.
- `vite.config.js` – also writes `sw.js` (offline cache of every built file).

Progress is stored in `localStorage` (key `eng4-app-v1`), per profile.
