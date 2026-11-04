// Preposition scenes: a cat and a box (or a table for "under").

function Box({ x, y = 140, w = 80, h = 60, open = false }) {
  return (
    <g>
      {open && (
        <>
          <path d={`M${x} ${y} L${x - 14} ${y - 18} L${x + 18} ${y - 18} L${x + 26} ${y}`} fill="#d9a066" stroke="#8b5a2b" strokeWidth="3" />
          <path d={`M${x + w} ${y} L${x + w + 14} ${y - 18} L${x + w - 18} ${y - 18} L${x + w - 26} ${y}`} fill="#d9a066" stroke="#8b5a2b" strokeWidth="3" />
        </>
      )}
      <rect x={x} y={y} width={w} height={h} rx="4" fill="#c98b4f" stroke="#8b5a2b" strokeWidth="3" />
      {!open && <rect x={x + w / 2 - 7} y={y} width="14" height={h} fill="#e8c49a" opacity="0.8" />}
    </g>
  );
}

function Table() {
  return (
    <g>
      <rect x="70" y="100" width="160" height="14" rx="4" fill="#a16207" stroke="#713f12" strokeWidth="3" />
      <rect x="84" y="114" width="12" height="86" fill="#a16207" stroke="#713f12" strokeWidth="2" />
      <rect x="204" y="114" width="12" height="86" fill="#a16207" stroke="#713f12" strokeWidth="2" />
    </g>
  );
}

function Cat({ x, y, size = 54 }) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor="middle">
      🐱
    </text>
  );
}

const SCENES = {
  in: (
    <>
      <Cat x={150} y={146} size={52} />
      <Box x={110} y={140} open />
    </>
  ),
  on: (
    <>
      <Box x={110} y={140} />
      <Cat x={150} y={136} />
    </>
  ),
  under: (
    <>
      <Table />
      <Cat x={150} y={194} />
    </>
  ),
  over: (
    <>
      <Box x={110} y={140} />
      <Cat x={150} y={66} />
      <path d="M95 120 Q150 10 205 120" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="7 7" />
    </>
  ),
  behind: (
    <>
      <Cat x={182} y={146} size={60} />
      <Box x={100} y={128} w={100} h={72} />
    </>
  ),
  'in front of': (
    <>
      <Box x={110} y={120} w={80} h={60} />
      <Cat x={150} y={206} size={64} />
    </>
  ),
  'next to': (
    <>
      <Box x={70} y={140} />
      <Cat x={205} y={196} />
    </>
  ),
  between: (
    <>
      <Box x={20} y={140} w={78} />
      <Box x={202} y={140} w={78} />
      <Cat x={150} y={196} />
    </>
  ),
};

export default function Scene({ prep, size = 150 }) {
  return (
    <svg className="scene" viewBox="0 0 300 220" width={size * 1.36} height={size} role="img" aria-label={prep}>
      <rect x="0" y="200" width="300" height="20" fill="#bbf7d0" />
      {SCENES[prep]}
    </svg>
  );
}
