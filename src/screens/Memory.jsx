import { useState } from 'react';
import { ITEMS, shuffle } from '../lib/questions.js';
import { LETTERS, PRAISE } from '../data/content.js';
import Pic, { Swatch, NumberPic } from '../components/Pic.jsx';
import Scene from '../components/Scene.jsx';
import { speak, chime } from '../lib/speech.js';
import { record } from '../lib/store.js';
import { pick } from '../lib/questions.js';

function makeDeck(topic) {
  if (topic === 'letters') {
    return shuffle(LETTERS)
      .slice(0, 6)
      .flatMap((l) => [
        { pair: l.upper, key: `letters:${l.upper}`, say: `${l.upper}.`, face: <span className="mletter">{l.upper}</span> },
        { pair: l.upper, key: `letters:${l.upper}`, say: `${l.upper}.`, face: <span className="mletter">{l.lower}</span> },
      ]);
  }
  return shuffle(ITEMS[topic])
    .slice(0, 6)
    .flatMap((it) => [
      { pair: it.text, key: it.key, say: it.say, face: <span className="mword">{it.text}</span> },
      {
        pair: it.text,
        key: it.key,
        say: it.say,
        face: it.hex ? <Swatch hex={it.hex} size={50} /> : it.scene ? <Scene prep={it.scene} size={58} /> : it.n ? <NumberPic n={it.n} pic={it.pic} size={34} /> : <Pic pic={it.pic} size={54} />,
      },
    ]);
}

export default function Memory({ topic, onBack }) {
  const [deck, setDeck] = useState(() => shuffle(makeDeck(topic)).map((c, i) => ({ ...c, id: i })));
  const [open, setOpen] = useState([]);
  const [found, setFound] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const done = found.size === deck.length;

  const flip = (c) => {
    if (open.length === 2 || open.includes(c.id) || found.has(c.id)) return;
    speak(c.say);
    const next = [...open, c.id];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => deck[id]);
      if (a.pair === b.pair) {
        chime(true);
        record(a.key, true);
        setTimeout(() => {
          setFound((f) => {
            const n = new Set(f);
            n.add(a.id);
            n.add(b.id);
            if (n.size === deck.length) setTimeout(() => speak(pick(PRAISE)), 300);
            return n;
          });
          setOpen([]);
        }, 600);
      } else {
        setTimeout(() => setOpen([]), 1100);
      }
    }
  };

  const restart = () => {
    setDeck(shuffle(makeDeck(topic)).map((c, i) => ({ ...c, id: i })));
    setOpen([]);
    setFound(new Set());
    setMoves(0);
  };

  return (
    <div className="screen memory">
      <header className="bar">
        <button className="back" onClick={onBack} aria-label="חזרה">
          ✕
        </button>
        <h2>משחק זיכרון</h2>
        <span className="count">{moves} תורות</span>
      </header>
      <p className="sub">מצאו את הזוגות</p>
      <div className="mgrid" dir="ltr">
        {deck.map((c) => {
          const shown = open.includes(c.id) || found.has(c.id);
          return (
            <button key={c.id} className={`mcard ${shown ? 'up' : ''} ${found.has(c.id) ? 'found' : ''}`} onClick={() => flip(c)}>
              {shown ? c.face : <span className="mback">❓</span>}
            </button>
          );
        })}
      </div>
      {done && (
        <div className="done-box">
          <div className="big">🎉 כל הכבוד!</div>
          <p>סיימתם ב-{moves} תורות</p>
          <div className="row">
            <button className="primary" onClick={restart}>
              שוב!
            </button>
            <button onClick={onBack}>חזרה</button>
          </div>
        </div>
      )}
    </div>
  );
}
