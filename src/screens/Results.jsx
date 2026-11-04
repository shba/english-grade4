import { SECTION_HE } from '../lib/questions.js';
import { Stars } from './Quiz.jsx';

function answerText(q) {
  if (q.type === 'write') return q.target;
  if (q.type === 'meaning') return `${q.item.text} = ${q.item.he}`;
  if (q.type === 'case') return `${q.item.shown} → ${q.item.text}`;
  if (q.type === 'prepword') return q.sentence;
  return `${q.item.text}${q.item.he ? ` (${q.item.he})` : ''}`;
}

export default function Results({ result, exam, onAgain, onBack }) {
  const { score, total, answers } = result;
  const pct = Math.round((100 * score) / total);
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  const wrong = answers.filter((a) => !a.ok);
  const bySection = {};
  if (exam) {
    for (const a of answers) {
      const s = (bySection[a.q.section] ||= { c: 0, t: 0 });
      s.t++;
      if (a.ok) s.c++;
    }
  }

  return (
    <div className="screen results">
      <div className="score-card">
        <div className="big">{pct >= 70 ? '🎉' : '💪'}</div>
        <h1>
          {score} / {total}
        </h1>
        <div className="pct">{exam ? `ציון: ${pct}` : `${pct}% הצלחה`}</div>
        <Stars n={stars} />
      </div>
      {exam && (
        <div className="card">
          <h3>לפי נושא</h3>
          {Object.entries(bySection).map(([s, v]) => (
            <div key={s} className="secrow">
              <span>{SECTION_HE[s] || s}</span>
              <span className={v.c === v.t ? 'good' : v.c / v.t < 0.6 ? 'bad' : ''}>
                {v.c}/{v.t}
              </span>
            </div>
          ))}
        </div>
      )}
      {wrong.length > 0 && (
        <div className="card">
          <h3>כדאי לחזור על:</h3>
          <ul className="review">
            {wrong.map((a, i) => (
              <li key={i}>
                <span dir="ltr">{answerText(a.q)}</span>
                {a.given && a.q.type === 'write' && <small> (נכתב: <span dir="ltr">{a.given}</span>)</small>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="row">
        <button className="primary" onClick={onAgain}>
          {exam ? 'מבחן חדש' : 'שוב!'}
        </button>
        <button onClick={onBack}>חזרה לתפריט</button>
      </div>
    </div>
  );
}
