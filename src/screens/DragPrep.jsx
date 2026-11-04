import { useEffect, useRef, useState } from 'react';
import { shuffle, pick } from '../lib/questions.js';
import { speak, chime } from '../lib/speech.js';
import { record } from '../lib/store.js';
import { PRAISE } from '../data/content.js';
import { DRAG_TASKS } from '../lib/sentences.js';

const POS = {
  'next to': { x: 55, y: 232 },
  in: { x: 155, y: 222 },
  between: { x: 248, y: 236 },
  on: { x: 370, y: 118 },
  under: { x: 364, y: 236 },
  over: { x: 155, y: 92 },
};
const ZONES = DRAG_TASKS.map((t) => ({ ...t, ...POS[t.prep] }));
const START = { x: 430, y: 48 };

export default function DragPrep({ onBack }) {
  const [tasks] = useState(() => shuffle(ZONES));
  const [i, setI] = useState(0);
  const [cat, setCat] = useState(START);
  const [placed, setPlaced] = useState(null);
  const [status, setStatus] = useState(null);
  const [score, setScore] = useState(0);
  const dragging = useRef(false);
  const svg = useRef(null);
  const task = tasks[i];

  useEffect(() => {
    if (task) {
      const id = setTimeout(() => speak(task.en), 300);
      return () => clearTimeout(id);
    }
  }, [task]);

  const toSvg = (e) => {
    const pt = svg.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.current.getScreenCTM().inverse());
  };

  const down = (e) => {
    if (status === 'ok') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragging.current = true;
    setPlaced(null);
    setStatus(null);
    const p = toSvg(e);
    setCat({ x: p.x, y: p.y });
  };
  const move = (e) => {
    if (!dragging.current) return;
    const p = toSvg(e);
    setCat({ x: Math.max(20, Math.min(460, p.x)), y: Math.max(20, Math.min(280, p.y)) });
  };
  const up = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const near = ZONES.map((z) => ({ z, d: Math.hypot(z.x - cat.x, z.y - cat.y) })).sort((a, b) => a.d - b.d)[0];
    if (near.d > 75) {
      setCat(START);
      return;
    }
    setCat({ x: near.z.x, y: near.z.y });
    setPlaced(near.z.prep);
    const ok = near.z.prep === task.prep;
    record(`prep:${task.prep}`, ok);
    chime(ok);
    setStatus(ok ? 'ok' : 'bad');
    if (ok) {
      setScore((s) => s + 1);
      setTimeout(() => speak(pick(PRAISE)), 250);
      setTimeout(() => {
        setI((n) => n + 1);
        setCat(START);
        setPlaced(null);
        setStatus(null);
      }, 1600);
    }
  };

  const catEl = (
    <text
      x={cat.x}
      y={cat.y + 20}
      fontSize="58"
      textAnchor="middle"
      className="dragcat"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      🐱
    </text>
  );
  const inBox = placed === 'in';

  if (!task) {
    return (
      <div className="screen drag">
        <div className="done-box">
          <div className="big">🎉 כל הכבוד!</div>
          <p>
            {score} מתוך {tasks.length} בניסיון הראשון
          </p>
          <button className="primary" onClick={onBack}>
            חזרה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen drag">
      <header className="bar">
        <button className="back" onClick={onBack} aria-label="חזרה">
          ✕
        </button>
        <div className="progress">
          <div style={{ width: `${(i / tasks.length) * 100}%` }} />
        </div>
        <span className="count">
          {i + 1}/{tasks.length}
        </span>
      </header>
      <h2 className="instr">גררו את החתול למקום הנכון</h2>
      <div className="task">
        <button className="speak" onClick={() => speak(task.en)} aria-label="הקשיבו">
          🔊
        </button>
        <div>
          <div className="en" dir="ltr">
            {task.en}
          </div>
          <div className="he">{task.he}</div>
        </div>
      </div>
      <svg ref={svg} className={`dragscene ${status || ''}`} viewBox="0 0 480 300" style={{ touchAction: 'none' }} onPointerMove={move} onPointerUp={up}>
        <rect x="0" y="270" width="480" height="30" fill="#bbf7d0" />
        {inBox && catEl}
        <path d="M110 200 L94 180 L130 180 L138 200" fill="#d9a066" stroke="#8b5a2b" strokeWidth="3" />
        <path d="M200 200 L216 180 L180 180 L172 200" fill="#d9a066" stroke="#8b5a2b" strokeWidth="3" />
        <rect x="110" y="200" width="90" height="70" rx="4" fill="#c98b4f" stroke="#8b5a2b" strokeWidth="3" />
        <text x="155" y="245" fontSize="16" textAnchor="middle" fill="#5b3a1a" fontWeight="bold">box</text>
        <rect x="290" y="150" width="160" height="14" rx="4" fill="#a16207" stroke="#713f12" strokeWidth="3" />
        <rect x="302" y="164" width="12" height="106" fill="#a16207" stroke="#713f12" strokeWidth="2" />
        <rect x="426" y="164" width="12" height="106" fill="#a16207" stroke="#713f12" strokeWidth="2" />
        <text x="370" y="180" fontSize="16" textAnchor="middle" fill="#713f12" fontWeight="bold">table</text>
        {!inBox && catEl}
      </svg>
      {status === 'bad' && <div className="hint">לא בדיוק… נסו שוב! ({task.he})</div>}
    </div>
  );
}
