// Handwritten letter recognition that runs fully in the browser.
// The model is a small CNN trained on EMNIST "balanced" letters (see ml/train.py).
// EMNIST merges upper/lower case for letters whose shapes are the same (c/C, o/O, s/S...),
// so for those letters the case is decided from the notebook guide lines instead.

import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';

import { GUIDES } from './guides.js';

const MERGED = new Set('CIJKLMOPSUVWXYZ');
const X_HEIGHT_LOWER = new Set('cmosuvwxz');
const DESCENDER_LOWER = new Set('pyj');
const LOOKALIKE = { I: ['L'], l: ['I', 'L'], i: ['I', 'L', 'J'], j: ['J', 'I'], o: ['Q'], O: ['Q'] };
const UPPER_ONLY = new Set('ABDEFGHNQRT');
const LOWER_X_ONLY = new Set('aenr');
const LOWER_ASC = new Set('bdfht');

let model = null;
let loading = null;

export function loadModel() {
  if (model) return Promise.resolve(model);
  if (loading) return loading;
  loading = (async () => {
    await tf.setBackend('cpu');
    await tf.ready();
    const base = `${import.meta.env.BASE_URL}model/`;
    const [meta, buf] = await Promise.all([
      fetch(base + 'meta.json').then((r) => r.json()),
      fetch(base + 'weights.bin').then((r) => r.arrayBuffer()),
    ]);
    return initModel(meta, buf);
  })();
  return loading;
}

export function initModel(meta, buf) {
  let off = 0;
  const tensors = meta.weights.map((w) => {
    const size = w.shape.reduce((a, b) => a * b, 1);
    const t = tf.tensor(new Float32Array(buf, off * 4, size), w.shape);
    off += size;
    return { name: w.name, t };
  });
  model = { labels: meta.labels, tensors };
  return model;
}

/** Class probabilities for one 28x28 image (Float32Array, 0..1, white ink on black). */
export function predictPixels(pixels) {
  const out = tf.tidy(() => forward(tf.tensor4d(pixels, [1, 28, 28, 1])));
  const probs = out.dataSync();
  out.dispose();
  return probs;
}

function forward(x) {
  const w = model.tensors;
  let i = 0;
  const next = () => w[i++].t;
  const conv = (h) => tf.relu(tf.add(tf.conv2d(h, next(), 1, 'same'), next()));
  const bn = (h) => {
    const g = next(), b = next(), m = next(), v = next();
    return tf.add(tf.mul(tf.sub(h, m), tf.div(g, tf.sqrt(tf.add(v, 1e-3)))), b);
  };
  let h = bn(conv(x));
  h = bn(conv(h));
  h = tf.maxPool(h, 2, 2, 'valid');
  h = bn(conv(h));
  h = bn(conv(h));
  h = tf.maxPool(h, 2, 2, 'valid');
  h = bn(conv(h));
  h = tf.mean(h, [1, 2]);
  h = tf.relu(tf.add(tf.matMul(h, next()), next()));
  return tf.softmax(tf.add(tf.matMul(h, next()), next()));
}

/** strokes: array of arrays of {x, y} in box-relative units (0..1 of width / height). */
export function strokeBounds(strokes, aspect) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of strokes)
    for (const p of s) {
      x0 = Math.min(x0, p.x * aspect);
      x1 = Math.max(x1, p.x * aspect);
      y0 = Math.min(y0, p.y);
      y1 = Math.max(y1, p.y);
    }
  return { x0, y0, x1, y1 };
}

/** Render strokes the way EMNIST images look: fitted to 24px, centered in 28x28, white on black. */
export function rasterize(strokes, aspect) {
  const S = 112;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, S, S);
  const b = strokeBounds(strokes, aspect);
  const bw = Math.max(b.x1 - b.x0, 1e-3), bh = Math.max(b.y1 - b.y0, 1e-3);
  const scale = 92 / Math.max(bw, bh);
  const ox = S / 2 - ((b.x0 + b.x1) / 2) * scale;
  const oy = S / 2 - ((b.y0 + b.y1) / 2) * scale;
  g.strokeStyle = '#fff';
  g.fillStyle = '#fff';
  g.lineWidth = 12;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const s of strokes) {
    if (s.length === 1) {
      g.beginPath();
      g.arc(s[0].x * aspect * scale + ox, s[0].y * scale + oy, 6, 0, Math.PI * 2);
      g.fill();
      continue;
    }
    g.beginPath();
    s.forEach((p, k) => {
      const X = p.x * aspect * scale + ox, Y = p.y * scale + oy;
      if (k === 0) g.moveTo(X, Y);
      else g.lineTo(X, Y);
    });
    g.stroke();
  }
  const half = document.createElement('canvas');
  half.width = half.height = 56;
  const hg = half.getContext('2d');
  hg.imageSmoothingQuality = 'high';
  hg.drawImage(c, 0, 0, 56, 56);
  const small = document.createElement('canvas');
  small.width = small.height = 28;
  const sg = small.getContext('2d', { willReadFrequently: true });
  sg.imageSmoothingQuality = 'high';
  sg.drawImage(half, 0, 0, 28, 28);
  const px = sg.getImageData(0, 0, 28, 28).data;
  const out = new Float32Array(784);
  for (let k = 0; k < 784; k++) out[k] = px[k * 4] / 255;
  return out;
}

/** Decide upper/lower case from where the letter sits on the guide lines. */
export function caseHint(strokes) {
  const b = strokeBounds(strokes, 1);
  const xh = GUIDES.mid - GUIDES.top;
  const tall = b.y0 < GUIDES.mid - 0.5 * xh;
  const short = b.y0 > GUIDES.mid - 0.22 * xh;
  const desc = b.y1 > GUIDES.base + 0.3 * (1 - GUIDES.base);
  const hasDot =
    strokes.length >= 2 &&
    strokes.some((s) => {
      const sb = strokeBounds([s], 1);
      return sb.y1 - sb.y0 < 0.12 && sb.x1 - sb.x0 < 0.15;
    });
  return { tall, short, desc, hasDot };
}

function caseOf(label, hint) {
  const l = label.toLowerCase();
  if (!MERGED.has(label)) return label === l ? 'lower' : 'upper';
  if (X_HEIGHT_LOWER.has(l)) return hint.short ? 'lower' : hint.tall ? 'upper' : 'either';
  if (DESCENDER_LOWER.has(l)) return hint.desc ? 'lower' : hint.short ? 'lower' : 'either';
  if (l === 'i') return hint.hasDot || hint.short ? 'lower' : 'either';
  return 'either';
}

function display(label, hint) {
  const c = caseOf(label, hint);
  if (c === 'lower') return label.toLowerCase();
  return label;
}

/** Returns sorted predictions [{label, char, p}] for one letter box. */
export async function recognize(strokes, aspect = 1) {
  await loadModel();
  if (!strokes.length) return [];
  const pixels = rasterize(strokes, aspect);
  const probs = Array.from(predictPixels(pixels));
  const hint = caseHint(strokes);
  // Guide-line prior: a letter that stays under the dashed line is unlikely to be a capital, and vice versa.
  model.labels.forEach((l, k) => {
    if (hint.short && (UPPER_ONLY.has(l) || LOWER_ASC.has(l))) probs[k] *= 0.12;
    if (hint.tall && LOWER_X_ONLY.has(l)) probs[k] *= 0.12;
  });
  const sum = probs.reduce((a, b) => a + b, 0);
  const preds = probs
    .map((p, k) => ({ label: model.labels[k], p: p / sum }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 5)
    .map((r) => ({ ...r, char: display(r.label, hint), case: caseOf(r.label, hint) }));
  preds.hint = hint;
  return preds;
}

/**
 * Lenient check: the target counts as written if it is among the top 3 guesses with
 * reasonable confidence and the case is not clearly wrong.
 */
export function judgeLetter(target, preds, { topK = 3, minP = 0.08 } = {}) {
  if (!preds.length) return { ok: false, reason: 'empty' };
  const isLower = target === target.toLowerCase();
  const want = MERGED.has(target.toUpperCase()) ? target.toUpperCase() : target;
  const accepted = new Set([want, ...(LOOKALIKE[target] || [])]);
  const top = preds.slice(0, topK).filter((p, i) => i === 0 || p.p >= minP);
  const hit = top.find((p) => accepted.has(p.label));
  if (!hit) {
    const otherCase = preds.slice(0, topK).find((p) => p.label.toLowerCase() === target.toLowerCase());
    return { ok: false, reason: otherCase ? 'case' : 'shape' };
  }
  const c = hit.label === want ? hit.case : MERGED.has(want) ? caseOf(want, preds.hint) : isLower ? 'lower' : 'upper';
  if (c !== 'either' && (c === 'lower') !== isLower) return { ok: false, reason: 'case' };
  return { ok: true, p: hit.p };
}
