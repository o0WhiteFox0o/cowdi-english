/**
 * RadarChart — Biểu đồ ngũ giác kỹ năng
 * Responsive: tự động co theo container width trên mobile.
 * Props:
 *   data    : number[5]  — 0..100
 *   labels  : { name: string, value: string }[5]
 *   centerText : string (hiển thị ở giữa)
 */
export default function RadarChart({ data, labels, centerText }) {
  const N = 5;
  const SIZE = 320;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  // Bán kính lưới tính % so với SIZE – dành 28% cạnh mỗi bên cho labels
  const R_GRID  = SIZE * 0.31;
  const R_LABEL = SIZE * 0.47;  // vùng đặt label (ngoài lưới)
  const LEVELS  = 5;

  const pt = (r, idx) => {
    const angle = (idx * (360 / N) - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // lưới ngũ giác
  const gridPolygons = Array.from({ length: LEVELS }, (_, li) => {
    const r = R_GRID * ((li + 1) / LEVELS);
    const pts = Array.from({ length: N }, (__, i) => { const p = pt(r, i); return `${p.x},${p.y}`; }).join(' ');
    return <polygon key={li} points={pts} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />;
  });

  // các trục từ tâm
  const spokes = Array.from({ length: N }, (_, i) => {
    const p = pt(R_GRID, i);
    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />;
  });

  // polygon dữ liệu
  const dataPolygon = data.map((v, i) => {
    const r = (Math.max(0, Math.min(100, v)) / 100) * R_GRID;
    const p = pt(r, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  // labels – align text thông minh theo vị trí
  const labelEls = labels.map((lbl, i) => {
    const p   = pt(R_LABEL, i);
    const raw = (i * (360 / N) - 90) % 360;
    // anchor
    let anchor = 'middle';
    if (p.x < cx - 10) anchor = 'end';
    else if (p.x > cx + 10) anchor = 'start';

    return (
      <g key={i}>
        <text x={p.x} y={p.y - 6} textAnchor={anchor} fontSize="11" fontWeight="600" fill="var(--ink-muted, #7a8a9a)">
          {lbl.name}
        </text>
        <text x={p.x} y={p.y + 10} textAnchor={anchor} fontSize="12" fontWeight="700" fill="var(--red, #e74c3c)">
          {lbl.value}
        </text>
      </g>
    );
  });

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: SIZE }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(52,152,219,0.25)" />
            <stop offset="100%" stopColor="rgba(155,89,182,0.15)" />
          </linearGradient>
        </defs>

        {spokes}
        {gridPolygons}

        <polygon
          points={dataPolygon}
          fill="url(#radarFill)"
          stroke="var(--blue, #3498db)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {labelEls}

        {/* Centre score */}
        <text
          x={cx} y={cy + 8}
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill="var(--ink, #2c3e50)"
          fontFamily="var(--font-hand, 'Patrick Hand', cursive)"
        >
          {centerText}
        </text>
      </svg>
    </div>
  );
}
