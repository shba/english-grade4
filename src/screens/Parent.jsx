import { useState } from 'react';
import { TOPICS } from '../data/content.js';
import { getState, profileData, weakItems, removeProfile, resetProfile, setActive, setSetting, getSettings } from '../lib/store.js';
import { hasEnglishVoice, voiceName, speak } from '../lib/speech.js';

function Gate({ onPass, onBack }) {
  const [q] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 7);
    const b = 4 + Math.floor(Math.random() * 6);
    return { a, b, ans: a * b };
  });
  const [v, setV] = useState('');
  const [err, setErr] = useState(false);
  return (
    <div className="screen gate">
      <header className="bar">
        <button className="back" onClick={onBack} aria-label="חזרה">
          →
        </button>
        <h1>מסך הורים</h1>
        <span />
      </header>
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(v) === q.ans) onPass();
          else setErr(true);
        }}
      >
        <p>כדי להיכנס, פתרו את התרגיל:</p>
        <div className="math" dir="ltr">
          {q.a} × {q.b} = ?
        </div>
        <input inputMode="numeric" value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ''))} autoFocus dir="ltr" />
        {err && <div className="error">לא נכון, נסו שוב</div>}
        <button className="primary" type="submit">
          כניסה
        </button>
      </form>
    </div>
  );
}

function itemLabel(key) {
  const [t, id] = key.split(':');
  const topic = TOPICS.find((x) => x.id === t);
  return { topic: topic?.he || t, id };
}

export default function Parent({ onBack, onPracticeWeak }) {
  const [ok, setOk] = useState(false);
  const [, force] = useState(0);
  const state = getState();
  const [sel, setSel] = useState(state.activeId || state.profiles[0]?.id);
  const settings = getSettings();

  if (!ok) return <Gate onPass={() => setOk(true)} onBack={onBack} />;

  const p = state.profiles.find((x) => x.id === sel);
  const d = p ? profileData(p.id) : null;
  const weak = p ? weakItems(p.id) : [];

  return (
    <div className="screen parent">
      <header className="bar">
        <button className="back" onClick={onBack} aria-label="חזרה">
          →
        </button>
        <h1>מסך הורים</h1>
        <span />
      </header>

      {state.profiles.length === 0 && <div className="card">עדיין אין פרופילים.</div>}

      <div className="tabs">
        {state.profiles.map((x) => (
          <button key={x.id} className={x.id === sel ? 'on' : ''} onClick={() => setSel(x.id)}>
            {x.avatar} {x.name}
          </button>
        ))}
      </div>

      {p && d && (
        <>
          <div className="card">
            <h3>הצלחה לפי נושא</h3>
            {TOPICS.map((t) => {
              const s = d.topics[t.id];
              const n = s ? s.c + s.w : 0;
              const pct = n ? Math.round((100 * s.c) / n) : 0;
              return (
                <div key={t.id} className="barrow">
                  <span className="lbl">
                    {t.icon} {t.he}
                  </span>
                  <span className="meter">
                    <span style={{ width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444' }} />
                  </span>
                  <span className="num">{n ? `${pct}% (${n})` : '—'}</span>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3>טעויות נפוצות</h3>
            {weak.length === 0 ? (
              <p className="sub">אין עדיין טעויות שנרשמו.</p>
            ) : (
              <ul className="weak">
                {weak.map((w) => {
                  const l = itemLabel(w.key);
                  return (
                    <li key={w.key}>
                      <b dir="ltr">{l.id}</b> <small>{l.topic}</small>
                      <span className="wc">
                        ✗{w.w} ✓{w.c}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              className="primary"
              disabled={weak.length === 0}
              onClick={() => {
                setActive(p.id);
                onPracticeWeak(weak.map((w) => w.key));
              }}
            >
              🎯 תרגל את הנקודות החלשות
            </button>
          </div>

          <div className="card">
            <h3>מבחני דמה</h3>
            {d.exams.length === 0 ? (
              <p className="sub">עוד לא נעשה מבחן דמה.</p>
            ) : (
              <ul className="exams">
                {[...d.exams].reverse().map((e, i) => (
                  <li key={i}>
                    <span>{new Date(e.date).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <b>{Math.round((100 * e.score) / e.total)}</b>
                    <small>
                      {e.score}/{e.total}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3>הגדרות קול</h3>
            <p className="sub">
              {hasEnglishVoice() ? `קול אנגלי במכשיר: ${voiceName()}` : 'לא נמצא קול אנגלי במכשיר - משתמשים בהקלטות המובנות.'}
            </p>
            <div className="tabs">
              {[
                ['auto', 'אוטומטי'],
                ['device', 'קול המכשיר'],
                ['recorded', 'הקלטות מובנות'],
              ].map(([k, he]) => (
                <button
                  key={k}
                  className={settings.voice === k ? 'on' : ''}
                  onClick={() => {
                    setSetting('voice', k);
                    force((n) => n + 1);
                  }}
                >
                  {he}
                </button>
              ))}
            </div>
            <button onClick={() => speak('Hello! Umbrella.')}>🔊 בדיקת קול</button>
          </div>

          <div className="card danger">
            <h3>ניהול פרופיל</h3>
            <div className="row">
              <button
                onClick={() => {
                  if (confirm(`לאפס את ההתקדמות של ${p.name}?`)) {
                    resetProfile(p.id);
                    force((n) => n + 1);
                  }
                }}
              >
                איפוס התקדמות
              </button>
              <button
                onClick={() => {
                  if (confirm(`למחוק את הפרופיל ${p.name}?`)) {
                    removeProfile(p.id);
                    setSel(getState().profiles[0]?.id);
                  }
                }}
              >
                מחיקת פרופיל
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
