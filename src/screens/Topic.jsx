import { TOPICS } from '../data/content.js';
import { GAMES, ITEMS } from '../lib/questions.js';
import Pic, { Swatch, NumberPic } from '../components/Pic.jsx';
import Scene from '../components/Scene.jsx';
import { speak } from '../lib/speech.js';
import { LETTERS } from '../data/content.js';

export default function Topic({ topic, go }) {
  const t = TOPICS.find((x) => x.id === topic);
  return (
    <div className="screen topic-screen" style={{ '--c': t.color }}>
      <header className="bar">
        <button className="back" onClick={() => go('menu')} aria-label="חזרה">
          →
        </button>
        <h1>
          {t.icon} {t.he}
        </h1>
        <span />
      </header>
      <div className="games">
        <button className="game" onClick={() => go('learn', { topic })}>
          <span className="gicon">👀</span>
          <span>לומדים ומקשיבים</span>
        </button>
        {GAMES[topic].map((g) => (
          <button key={g.id} className="game" onClick={() => go('game', { topic, game: g.id })}>
            <span className="gicon">{g.icon}</span>
            <span>{g.he}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

async function sayLetter(l) {
  await speak(`${l.upper}.`);
  await speak(l.word);
}

export function Learn({ topic, go }) {
  const t = TOPICS.find((x) => x.id === topic);
  let cards;
  if (topic === 'letters') {
    cards = LETTERS.map((l) => (
      <button key={l.upper} className="lcard" onClick={() => sayLetter(l)}>
        <span className="big" dir="ltr">
          {l.upper}
          {l.lower}
        </span>
        <Pic pic={l.pic} size={46} />
        <span className="w" dir="ltr">{l.word}</span>
      </button>
    ));
  } else {
    cards = ITEMS[topic].map((it) => (
      <button key={it.key} className={`lcard ${topic === 'prep' ? 'wide' : ''}`} onClick={() => speak(it.say)}>
        {it.hex ? <Swatch hex={it.hex} size={56} /> : it.scene ? <Scene prep={it.scene} size={110} /> : it.n ? <NumberPic n={it.n} pic={it.pic} size={54} /> : <Pic pic={it.pic} size={56} />}
        <span className="w" dir="ltr">{it.text}</span>
        <span className="he">{it.he}</span>
      </button>
    ));
  }
  return (
    <div className="screen learn" style={{ '--c': t.color }}>
      <header className="bar">
        <button className="back" onClick={() => go('topic', { topic })} aria-label="חזרה">
          →
        </button>
        <h1>
          {t.icon} {t.he}
        </h1>
        <span />
      </header>
      <p className="sub">לחצו על כרטיס כדי לשמוע</p>
      <div className={`cards ${topic === "prep" ? "wide" : ""}`} dir="ltr">{cards}</div>
    </div>
  );
}
