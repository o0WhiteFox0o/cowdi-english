/* Watercolor-ish forest & camp banner drawn with plain SVG shapes. */
export default function ForestBanner() {
  return (
    <svg viewBox="0 0 640 280" role="img" aria-label="Rừng thông và lều cắm trại" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbe9f2" />
          <stop offset="1" stopColor="#f2ecd9" />
        </linearGradient>
        <linearGradient id="fb-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9c9d8" />
          <stop offset="1" stopColor="#7fa4b6" />
        </linearGradient>
        <linearGradient id="fb-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9b97a" />
          <stop offset="1" stopColor="#7f9457" />
        </linearGradient>
        <filter id="fb-soft"><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>

      {/* sky */}
      <rect width="640" height="280" fill="url(#fb-sky)" />
      <circle cx="520" cy="60" r="26" fill="#f6d98a" opacity=".9" />
      <ellipse cx="120" cy="60" rx="60" ry="14" fill="#fff" opacity=".65" filter="url(#fb-soft)" />
      <ellipse cx="380" cy="42" rx="48" ry="11" fill="#fff" opacity=".6" filter="url(#fb-soft)" />

      {/* distant mountains */}
      <path d="M0 170 L80 110 L150 160 L230 100 L310 158 L390 112 L470 160 L560 105 L640 165 L640 200 L0 200 Z" fill="#b7c7c9" opacity=".8" />
      <path d="M0 190 L60 150 L140 185 L220 140 L300 186 L380 148 L460 186 L540 142 L640 190 L640 220 L0 220 Z" fill="#8fa69a" opacity=".85" />

      {/* lake */}
      <path d="M300 214 Q420 196 640 214 L640 280 L300 280 Z" fill="url(#fb-lake)" />
      <path d="M340 236 Q380 232 420 238" stroke="#fff" strokeWidth="2" opacity=".5" fill="none" />
      <path d="M470 252 Q520 246 580 254" stroke="#fff" strokeWidth="2" opacity=".45" fill="none" />
      {/* boat */}
      <path d="M500 232 L536 232 L528 242 L508 242 Z" fill="#7a5637" />
      <line x1="518" y1="216" x2="518" y2="232" stroke="#5a3d28" strokeWidth="2" />
      <path d="M518 217 L530 229 L518 229 Z" fill="#f4ede0" />

      {/* ground */}
      <path d="M0 210 Q160 190 330 216 L330 280 L0 280 Z" fill="url(#fb-ground)" />
      <path d="M0 240 Q120 226 260 244 L260 280 L0 280 Z" fill="#6f874b" opacity=".85" />

      {/* pine trees (back row) */}
      {[
        [40, 150, .8], [90, 142, .95], [140, 150, .85], [190, 138, 1], [240, 150, .9], [285, 142, .8],
      ].map(([x, y, s], i) => (
        <g key={`b${i}`} transform={`translate(${x} ${y}) scale(${s})`} fill="#4b6a3d" opacity=".9">
          <path d="M0 -58 L22 -22 L-22 -22 Z" />
          <path d="M0 -38 L28 4 L-28 4 Z" />
          <path d="M0 -14 L34 30 L-34 30 Z" />
          <rect x="-4" y="30" width="8" height="14" fill="#5a3d28" />
        </g>
      ))}
      {/* pine trees (front row) */}
      {[[20, 200, 1.05], [110, 206, 1.1], [300, 196, .95]].map(([x, y, s], i) => (
        <g key={`f${i}`} transform={`translate(${x} ${y}) scale(${s})`} fill="#3f5c33">
          <path d="M0 -62 L24 -22 L-24 -22 Z" />
          <path d="M0 -40 L30 6 L-30 6 Z" />
          <path d="M0 -14 L36 32 L-36 32 Z" />
          <rect x="-4" y="32" width="8" height="14" fill="#4a3222" />
        </g>
      ))}

      {/* tent */}
      <g transform="translate(200 236)">
        <path d="M-46 8 L0 -48 L46 8 Z" fill="#6f8a4e" />
        <path d="M-46 8 L0 -48 L0 8 Z" fill="#5c7a3f" />
        <path d="M-12 8 L0 -18 L12 8 Z" fill="#3c2618" />
        <line x1="0" y1="-48" x2="0" y2="-58" stroke="#5a3d28" strokeWidth="3" />
        <path d="M0 -58 L14 -52 L0 -46 Z" fill="#d9a93c" />
      </g>

      {/* campfire */}
      <g transform="translate(262 252)">
        <line x1="-10" y1="4" x2="10" y2="-2" stroke="#5a3d28" strokeWidth="4" strokeLinecap="round" />
        <line x1="-10" y1="-2" x2="10" y2="4" stroke="#5a3d28" strokeWidth="4" strokeLinecap="round" />
        <path d="M0 -20 C6 -12 8 -6 4 0 C0 4 -6 2 -6 -4 C-8 -10 -4 -14 0 -20 Z" fill="#e8973f" />
        <path d="M0 -12 C3 -8 3 -4 1 -1 C-2 1 -4 -1 -3 -4 C-4 -7 -2 -9 0 -12 Z" fill="#f6d98a" />
      </g>

      {/* flowers */}
      {[30, 70, 150, 330, 420].map((x, i) => (
        <g key={`fl${i}`} transform={`translate(${x} ${262 + (i % 2) * 6})`}>
          <circle r="3" fill={i % 2 ? '#f4c9a5' : '#f6e08a'} />
          <circle r="1.2" fill="#c97b4a" />
        </g>
      ))}
    </svg>
  );
}
