import { useEffect, useMemo, useRef, useState } from 'react';
import Pic, { Swatch, NumberPic } from '../components/Pic.jsx';
import Scene from '../components/Scene.jsx';
import WritePad from '../components/WritePad.jsx';
import { speak, chime, speakHebrew, hasHebrewVoice } from '../lib/speech.js';
import { record } from '../lib/store.js';
const hw = () => import('../lib/recognizer.js');
import { PRAISE, TRY_AGAIN } from '../data/content.js';
import { pick } from '../lib/questions.js';

export function SpeakBtn({ text, big, label = 'הקשיבו' }) {
  return (
    <button className={`speak ${big ? 'big' : ''}`} onClick={() => speak(text)} aria-label={label}>
      🔊{big && <span>{label}</span>}
    </button>
  );
}

export function HeSpeak({ text }) {
  if (!hasHebrewVoice()) return null;
  return (
    <button className="he-speak" onClick={() => speakHebrew(text)} aria-label="הקראת ההוראה">
      🗣️
    </button>
  );
}

function OptionBody({ q, o }) {
  if (q.type === 'meaning') return <span className="opt-he">{o.he}</span>;
  if (q.type === 'picword' || q.type === 'prepword') return <span className="opt-en" dir="ltr">{o.text}</span>;
  if (q.type === 'case' || q.asText) return <span className="opt-letter" dir="ltr">{o.text}</span>;
  if (o.hex) return <Swatch hex={o.hex} size={70} />;
  if (o.n) return <NumberPic n={o.n} pic={o.pic} size={56} />;
  if (o.scene) return <Scene prep={o.scene} size={92} />;
  return <Pic pic={o.pic} size={78} label={o.text} />;
}

function Prompt({ q, answered }) {
  const it = q.item;
  switch (q.type) {
    case 'listen':
      return <SpeakBtn text={it.say} big label="הקשיבו שוב" />;
    case 'read':
      return (
        <div className="prompt-word">
          <span dir="ltr">{it.text}</span>
          {answered && <SpeakBtn text={it.say} label="הקשב" />}
        </div>
      );
    case 'picword':
      return <div className="prompt-pic">{it.hex ? <Swatch hex={it.hex} size={110} /> : <Pic pic={it.pic} size={120} />}</div>;
    case 'meaning':
      return (
        <div className="prompt-word">
          <span dir="ltr">{it.text}</span>
          <SpeakBtn text={it.say} />
        </div>
      );
    case 'prepword':
      return (
        <div className="prompt-scene">
          <Scene prep={it.scene} size={170} />
          <div className="sentence" dir="ltr">
            The cat is <b>{answered ? it.text : '____'}</b> {q.sentence.split(it.text + ' ')[1]}
          </div>
        </div>
      );
    case 'case':
      return (
        <div className="prompt-word letter">
          <span dir="ltr">{it.shown}</span>
        </div>
      );
    default:
      return null;
  }
}

function autoSpeak(q) {
  if (q.type === 'listen') return q.item.say;
  if (q.type === 'meaning') return q.item.say;
  if (q.type === 'write' && q.listen) return q.say;
  return null;
}

function ChoiceQuestion({ q, exam, onDone }) {
  const [chosen, setChosen] = useState(null);
  const answered = chosen !== null && !exam;

  const choose = (o) => {
    if (chosen !== null && !exam) return;
    setChosen(o.text);
    if (exam) return;
    const ok = o.text === q.item.text;
    chime(ok);
    if (ok) setTimeout(() => speak(pick(PRAISE)), 250);
    else setTimeout(() => speak(q.type === 'prepword' ? q.sentence : q.item.say), 350);
    record(q.key, ok);
    if (ok) setTimeout(() => onDone(true), 1500);
    if (q.type === 'prepword' && ok) setTimeout(() => speak(q.sentence), 1100);
  };

  const cls = (o) => {
    if (chosen === null) return '';
    if (exam) return chosen === o.text ? 'selected' : '';
    if (o.text === q.item.text) return 'correct';
    if (o.text === chosen) return 'wrong';
    return 'dim';
  };

  return (
    <>
      <Prompt q={q} answered={answered} />
      <div className={`options ${q.type === 'picword' || q.type === 'prepword' || q.type === 'meaning' ? 'words' : ''}`}>
        {q.options.map((o) => (
          <button key={o.text} className={`option ${cls(o)}`} onClick={() => choose(o)}>
            <OptionBody q={q} o={o} />
          </button>
        ))}
      </div>
      {exam && (
        <button className="primary next" disabled={chosen === null} onClick={() => onDone(chosen === q.item.text, chosen)}>
          הבא ←
        </button>
      )}
      {answered && chosen !== q.item.text && (
        <button className="primary next" onClick={() => onDone(false)}>
          המשך ←
        </button>
      )}
    </>
  );
}

function WriteQuestion({ q, exam, onDone }) {
  const n = q.target.length;
  const [strokes, setStrokes] = useState(() => Array(n).fill([]));
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    hw().then((m) => m.loadModel()).then(() => setReady(true), () => setError('לא הצלחנו לטעון את זיהוי כתב היד. נסו לרענן את הדף.'));
  }, []);

  const empty = strokes.some((s) => !s || !s.length);

  const check = async () => {
    setBusy(true);
    const { recognize, judgeLetter } = await hw();
    const per = [];
    for (let i = 0; i < n; i++) {
      const preds = await recognize(strokes[i] || [], 1 / 1.3);
      per.push({ preds, ...judgeLetter(q.target[i], preds) });
    }
    setBusy(false);
    const ok = per.every((r) => r.ok);
    if (exam) return onDone(ok, per.map((r) => r.preds[0]?.char || '?').join(''));
    setResult(per);
    if (attempt === 0) record(q.key, ok);
    chime(ok);
    if (ok) {
      setTimeout(() => speak(pick(PRAISE)), 250);
      setTimeout(() => onDone(true), 1600);
    } else {
      setTimeout(() => speak(TRY_AGAIN), 250);
    }
    setAttempt((a) => a + 1);
  };

  const retry = () => {
    setStrokes((all) => all.map((s, i) => (result?.[i]?.ok ? s : [])));
    setResult(null);
  };

  const clear = () => {
    setStrokes(Array(n).fill([]));
    setResult(null);
  };

  const undo = () => {
    setStrokes((all) => {
      const next = [...all];
      for (let i = n - 1; i >= 0; i--) {
        if (next[i]?.length) {
          next[i] = next[i].slice(0, -1);
          break;
        }
      }
      return next;
    });
    setResult(null);
  };

  const failed = result && !result.every((r) => r.ok);
  const statuses = result?.map((r) => (r.ok ? 'ok' : 'bad')) || [];
  const guesses = result?.map((r) => (r.ok ? '✓' : r.preds[0]?.char || '?')) || [];
  const caseHint = result?.some((r) => r.reason === 'case');

  return (
    <>
      <div className="prompt-write">
        {q.shown && (
          <span className="prompt-word" dir="ltr">
            {q.shown}
          </span>
        )}
        {(q.listen || !q.shown) && <SpeakBtn text={q.say} big={q.listen} label="הקשיבו שוב" />}
        {q.item?.pic && !exam && <Pic pic={q.item.pic} size={64} />}
      </div>
      {!ready && !error && <div className="loading">טוען זיהוי כתב יד…</div>}
      {error && <div className="error">{error}</div>}
      <WritePad length={n} strokes={strokes} setStrokes={setStrokes} statuses={statuses} guesses={guesses} disabled={busy || (result && !failed)} />
      {failed && (
        <div className="hint">
          {caseHint ? 'שימו לב לגודל האות: אות קטנה כמו a, c, o נכתבת עד הקו המקווקו.' : 'כמעט! נסו לכתוב שוב בתוך המשבצת.'}
          {attempt >= 2 && (
            <div className="reveal">
              התשובה: <b dir="ltr">{q.target}</b>
            </div>
          )}
        </div>
      )}
      <div className="write-actions">
        <button onClick={undo} disabled={busy}>↩️ בטל קו</button>
        <button onClick={clear} disabled={busy}>🧽 מחק הכל</button>
        {!failed && (
          <button className="primary" disabled={!ready || empty || busy || !!result} onClick={check}>
            {busy ? 'בודק…' : exam ? 'הבא ←' : '✔️ בדיקה'}
          </button>
        )}
        {failed && attempt < 2 && (
          <button className="primary" onClick={retry}>
            🔁 נסו שוב
          </button>
        )}
        {failed && attempt >= 2 && (
          <button className="primary" onClick={() => onDone(false)}>
            המשך ←
          </button>
        )}
      </div>
      {failed && attempt === 1 && (
        <button className="link" onClick={() => onDone(false)}>
          דלג
        </button>
      )}
    </>
  );
}

export function Stars({ n }) {
  return <span className="stars">{'⭐'.repeat(n)}</span>;
}

/** Runs a list of questions. In exam mode there is no feedback until the end. */
export default function Quiz({ title, questions, exam, onFinish, onBack }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [burst, setBurst] = useState(0);
  const answers = useRef([]);
  const q = questions[idx];
  useEffect(() => {
    if (import.meta.env.DEV) window.__q = q;
  }, [q]);

  useEffect(() => {
    if (!q) return;
    const t = autoSpeak(q);
    if (t) {
      const id = setTimeout(() => speak(t), 300);
      return () => clearTimeout(id);
    }
  }, [q]);

  const done = (ok, given) => {
    answers.current.push({ q, ok, given });
    if (ok) {
      setScore((s) => s + 1);
      if (!exam) setBurst((b) => b + 1);
    }
    if (idx + 1 >= questions.length) onFinish({ score: score + (ok ? 1 : 0), total: questions.length, answers: answers.current });
    else setIdx(idx + 1);
  };

  const progress = useMemo(() => ((idx) / questions.length) * 100, [idx, questions.length]);

  if (!q)
    return (
      <div className="screen quiz">
        <div className="card">
          <p>אין עדיין מספיק נתונים לתרגול הזה. תרגלו קודם קצת במשחקים 🙂</p>
          <button className="primary" onClick={onBack}>
            חזרה
          </button>
        </div>
      </div>
    );
  return (
    <div className="screen quiz">
      <header className="bar">
        <button className="back" onClick={onBack} aria-label="חזרה">
          ✕
        </button>
        <div className="progress">
          <div style={{ width: `${progress}%` }} />
        </div>
        <span className="count">
          {idx + 1}/{questions.length}
        </span>
      </header>
      <h2 className="instr">
        {q.prompt} <HeSpeak text={q.prompt} />
      </h2>
      {title && <div className="sub">{title}</div>}
      <div className="qbody" key={`q-${q.id}`}>
        {q.type === 'write' ? <WriteQuestion q={q} exam={exam} onDone={done} /> : <ChoiceQuestion q={q} exam={exam} onDone={done} />}
      </div>
      {burst > 0 && (
        <div className="burst" key={`burst-${burst}`} aria-hidden="true">
          ⭐
        </div>
      )}
    </div>
  );
}
