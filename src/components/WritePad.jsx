import { useEffect, useRef, useState } from 'react';
import { GUIDES } from '../lib/guides.js';

function LetterBox({ width, height, strokes, onStrokes, status, guess, disabled }) {
  const canvas = useRef(null);
  const current = useRef(null);
  const base = useRef([]);

  useEffect(() => {
    const c = canvas.current;
    const dpr = window.devicePixelRatio || 1;
    c.width = width * dpr;
    c.height = height * dpr;
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, width, height);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = '#1e3a8a';
    g.lineWidth = Math.max(5, width * 0.06);
    for (const s of strokes) {
      g.beginPath();
      s.forEach((p, i) => (i ? g.lineTo(p.x * width, p.y * height) : g.moveTo(p.x * width, p.y * height)));
      if (s.length === 1) g.lineTo(s[0].x * width + 0.1, s[0].y * height);
      g.stroke();
    }
  }, [strokes, width, height]);

  const pos = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const down = (e) => {
    if (disabled) return;
    e.preventDefault();
    canvas.current.setPointerCapture?.(e.pointerId);
    current.current = [pos(e)];
    base.current = strokes;
    onStrokes([...strokes, [...current.current]]);
  };
  const move = (e) => {
    if (!current.current) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents?.() || [e];
    for (const ev of evs) current.current.push(pos(ev));
    onStrokes([...base.current, [...current.current]]);
  };
  const up = () => {
    current.current = null;
  };

  return (
    <div className={`letterbox ${status || ''}`} style={{ width, height }}>
      <svg className="guides" width={width} height={height} aria-hidden="true">
        <line x1="0" x2={width} y1={GUIDES.top * height} y2={GUIDES.top * height} stroke="#94a3b8" strokeWidth="2" />
        <line x1="0" x2={width} y1={GUIDES.mid * height} y2={GUIDES.mid * height} stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 7" />
        <line x1="0" x2={width} y1={GUIDES.base * height} y2={GUIDES.base * height} stroke="#ef4444" strokeWidth="2.5" />
      </svg>
      <canvas
        ref={canvas}
        style={{ width, height }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
      />
      {guess && <span className="guess">{guess}</span>}
    </div>
  );
}

/** One drawing box per letter. strokes: array (per box) of strokes. */
export default function WritePad({ length, strokes, setStrokes, statuses = [], guesses = [], disabled }) {
  const wrap = useRef(null);
  const [avail, setAvail] = useState(340);

  useEffect(() => {
    const measure = () => setAvail(Math.min(wrap.current?.clientWidth || 340, 900));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const gap = 8;
  const max = length === 1 ? 230 : 130;
  const width = Math.floor(Math.min(max, (avail - gap * (length - 1)) / length));
  const height = Math.floor(width * 1.3);

  return (
    <div className="writepad" ref={wrap} dir="ltr">
      <div className="boxes" style={{ gap }}>
        {Array.from({ length }, (_, i) => (
          <LetterBox
            key={i}
            width={width}
            height={height}
            strokes={strokes[i] || []}
            onStrokes={(s) => setStrokes((all) => {
              const next = [...all];
              next[i] = s;
              return next;
            })}
            status={statuses[i]}
            guess={guesses[i]}
            disabled={disabled}
          />
        ))}
      </div>
      {length > 1 && <p className="sub" dir="rtl">אות אחת בכל משבצת</p>}
    </div>
  );
}
