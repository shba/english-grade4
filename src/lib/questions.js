import { LETTERS, PREPOSITIONS, CVC, NUMBERS, COLORS, VOCAB, EXAM_SIZE } from '../data/content.js';
import { sentence } from './sentences.js';

export const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
const pickN = (a, n) => shuffle(a).slice(0, n);

/** Every practicable item, normalized: { key, topic, say, text, pic?, hex?, n?, he } */
export const ITEMS = {
  letters: LETTERS.map((l) => ({ key: `letters:${l.upper}`, topic: 'letters', say: `${l.upper}.`, text: l.upper, ...l })),
  letterWords: LETTERS.map((l) => ({ key: `letters:${l.upper}`, topic: 'letters', say: l.word, text: l.word, pic: l.pic, he: l.he })),
  prep: PREPOSITIONS.map((p) => ({ key: `prep:${p.word}`, topic: 'prep', say: p.word, text: p.word, scene: p.word, he: p.he })),
  cvc: CVC.map((w) => ({ key: `cvc:${w.word}`, topic: 'cvc', say: w.word, text: w.word, pic: w.pic, he: w.he })),
  numbers: NUMBERS.map((n) => ({ key: `numbers:${n.n}`, topic: 'numbers', say: n.word, text: n.word, n: n.n, pic: n.pic, he: n.he })),
  colors: COLORS.map((c) => ({ key: `colors:${c.word}`, topic: 'colors', say: c.word, text: c.word, hex: c.hex, he: c.he })),
  vocab: VOCAB.map((v) => ({ key: `vocab:${v.word}`, topic: 'vocab', say: v.word, text: v.word, pic: v.pic, he: v.he })),
};

const CONFUSABLE = { b: 'dpq', d: 'bpq', p: 'qbd', q: 'pgd', m: 'nwu', n: 'mhu', u: 'nvw', i: 'jl', j: 'il', l: 'it' };

function distractors(pool, item, n = 3) {
  return pickN(pool.filter((x) => x.text !== item.text), n);
}

function choiceQ(type, item, pool, extra = {}) {
  return { type, key: item.key, item, options: shuffle([item, ...distractors(pool, item)]), ...extra };
}

// ----- Question builders -----

const listenPic = (topic) => () => {
  const pool = topic === 'letters' ? ITEMS.letterWords : ITEMS[topic];
  const item = pick(pool);
  return choiceQ('listen', item, pool, { prompt: 'הקשיבו ובחרו את התמונה המתאימה' });
};

const listenLetter = () => {
  const item = pick(ITEMS.letters);
  const lower = Math.random() < 0.5;
  const show = (l) => ({ ...l, text: lower ? l.lower : l.upper });
  const q = choiceQ('listen', item, ITEMS.letters, { prompt: 'הקשיבו ובחרו את האות ששמעתם', asText: true });
  q.options = q.options.map(show);
  q.item = show(item);
  return q;
};

const readPic = (topic) => () => {
  const item = pick(ITEMS[topic]);
  return choiceQ('read', item, ITEMS[topic], { prompt: 'קראו את המילה ובחרו את התמונה המתאימה' });
};

const picWord = (topic) => () => {
  const item = pick(ITEMS[topic]);
  return choiceQ('picword', item, ITEMS[topic], { prompt: 'מה מופיע בתמונה? בחרו את המילה' });
};

const meaning = (topic) => () => {
  const item = pick(ITEMS[topic]);
  return choiceQ('meaning', item, ITEMS[topic], { prompt: 'מה הפירוש של המילה?' });
};

const prepChoose = () => {
  const item = pick(ITEMS.prep);
  return choiceQ('prepword', item, ITEMS.prep, { prompt: 'איפה החתול? בחרו את מילת היחס', sentence: sentence(item.text) });
};

const caseMatch = () => {
  const l = pick(LETTERS);
  const toLower = Math.random() < 0.6;
  const target = toLower ? l.lower : l.upper;
  const conf = CONFUSABLE[l.lower] ? [...CONFUSABLE[l.lower]] : [];
  const others = shuffle([...new Set([...conf, ...pickN(LETTERS.map((x) => x.lower), 6)])].filter((c) => c !== l.lower)).slice(0, 3);
  const opts = shuffle([l.lower, ...others]).map((c) => {
    const t = toLower ? c : c.toUpperCase();
    return { key: `letters:${c.toUpperCase()}`, text: t, say: `${c.toUpperCase()}.` };
  });
  return {
    type: 'case',
    key: `letters:${l.upper}`,
    item: { key: `letters:${l.upper}`, text: target, say: `${l.upper}.`, shown: toLower ? l.upper : l.lower },
    options: opts,
    prompt: toLower ? 'בחרו את האות הקטנה המתאימה' : 'בחרו את האות הגדולה המתאימה',
  };
};

const writeCase = () => {
  const l = pick(LETTERS);
  const toLower = Math.random() < 0.6;
  return {
    type: 'write',
    key: `letters:${l.upper}`,
    target: toLower ? l.lower : l.upper,
    shown: toLower ? l.upper : l.lower,
    say: `${l.upper}.`,
    prompt: toLower ? 'כתבו את האות הקטנה' : 'כתבו את האות הגדולה',
  };
};

const writeHeardLetter = () => {
  const l = pick(LETTERS);
  const lower = Math.random() < 0.5;
  return {
    type: 'write',
    key: `letters:${l.upper}`,
    target: lower ? l.lower : l.upper,
    say: `${l.upper}.`,
    listen: true,
    prompt: lower ? 'הקשיבו וכתבו את האות - באות קטנה' : 'הקשיבו וכתבו את האות - באות גדולה',
  };
};

const writeWordCase = () => {
  const w = pick([...CVC, ...VOCAB.filter((v) => v.word.length <= 5)]).word;
  const toLower = Math.random() < 0.5;
  const key = CVC.some((c) => c.word === w) ? `cvc:${w}` : `vocab:${w}`;
  return {
    type: 'write',
    key,
    target: toLower ? w.toLowerCase() : w.toUpperCase(),
    shown: toLower ? w.toUpperCase() : w.toLowerCase(),
    say: w,
    prompt: toLower ? 'העתיקו את המילה באותיות קטנות' : 'העתיקו את המילה באותיות גדולות',
  };
};

const writeHeardWord = (topic) => () => {
  const item = pick(ITEMS[topic].filter((x) => x.text.length <= 7));
  return {
    type: 'write',
    key: item.key,
    target: item.text.toLowerCase(),
    say: item.say,
    listen: true,
    item,
    prompt: 'הקשיבו וכתבו את המילה באותיות קטנות',
  };
};

export const GAMES = {
  letters: [
    { id: 'listen', he: 'שמע ובחר', icon: '👂', gen: [listenLetter, listenPic('letters')] },
    { id: 'case', he: 'גדולה וקטנה', icon: '🔠', gen: [caseMatch] },
    { id: 'write', he: 'כתיבת אותיות', icon: '✍️', gen: [writeCase, writeHeardLetter], write: true },
    { id: 'writeword', he: 'מגדולות לקטנות', icon: '📝', gen: [writeWordCase], write: true },
    { id: 'memory', he: 'משחק זיכרון', icon: '🃏', memory: 'letters' },
  ],
  prep: [
    { id: 'choose', he: 'איפה החתול?', icon: '🐱', gen: [prepChoose] },
    { id: 'listen', he: 'שמע ובחר', icon: '👂', gen: [listenPic('prep')] },
    { id: 'drag', he: 'גררו את החתול', icon: '👆', drag: true },
    { id: 'memory', he: 'משחק זיכרון', icon: '🃏', memory: 'prep' },
  ],
  cvc: [
    { id: 'read', he: 'קריאה', icon: '📖', gen: [readPic('cvc')] },
    { id: 'listen', he: 'שמע ובחר', icon: '👂', gen: [listenPic('cvc')] },
    { id: 'write', he: 'כתיבת מילים', icon: '✍️', gen: [writeHeardWord('cvc')], write: true },
    { id: 'memory', he: 'משחק זיכרון', icon: '🃏', memory: 'cvc' },
  ],
  numbers: [
    { id: 'listen', he: 'שמע ובחר', icon: '👂', gen: [listenPic('numbers')] },
    { id: 'read', he: 'קריאה', icon: '📖', gen: [readPic('numbers')] },
    { id: 'write', he: 'כתיבה', icon: '✍️', gen: [writeHeardWord('numbers')], write: true },
    { id: 'memory', he: 'משחק זיכרון', icon: '🃏', memory: 'numbers' },
  ],
  colors: [
    { id: 'listen', he: 'שמע ובחר', icon: '👂', gen: [listenPic('colors')] },
    { id: 'read', he: 'קריאה', icon: '📖', gen: [readPic('colors')] },
    { id: 'write', he: 'כתיבה', icon: '✍️', gen: [writeHeardWord('colors')], write: true },
    { id: 'memory', he: 'משחק זיכרון', icon: '🃏', memory: 'colors' },
  ],
  vocab: [
    { id: 'listen', he: 'שמע ובחר', icon: '👂', gen: [listenPic('vocab')] },
    { id: 'read', he: 'קריאה', icon: '📖', gen: [readPic('vocab')] },
    { id: 'meaning', he: 'מה הפירוש?', icon: '🇮🇱', gen: [meaning('vocab'), picWord('vocab')] },
    { id: 'write', he: 'כתיבה', icon: '✍️', gen: [writeHeardWord('vocab')], write: true },
    { id: 'memory', he: 'משחק זיכרון', icon: '🃏', memory: 'vocab' },
  ],
};

/** Build a session of n questions, avoiding the same item twice in a row. */
export function buildSession(gens, n = 10) {
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 20) {
    const q = pick(gens)();
    const recent = out.slice(-4).map((x) => x.key + (x.target || ''));
    if (recent.includes(q.key + (q.target || ''))) continue;
    out.push(q);
  }
  return out.map((q, i) => ({ ...q, id: i }));
}

/** Mock exam mirrors the real test: letters writing, prepositions, reading, numbers, colors, vocabulary. */
export function buildExam() {
  const plan = [
    [writeCase, 3],
    [writeWordCase, 2],
    [caseMatch, 2],
    [prepChoose, 4],
    [readPic('cvc'), 4],
    [listenPic('numbers'), 2],
    [listenPic('colors'), 2],
    [meaning('vocab'), 2],
    [listenPic('vocab'), 1],
  ];
  const qs = [];
  for (const [g, n] of plan) qs.push(...buildSession([g], n).map((q) => ({ ...q, section: sectionOf(q) })));
  return qs.slice(0, EXAM_SIZE).map((q, i) => ({ ...q, id: i }));
}

export const SECTION_HE = {
  letters: 'כתיבת אותיות',
  prep: 'מילות יחס',
  cvc: 'קריאת מילים',
  numbers: 'מספרים',
  colors: 'צבעים',
  vocab: 'אוצר מילים',
};

function sectionOf(q) {
  if (q.type === 'write' && q.shown && q.target.length > 1) return 'letters';
  return q.key.split(':')[0];
}

/** Questions that target specific weak items (for the parent's "practice weak points"). */
export function buildWeakSession(keys, n = 12) {
  const gens = [];
  for (const key of keys) {
    const [topic, id] = key.split(':');
    const find = (pool) => pool.find((x) => x.key === key);
    if (topic === 'letters') {
      const l = LETTERS.find((x) => x.upper === id);
      if (!l) continue;
      gens.push(() => ({ type: 'write', key, target: l.lower, shown: l.upper, say: `${l.upper}.`, prompt: 'כתבו את האות הקטנה' }));
      gens.push(() => ({ type: 'write', key, target: l.upper, shown: l.lower, say: `${l.upper}.`, prompt: 'כתבו את האות הגדולה' }));
    } else if (topic === 'prep') {
      const item = find(ITEMS.prep);
      if (item) gens.push(() => choiceQ('prepword', item, ITEMS.prep, { prompt: 'איפה החתול? בחרו את מילת היחס', sentence: sentence(item.text) }));
    } else if (ITEMS[topic]) {
      const item = find(ITEMS[topic]);
      if (!item) continue;
      gens.push(() => choiceQ('listen', item, ITEMS[topic], { prompt: 'הקשיבו ובחרו את התמונה המתאימה' }));
      gens.push(() => choiceQ('read', item, ITEMS[topic], { prompt: 'קראו את המילה ובחרו את התמונה המתאימה' }));
    }
  }
  if (!gens.length) return [];
  return buildSession(gens, Math.min(n, Math.max(gens.length * 2, 6)));
}

/** All English phrases the app can speak (used to generate the fallback recordings). */
export function allPhrases(extra = []) {
  const s = new Set(extra);
  Object.values(ITEMS).forEach((pool) => pool.forEach((x) => s.add(x.say)));
  PREPOSITIONS.forEach((p) => s.add(sentence(p.word)));
  return [...s];
}
