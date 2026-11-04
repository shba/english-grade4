// Sanity check: runs the browser inference code in Node on EMNIST test samples.
import { readFileSync } from 'node:fs';
import { initModel, predictPixels } from '../src/lib/recognizer.js';
import * as tf from '@tensorflow/tfjs-core';

const [xPath, yPath] = process.argv.slice(2);
await tf.setBackend('cpu');
const meta = JSON.parse(readFileSync('public/model/meta.json', 'utf8'));
const w = readFileSync('public/model/weights.bin');
initModel(meta, w.buffer.slice(w.byteOffset, w.byteOffset + w.byteLength));
const xb = readFileSync(xPath);
const xs = new Float32Array(xb.buffer, xb.byteOffset, xb.byteLength / 4);
const yb = readFileSync(yPath);
const ys = new Int32Array(yb.buffer.slice(yb.byteOffset, yb.byteOffset + yb.byteLength));
let ok = 0;
const t0 = Date.now();
for (let i = 0; i < ys.length; i++) {
  const p = predictPixels(xs.subarray(i * 784, (i + 1) * 784));
  let best = 0;
  for (let k = 1; k < p.length; k++) if (p[k] > p[best]) best = k;
  if (best === ys[i]) ok++;
}
console.log(`accuracy ${(ok / ys.length).toFixed(3)} on ${ys.length} samples, ${((Date.now() - t0) / ys.length).toFixed(1)} ms each`);
