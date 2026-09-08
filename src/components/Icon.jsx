/* ─────────────────────────────────────────────────────────────
   Cowdi icon set — kawaii flat style matching the pet artwork:
   thick dark outline, pastel fills, small white highlight.
   Usage: <Icon name="fire" size={24} />
   ───────────────────────────────────────────────────────────── */
const INK = '#3A3040';
const S = { stroke: INK, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Hi = ({ cx, cy, r = 1.8 }) => <circle cx={cx} cy={cy} r={r} fill="#fff" opacity=".8" />;

const ICONS = {
  /* ── HUD / status ── */
  fire: (
    <>
      <path {...S} fill="#FF8A4C" d="M16 3c1 5-4 8-6 13a6.5 6.5 0 0 0 13 0c0-3-1.5-5-3-7-.2 2.2-1.5 3-2.5 3 .8-2.5.5-6-1.5-9z" />
      <path fill="#FFD166" d="M16 15c.5 2.5-2.8 3.6-2.8 6.6a2.8 2.8 0 0 0 5.6 0c0-2.5-1.8-3.6-2.8-6.6z" />
      <Hi cx={12.5} cy={16} />
    </>
  ),
  medal: (
    <>
      <path {...S} fill="#4EA8E8" d="M10 3h12l-3.5 10h-5z" />
      <circle {...S} cx="16" cy="20" r="8" fill="#F6D365" />
      <path fill="#fff" d="M16 15.2l1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z" />
    </>
  ),
  coin: (
    <>
      <circle {...S} cx="16" cy="16" r="11" fill="#F6D365" />
      <circle {...S} cx="16" cy="16" r="7" fill="#F4A83A" />
      <path fill="#fff" d="M16 12l1.2 2.5 2.6.3-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.3z" />
      <Hi cx={11} cy={10.5} r={2} />
    </>
  ),
  star: (
    <>
      <path {...S} fill="#F6D365" d="M16 3l3.9 8 8.6 1.2-6.3 6.1 1.6 8.7L16 22.8 8.2 27l1.6-8.7L3.5 12.2l8.6-1.2z" />
      <Hi cx={12.5} cy={11} />
    </>
  ),
  heart: (
    <>
      <path {...S} fill="#F48FB1" d="M16 27S5 20.5 5 13a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 7.5-11 14-11 14z" />
      <Hi cx={10.5} cy={11} r={2} />
    </>
  ),
  lock: (
    <>
      <path {...S} fill="none" d="M10 14v-4a6 6 0 0 1 12 0v4" />
      <rect {...S} x="7" y="14" width="18" height="13" rx="4" fill="#B9C4D0" />
      <circle cx="16" cy="19.5" r="2" fill={INK} />
      <path {...S} d="M16 21v3" />
    </>
  ),
  check: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#7DBE4B" />
      <path stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M10 16.5l4 4 8-9" />
    </>
  ),
  play: (
    <>
      <path {...S} fill="#7DBE4B" d="M9 5l18 11L9 27z" />
      <Hi cx={12.5} cy={10} />
    </>
  ),
  clock: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#fff" />
      <path {...S} d="M16 9v7l5 3" />
    </>
  ),
  trophy: (
    <>
      <path {...S} fill="none" d="M9 8H4v2.5A4.5 4.5 0 0 0 8.5 15M23 8h5v2.5a4.5 4.5 0 0 1-4.5 4.5" />
      <path {...S} fill="#F6D365" d="M9 4h14v8a7 7 0 0 1-14 0z" />
      <path {...S} fill="#F4A83A" d="M14 19h4v4h-4zM9 23h14v5H9z" />
      <Hi cx={12.5} cy={8} r={2} />
    </>
  ),
  flag: (
    <>
      <path {...S} d="M8 28V4" />
      <path {...S} fill="#EA5A5A" d="M8 5h15l-3 5.5 3 5.5H8z" />
      <Hi cx={12} cy={8} />
    </>
  ),
  gift: (
    <>
      <rect {...S} x="5" y="13" width="22" height="14" rx="2" fill="#F48FB1" />
      <rect {...S} x="4" y="8" width="24" height="5.5" rx="1.5" fill="#EA5A5A" />
      <path {...S} fill="#F6D365" d="M14 8h4v19h-4z" />
      <path {...S} fill="none" d="M16 8c-3-6-8-4-6 0m6 0c3-6 8-4 6 0" />
    </>
  ),

  /* ── navigation ── */
  home: (
    <>
      <path {...S} fill="#FFD9A0" d="M7 14v13h18V14" />
      <path {...S} fill="#EA5A5A" d="M4 15L16 4l12 11" />
      <rect {...S} x="13" y="19" width="6" height="8" rx="1" fill="#7DBE4B" />
      <Hi cx={10} cy={17} />
    </>
  ),
  road: (
    <>
      <path {...S} fill="#8A99AA" d="M9 28L13 4h6l4 24z" />
      <path stroke="#fff" strokeWidth="2.2" strokeLinecap="round" d="M16 8v3M16 15v4M16 23v3" />
    </>
  ),
  book: (
    <>
      <path {...S} fill="#7DBE4B" d="M6 5h8a3 3 0 0 1 3 3v19a3 3 0 0 0-3-3H6z" />
      <path {...S} fill="#A3D67A" d="M26 5h-8a3 3 0 0 0-3 3v19a3 3 0 0 1 3-3h8z" />
      <path {...S} d="M9 10h4M9 14h4M19 10h4M19 14h4" />
    </>
  ),
  redbook: (
    <>
      <rect {...S} x="7" y="4" width="18" height="24" rx="2.5" fill="#EA5A5A" />
      <path {...S} fill="#C63F3F" d="M7 6.5A2.5 2.5 0 0 1 9.5 4H12v24H9.5A2.5 2.5 0 0 1 7 25.5z" />
      <rect x="14" y="11" width="9" height="4" rx="1" fill="#fff" />
      <Hi cx={21} cy={8} />
    </>
  ),
  map: (
    <>
      <path {...S} fill="#BEE48A" d="M4 8l8-3 8 3 8-3v19l-8 3-8-3-8 3z" />
      <path {...S} d="M12 5v19M20 8v19" />
      <path {...S} fill="#EA5A5A" d="M24 12a3 3 0 0 1 3 3c0 2-3 5-3 5s-3-3-3-5a3 3 0 0 1 3-3z" />
    </>
  ),
  brain: (
    <>
      <path {...S} fill="#F48FB1" d="M12 5a5 5 0 0 0-5 5 4.5 4.5 0 0 0-1 8.5A4.5 4.5 0 0 0 10.5 27H16V5z" />
      <path {...S} fill="#F9B6CC" d="M20 5a5 5 0 0 1 5 5 4.5 4.5 0 0 1 1 8.5A4.5 4.5 0 0 1 21.5 27H16V5z" />
      <path {...S} fill="none" d="M10 12c2 0 3 1.5 3 3M22 12c-2 0-3 1.5-3 3M9 20c2 0 3 1 4 2M23 20c-2 0-3 1-4 2" />
    </>
  ),
  target: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#EA5A5A" />
      <circle {...S} cx="16" cy="16" r="7.5" fill="#fff" />
      <circle {...S} cx="16" cy="16" r="3" fill="#EA5A5A" />
      <Hi cx={9} cy={9} r={2} />
    </>
  ),
  gamepad: (
    <>
      <rect {...S} x="3" y="10" width="26" height="13" rx="6.5" fill="#9C7BE0" />
      <path {...S} d="M10 13.5v6M7 16.5h6" />
      <circle cx="21" cy="15" r="1.6" fill="#F6D365" stroke={INK} strokeWidth="1.5" />
      <circle cx="24.5" cy="18" r="1.6" fill="#EA5A5A" stroke={INK} strokeWidth="1.5" />
    </>
  ),
  swords: (
    <>
      <path stroke={INK} strokeWidth="5" strokeLinecap="round" d="M8 8l14 14M24 8L10 22" />
      <path stroke="#B9C4D0" strokeWidth="2.4" strokeLinecap="round" d="M8 8l14 14M24 8L10 22" />
      <path {...S} strokeWidth="3" d="M20 24l4 4M12 24l-4 4M19 21l6-1M13 21l-6-1" />
    </>
  ),
  bag: (
    <>
      <path {...S} fill="none" d="M12 11V8a4 4 0 0 1 8 0v3" />
      <path {...S} fill="#F4A83A" d="M7.5 11h17l1.5 16H6z" />
      <path {...S} fill="#F6D365" d="M9 19h14l.6 8H8.4z" />
      <Hi cx={11} cy={15} />
    </>
  ),
  chart: (
    <>
      <path {...S} d="M4 28h24" />
      <rect {...S} x="6" y="17" width="5" height="11" fill="#4EA8E8" />
      <rect {...S} x="13.5" y="11" width="5" height="17" fill="#7DBE4B" />
      <rect {...S} x="21" y="5" width="5" height="23" fill="#F4A83A" />
    </>
  ),
  ranking: (
    <>
      <path {...S} d="M3 28h26" />
      <rect {...S} x="4" y="18" width="7" height="10" fill="#4EA8E8" />
      <rect {...S} x="12.5" y="10" width="7" height="18" fill="#F6D365" />
      <rect {...S} x="21" y="15" width="7" height="13" fill="#F4A83A" />
      <path fill="#fff" d="M16 3l1 2.2 2.4.3-1.8 1.6.5 2.4L16 8.3l-2.1 1.2.5-2.4-1.8-1.6 2.4-.3z" stroke={INK} strokeWidth="1.2" />
    </>
  ),
  user: (
    <>
      <path {...S} fill="#4EA8E8" d="M5 28a11 9 0 0 1 22 0z" />
      <circle {...S} cx="16" cy="11" r="6.5" fill="#FFD9A0" />
      <Hi cx={13} cy={8.5} />
    </>
  ),
  wrench: (
    <>
      <path {...S} fill="#B9C4D0" d="M21 4a7 7 0 0 0-6.8 8.7L4 22.9 9.1 28l10.2-10.2A7 7 0 1 0 21 4z" />
      <circle cx="21" cy="11" r="2.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
    </>
  ),
  sound: (
    <>
      <path {...S} fill="#4EA8E8" d="M5 12h5l6-5v18l-6-5H5z" />
      <path {...S} fill="none" d="M20 12a5 5 0 0 1 0 8M23.5 9a9.5 9.5 0 0 1 0 14" />
    </>
  ),
  mute: (
    <>
      <path {...S} fill="#B9C4D0" d="M5 12h5l6-5v18l-6-5H5z" />
      <path {...S} fill="none" d="M20 13l7 6M27 13l-7 6" />
    </>
  ),
  dumbbell: (
    <>
      <rect {...S} x="9" y="14" width="14" height="4" fill="#B9C4D0" />
      <rect {...S} x="4" y="9" width="5.5" height="14" rx="1.5" fill="#4EA8E8" />
      <rect {...S} x="22.5" y="9" width="5.5" height="14" rx="1.5" fill="#4EA8E8" />
      <rect {...S} x="1.5" y="12" width="2.5" height="8" rx="1" fill="#2F86C6" />
      <rect {...S} x="28" y="12" width="2.5" height="8" rx="1" fill="#2F86C6" />
    </>
  ),
  egg: (
    <>
      <path {...S} fill="#fff" d="M16 3c5 0 9.5 8 9.5 15a9.5 9.5 0 0 1-19 0C6.5 11 11 3 16 3z" />
      <circle cx="12" cy="14" r="2" fill="#3A3040" />
      <circle cx="19" cy="20" r="2.5" fill="#3A3040" />
      <circle cx="18" cy="10" r="1.3" fill="#3A3040" />
    </>
  ),
  paw: (
    <>
      <circle {...S} cx="8" cy="12" r="3" fill="#F48FB1" />
      <circle {...S} cx="13" cy="7" r="3" fill="#F48FB1" />
      <circle {...S} cx="19" cy="7" r="3" fill="#F48FB1" />
      <circle {...S} cx="24" cy="12" r="3" fill="#F48FB1" />
      <path {...S} fill="#F9B6CC" d="M16 27c-5 0-8-3-8-6.5 0-3.5 4-7 8-7s8 3.5 8 7c0 3.5-3 6.5-8 6.5z" />
    </>
  ),

  /* ── unit / topic ── */
  abc: (
    <>
      <rect {...S} x="2" y="6" width="28" height="20" rx="5" fill="#4EA8E8" />
      <text x="16" y="21.5" textAnchor="middle" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="14" fill="#fff" stroke={INK} strokeWidth=".9">ABC</text>
    </>
  ),
  blocks: (
    <>
      <rect {...S} x="5" y="17" width="10" height="10" rx="2" fill="#EA5A5A" />
      <rect {...S} x="17" y="17" width="10" height="10" rx="2" fill="#4EA8E8" />
      <rect {...S} x="11" y="6" width="10" height="10" rx="2" fill="#F6D365" />
      <Hi cx={14} cy={9} />
    </>
  ),
  chat: (
    <>
      <path {...S} fill="#4EA8E8" d="M4 6h24v15H14l-6 5v-5H4z" />
      <circle cx="10" cy="13.5" r="1.6" fill="#fff" />
      <circle cx="16" cy="13.5" r="1.6" fill="#fff" />
      <circle cx="22" cy="13.5" r="1.6" fill="#fff" />
    </>
  ),
  sprout: (
    <>
      <path {...S} d="M16 28V16" />
      <path {...S} fill="#7DBE4B" d="M16 16c-6 0-9.5-4-9.5-9.5 5.5 0 9.5 3.5 9.5 9.5z" />
      <path {...S} fill="#A3D67A" d="M16 16c6 0 9.5-4 9.5-9.5-5.5 0-9.5 3.5-9.5 9.5z" />
    </>
  ),
  leaf: (
    <>
      <path {...S} fill="#7DBE4B" d="M27 5C13 5 6 12 5 27c15-1 22-8 22-22z" />
      <path {...S} fill="none" d="M6 26L22 10" />
    </>
  ),
  tree: (
    <>
      <rect {...S} x="14" y="20" width="4" height="8" fill="#B58C5C" />
      <circle {...S} cx="16" cy="13" r="10" fill="#7DBE4B" />
      <Hi cx={11.5} cy={9} r={2.2} />
    </>
  ),
  clover: (
    <>
      <path {...S} d="M16 28v-8" />
      <circle {...S} cx="11" cy="11" r="5" fill="#7DBE4B" />
      <circle {...S} cx="21" cy="11" r="5" fill="#7DBE4B" />
      <circle {...S} cx="11" cy="19" r="5" fill="#7DBE4B" />
      <circle {...S} cx="21" cy="19" r="5" fill="#7DBE4B" />
    </>
  ),
  bolt: (
    <>
      <path {...S} fill="#F6D365" d="M18 3L7 18h8l-2 11 12-16h-8z" />
      <Hi cx={14} cy={12} />
    </>
  ),
  smile: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#F6D365" />
      <circle cx="11.5" cy="13" r="1.7" fill={INK} />
      <circle cx="20.5" cy="13" r="1.7" fill={INK} />
      <path {...S} fill="#EA5A5A" d="M10.5 18.5a5.5 5.5 0 0 0 11 0z" />
      <circle cx="8" cy="17" r="1.8" fill="#F48FB1" opacity=".8" />
      <circle cx="24" cy="17" r="1.8" fill="#F48FB1" opacity=".8" />
    </>
  ),
  pencil: (
    <>
      <path {...S} fill="#F6D365" d="M6 26l2-7L21 6l5 5L13 24z" />
      <path {...S} fill="#F48FB1" d="M21 6l5 5 2-2a2 2 0 0 0 0-3l-2-2a2 2 0 0 0-3 0z" />
      <path {...S} fill="#FFD9A0" d="M6 26l2-7 5 5z" />
      <path fill={INK} d="M6 26l1-3.5 2.5 2.5z" />
    </>
  ),
  ear: (
    <>
      <path {...S} fill="#FFD9A0" d="M10 12a6.5 6.5 0 0 1 13 0c0 4.5-4.5 5.5-4.5 10a4 4 0 0 1-8 0" />
      <path {...S} fill="none" d="M14 12.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2.5-2.5 5" />
    </>
  ),
  speak: (
    <>
      <path {...S} fill="#4EA8E8" d="M6 5h20v14H16l-6 5v-5H6z" />
      <path {...S} fill="none" d="M10 10h12M10 14h8" />
      <path {...S} fill="none" d="M22 22a6 6 0 0 0 0-8" />
    </>
  ),

  /* ── elements ── */
  water: (
    <>
      <path {...S} fill="#4EA8E8" d="M16 3S7 13 7 19a9 9 0 0 0 18 0c0-6-9-16-9-16z" />
      <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" d="M11 20a5 5 0 0 0 3 4" />
    </>
  ),
  rock: (
    <>
      <path {...S} fill="#B58C5C" d="M6 22l4-11 6-5 8 4 3 9-4 8H9z" />
      <path {...S} fill="none" d="M10 11l6 5 8-1M16 16l-2 11" />
    </>
  ),
  sparkle: (
    <>
      <path {...S} fill="#C4A6FF" d="M14 4l2.2 7.8L24 14l-7.8 2.2L14 24l-2.2-7.8L4 14l7.8-2.2z" />
      <path fill="#F6D365" stroke={INK} strokeWidth="1.5" d="M24 20l1.2 3 3 1.2-3 1.2L24 28l-1.2-2.6-3-1.2 3-1.2z" />
    </>
  ),
  neutral: (
    <>
      <circle {...S} cx="16" cy="16" r="11" fill="#E3EDF5" />
      <circle {...S} cx="16" cy="16" r="5" fill="#fff" />
    </>
  ),
  lens: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#4EA8E8" />
      <circle {...S} cx="16" cy="16" r="6.5" fill="#2F86C6" />
      <Hi cx={11} cy={10.5} r={2.6} />
    </>
  ),
};

export default function Icon({ name, size = 24, className = '', title, style }) {
  const body = ICONS[name];
  if (!body) return null;
  return (
    <svg
      className={`ic ic-${name} ${className}`}
      width={size} height={size} viewBox="0 0 32 32"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      style={style}
    >
      {title && <title>{title}</title>}
      {body}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(ICONS);

/* Element / skill → icon name maps (shared by pet screens) */
export const ELEMENT_ICON = { neutral: 'neutral', fire: 'fire', water: 'water', nature: 'leaf', earth: 'rock', cosmic: 'sparkle' };
export const SKILL_ICON = { listening: 'ear', speaking: 'speak', reading: 'book', writing: 'pencil' };
