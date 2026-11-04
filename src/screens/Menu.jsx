import { TOPICS } from '../data/content.js';
import { activeProfile, profileData } from '../lib/store.js';

function daysLeft() {
  const test = new Date('2026-11-08T08:00:00');
  const d = Math.ceil((test - new Date()) / 86400000);
  return d;
}

export default function Menu({ go }) {
  const p = activeProfile();
  const d = profileData();
  const left = daysLeft();
  const pct = (t) => {
    const s = d.topics[t];
    if (!s || s.c + s.w === 0) return null;
    return Math.round((100 * s.c) / (s.c + s.w));
  };

  return (
    <div className="screen menu">
      <header className="bar">
        <button className="back" onClick={() => go('home')} aria-label="החלפת פרופיל">
          <span className="avatar sm">{p?.avatar}</span>
        </button>
        <div className="hello">שלום {p?.name}!</div>
        <span className="pstars">⭐ {d.stars}</span>
      </header>
      {left > 0 && left < 30 && <div className="countdown">⏰ עוד {left} ימים למבחן</div>}
      <div className="topics">
        {TOPICS.map((t) => (
          <button key={t.id} className="topic" style={{ '--c': t.color }} onClick={() => go('topic', { topic: t.id })}>
            <span className="ticon">{t.icon}</span>
            <span className="tname">{t.he}</span>
            {pct(t.id) !== null && <span className="tpct">{pct(t.id)}%</span>}
          </button>
        ))}
      </div>
      <button className="exam-btn" onClick={() => go('exam')}>
        <span className="ticon">🏆</span>
        <span>
          <b>מבחן דמה</b>
          <small>22 שאלות מכל הנושאים</small>
        </span>
      </button>
    </div>
  );
}
