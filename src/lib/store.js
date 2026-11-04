const KEY = 'eng4-app-v1';

const empty = () => ({ profiles: [], activeId: null, data: {}, settings: { voice: 'auto' } });

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked (private mode) */
  }
  listeners.forEach((l) => l());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getState = () => state;
export const getSettings = () => state.settings;

export function setSetting(k, v) {
  state = { ...state, settings: { ...state.settings, [k]: v } };
  save();
}

const blankData = () => ({ items: {}, topics: {}, exams: [], stars: 0 });

export function addProfile(name, avatar) {
  const id = Math.random().toString(36).slice(2, 9);
  state = {
    ...state,
    profiles: [...state.profiles, { id, name, avatar, createdAt: Date.now() }],
    data: { ...state.data, [id]: blankData() },
    activeId: id,
  };
  save();
  return id;
}

export function removeProfile(id) {
  const data = { ...state.data };
  delete data[id];
  state = {
    ...state,
    profiles: state.profiles.filter((p) => p.id !== id),
    data,
    activeId: state.activeId === id ? null : state.activeId,
  };
  save();
}

export function setActive(id) {
  state = { ...state, activeId: id };
  save();
}

export function activeProfile() {
  return state.profiles.find((p) => p.id === state.activeId) || null;
}

export function profileData(id = state.activeId) {
  return state.data[id] || blankData();
}

function updateData(fn) {
  const id = state.activeId;
  if (!id) return;
  const d = profileData(id);
  state = { ...state, data: { ...state.data, [id]: fn(structuredClone(d)) } };
  save();
}

/** itemKey looks like "letters:A" — the topic is the part before the colon. */
export function record(itemKey, correct) {
  const topic = itemKey.split(':')[0];
  updateData((d) => {
    const it = (d.items[itemKey] ||= { c: 0, w: 0, last: 0 });
    const tp = (d.topics[topic] ||= { c: 0, w: 0 });
    if (correct) {
      it.c++;
      tp.c++;
      d.stars++;
    } else {
      it.w++;
      tp.w++;
    }
    it.last = Date.now();
    return d;
  });
}

export function recordExam(result) {
  updateData((d) => {
    d.exams = [...d.exams, { ...result, date: Date.now() }].slice(-30);
    return d;
  });
}

export function resetProfile(id) {
  state = { ...state, data: { ...state.data, [id]: blankData() } };
  save();
}

/** Items the child misses most, by error rate weighted with volume. */
export function weakItems(id = state.activeId, limit = 12) {
  const items = profileData(id).items;
  return Object.entries(items)
    .filter(([, v]) => v.w > 0)
    .map(([k, v]) => ({ key: k, ...v, score: (v.w + 1) / (v.c + v.w + 2) + v.w * 0.05 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
