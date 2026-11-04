import { getSettings } from './store.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voices = [];
let enVoice = null;
let heVoice = null;
let audioEl = null;

const PREFERRED = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Ava', 'Allison', 'Karen', 'Daniel'];

function pickVoices() {
  if (!synth) return;
  voices = synth.getVoices() || [];
  const en = voices.filter((v) => /^en[-_]/i.test(v.lang));
  const us = en.filter((v) => /en[-_]US/i.test(v.lang));
  const pool = us.length ? us : en;
  enVoice =
    PREFERRED.map((n) => pool.find((v) => v.name.includes(n))).find(Boolean) ||
    pool.find((v) => v.localService) ||
    pool[0] ||
    null;
  heVoice = voices.find((v) => /^(he|iw)/i.test(v.lang)) || null;
}

if (synth) {
  pickVoices();
  synth.addEventListener?.('voiceschanged', pickVoices);
}

export function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function hasEnglishVoice() {
  return !!enVoice;
}

export function hasHebrewVoice() {
  return !!heVoice;
}

export function voiceName() {
  return enVoice ? `${enVoice.name} (${enVoice.lang})` : null;
}

const audioUrl = (name) => `${import.meta.env.BASE_URL}audio/${name}.mp3`;

// iOS only lets audio play from a user gesture, so one shared element is unlocked on the first tap and reused.
function sharedAudio() {
  if (!audioEl && typeof Audio !== 'undefined') audioEl = new Audio();
  return audioEl;
}

export function unlockAudio() {
  const a = sharedAudio();
  if (a) {
    a.src = audioUrl('silence');
    a.play().catch(() => {});
  }
  if (synth) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    synth.speak(u);
  }
}

function playRecorded(text) {
  return new Promise((resolve) => {
    const a = sharedAudio();
    if (!a) return resolve();
    try {
      a.pause();
      a.onended = resolve;
      a.onerror = resolve;
      a.src = audioUrl(slug(text));
      a.play().catch(resolve);
    } catch {
      resolve();
    }
  });
}

function preferRecorded() {
  const mode = getSettings().voice;
  if (mode === 'recorded') return true;
  if (mode === 'device') return false;
  return !synth || !enVoice;
}

/** Speak English text. Uses the device voice when available and falls back to the bundled recordings. */
export function speak(text, { rate = 0.85 } = {}) {
  if (!text) return Promise.resolve();
  if (preferRecorded()) return playRecorded(text);
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = enVoice;
      u.lang = enVoice?.lang || 'en-US';
      u.rate = rate;
      u.onend = finish;
      u.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return finish();
        playRecorded(text).then(finish);
      };
      synth.speak(u);
      setTimeout(finish, 4000 + text.length * 120);
    } catch {
      playRecorded(text).then(finish);
    }
  });
}

export function speakHebrew(text) {
  if (!synth || !heVoice) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = heVoice;
  u.lang = heVoice.lang;
  u.rate = 0.95;
  synth.speak(u);
}

let ctx = null;
/** Short cheerful / soft tone so feedback works even with sound-only devices. */
export function chime(good) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = good ? [660, 880, 1320] : [300, 220];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = good ? 'triangle' : 'sine';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.25);
    });
  } catch {
    /* audio not available */
  }
}
