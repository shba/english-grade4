// Pictures are emoji or small hand-drawn SVGs (no third-party image licensing).

const SVGS = {
  fan: (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect x="44" y="55" width="12" height="32" rx="4" fill="#94a3b8" />
      <rect x="25" y="84" width="50" height="10" rx="5" fill="#64748b" />
      <circle cx="50" cy="40" r="34" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="5" />
      {[0, 120, 240].map((a) => (
        <ellipse key={a} cx="50" cy="24" rx="9" ry="16" fill="#38bdf8" transform={`rotate(${a} 50 40)`} />
      ))}
      <circle cx="50" cy="40" r="6" fill="#0369a1" />
    </svg>
  ),
  gum: (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect x="8" y="36" width="84" height="30" rx="6" fill="#f472b6" transform="rotate(-18 50 50)" />
      <rect x="30" y="36" width="40" height="30" fill="#fdf2f8" transform="rotate(-18 50 50)" />
      <text x="50" y="57" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#db2777" transform="rotate(-18 50 50)">
        GUM
      </text>
    </svg>
  ),
  ink: (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect x="38" y="12" width="24" height="16" rx="3" fill="#334155" />
      <path d="M22 40 Q22 28 36 28 H64 Q78 28 78 40 V84 Q78 92 70 92 H30 Q22 92 22 84 Z" fill="#1e293b" />
      <rect x="30" y="50" width="40" height="22" rx="3" fill="#f8fafc" />
      <text x="50" y="66" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#1e293b">
        INK
      </text>
    </svg>
  ),
  jam: (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect x="28" y="10" width="44" height="14" rx="4" fill="#dc2626" />
      <path d="M24 30 H76 V82 Q76 92 66 92 H34 Q24 92 24 82 Z" fill="#b91c1c" opacity="0.9" />
      <rect x="32" y="46" width="36" height="26" rx="4" fill="#fef3c7" />
      <text x="50" y="65" fontSize="22" textAnchor="middle">🍓</text>
    </svg>
  ),
};

export default function Pic({ pic, size = 64, label }) {
  if (pic?.startsWith('svg:')) {
    return (
      <span className="pic" style={{ width: size, height: size }} role="img" aria-label={label}>
        {SVGS[pic.slice(4)]}
      </span>
    );
  }
  return (
    <span className="pic emoji" style={{ fontSize: size * 0.85, width: size, height: size }} role="img" aria-label={label}>
      {pic}
    </span>
  );
}

export function Swatch({ hex, size = 64 }) {
  const bg = hex.startsWith('linear') ? { backgroundImage: hex } : { background: hex };
  return <span className="swatch" style={{ width: size, height: size, ...bg }} />;
}

export function NumberPic({ n, pic, size = 64 }) {
  return (
    <span className="numpic" style={{ width: size * 1.6, minHeight: size }}>
      <b style={{ fontSize: size * 0.6 }}>{n}</b>
      <span className="dots" style={{ fontSize: size * 0.2 }}>
        {Array.from({ length: n }, (_, i) => (
          <span key={i}>{pic}</span>
        ))}
      </span>
    </span>
  );
}
