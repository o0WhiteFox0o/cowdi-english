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

  /* ── feedback / status ── */
  x: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#EA5A5A" />
      <path stroke="#fff" strokeWidth="3" strokeLinecap="round" d="M11 11l10 10M21 11L11 21" />
    </>
  ),
  party: (
    <>
      <path {...S} fill="#F4A83A" d="M5 27l6-16 10 10z" />
      <path {...S} fill="#F6D365" d="M8 24l3-8 5 5z" />
      <circle cx="22" cy="6" r="2" fill="#EA5A5A" stroke={INK} strokeWidth="1.4" />
      <circle cx="27" cy="13" r="2" fill="#4EA8E8" stroke={INK} strokeWidth="1.4" />
      <circle cx="18" cy="4" r="1.6" fill="#7DBE4B" stroke={INK} strokeWidth="1.4" />
      <path {...S} fill="none" d="M20 11c2-3 4-3 6-6M13 8c1-2 0-4 1-5" />
    </>
  ),
  hundred: (
    <>
      <rect {...S} x="2" y="8" width="28" height="16" rx="5" fill="#EA5A5A" />
      <text x="16" y="20.5" textAnchor="middle" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="12" fill="#fff" stroke={INK} strokeWidth=".8">100</text>
    </>
  ),
  bulb: (
    <>
      <path {...S} fill="#F6D365" d="M16 3a9 9 0 0 0-5 16.5V23h10v-3.5A9 9 0 0 0 16 3z" />
      <rect {...S} x="12" y="23" width="8" height="5" rx="2" fill="#B9C4D0" />
      <path {...S} fill="none" d="M13.5 12.5a2.5 2.5 0 0 1 5 0" />
      <Hi cx={11.5} cy={9} r={2} />
    </>
  ),
  muscle: (
    <>
      <path {...S} fill="#FFD9A0" d="M6 20c0-6 3-10 8-12l2 3-3 4c5-3 11-1 13 4 1 3-1 8-6 9-6 1-14-1-14-8z" />
      <path {...S} fill="none" d="M14 18c2-1 5-1 7 1" />
      <Hi cx={22} cy={18} />
    </>
  ),
  thumb: (
    <>
      <rect {...S} x="4" y="14" width="6" height="12" rx="1.5" fill="#4EA8E8" />
      <path {...S} fill="#FFD9A0" d="M10 15l6-11c2 0 3.5 1.5 3 4l-1 4h7a3 3 0 0 1 3 3.5l-2 8a3 3 0 0 1-3 2.5H10z" />
      <Hi cx={14} cy={18} />
    </>
  ),
  sparkles: (
    <>
      <path {...S} fill="#F6D365" d="M12 4l2.4 7.6L22 14l-7.6 2.4L12 24l-2.4-7.6L2 14l7.6-2.4z" />
      <path fill="#C4A6FF" stroke={INK} strokeWidth="1.5" d="M24 17l1.4 3.6 3.6 1.4-3.6 1.4L24 27l-1.4-3.6-3.6-1.4 3.6-1.4z" />
      <path fill="#fff" stroke={INK} strokeWidth="1.3" d="M25 3l1 2.5 2.5 1-2.5 1L25 10l-1-2.5-2.5-1 2.5-1z" />
    </>
  ),
  note: (
    <>
      <rect {...S} x="6" y="4" width="20" height="24" rx="2.5" fill="#fff" />
      <path {...S} d="M10 11h12M10 16h12M10 21h7" />
      <path {...S} fill="#F6D365" d="M20 22l6-6 3 3-6 6h-3z" />
    </>
  ),
  refresh: (
    <>
      <path {...S} fill="none" d="M26 14a10 10 0 0 0-17-5M6 18a10 10 0 0 0 17 5" />
      <path {...S} fill="#4EA8E8" d="M26 6v8h-8zM6 26v-8h8z" />
    </>
  ),
  repeat: (
    <>
      <path {...S} fill="none" d="M8 20V12a3 3 0 0 1 3-3h13M24 12v8a3 3 0 0 1-3 3H8" />
      <path {...S} fill="#7DBE4B" d="M21 5l5 4-5 4zM11 19l-5 4 5 4z" />
    </>
  ),
  headphones: (
    <>
      <path {...S} fill="none" strokeWidth="3" d="M6 20v-4a10 10 0 0 1 20 0v4" />
      <rect {...S} x="3" y="17" width="7" height="10" rx="3" fill="#9C7BE0" />
      <rect {...S} x="22" y="17" width="7" height="10" rx="3" fill="#9C7BE0" />
      <Hi cx={6} cy={20} />
    </>
  ),
  cards: (
    <>
      <rect {...S} x="4" y="8" width="14" height="19" rx="2.5" fill="#fff" transform="rotate(-10 11 17)" />
      <rect {...S} x="14" y="6" width="14" height="19" rx="2.5" fill="#F48FB1" transform="rotate(8 21 15)" />
      <path fill="#fff" d="M21 11l1.2 2.5 2.6.3-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.3z" />
    </>
  ),
  mic: (
    <>
      <rect {...S} x="11" y="3" width="10" height="16" rx="5" fill="#EA5A5A" />
      <path {...S} fill="none" d="M7 15a9 9 0 0 0 18 0M16 24v4M11 28h10" />
      <Hi cx={14} cy={7} />
    </>
  ),
  timer: (
    <>
      <path {...S} d="M13 3h6M16 3v4M25 8l2-2" />
      <circle {...S} cx="16" cy="18" r="10" fill="#fff" />
      <path {...S} d="M16 18l4-4" />
      <circle cx="16" cy="18" r="1.5" fill={INK} />
    </>
  ),
  hourglass: (
    <>
      <path {...S} fill="#fff" d="M8 4h16v3c0 4-4 7-6 9 2 2 6 5 6 9v3H8v-3c0-4 4-7 6-9-2-2-6-5-6-9z" />
      <path fill="#F6D365" d="M11 7h10c0 3-3 5-5 7-2-2-5-4-5-7zM16 20c2 1 5 3 5 6H11c0-3 3-5 5-6z" />
      <path {...S} d="M6 4h20M6 28h20" />
    </>
  ),
  calendar: (
    <>
      <rect {...S} x="4" y="6" width="24" height="22" rx="3" fill="#fff" />
      <path {...S} fill="#EA5A5A" d="M4 9a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v4H4z" />
      <path {...S} d="M10 3v5M22 3v5" />
      <rect x="9" y="17" width="4" height="4" rx="1" fill="#4EA8E8" />
      <rect x="14" y="17" width="4" height="4" rx="1" fill="#B9C4D0" />
      <rect x="19" y="17" width="4" height="4" rx="1" fill="#B9C4D0" />
    </>
  ),
  link: (
    <>
      <path {...S} fill="none" d="M13 19l6-6" />
      <path {...S} fill="#4EA8E8" d="M11 21l-2 2a4.2 4.2 0 0 1-6-6l5-5a4.2 4.2 0 0 1 6 0" />
      <path {...S} fill="#7DBE4B" d="M21 11l2-2a4.2 4.2 0 0 1 6 6l-5 5a4.2 4.2 0 0 1-6 0" />
    </>
  ),
  rocket: (
    <>
      <path {...S} fill="#fff" d="M16 3c5 3 7 9 7 15l-7 4-7-4c0-6 2-12 7-15z" />
      <path {...S} fill="#EA5A5A" d="M9 18l-4 6h6zM23 18l4 6h-6z" />
      <path {...S} fill="#F4A83A" d="M13 22h6l-3 7z" />
      <circle {...S} cx="16" cy="12" r="2.5" fill="#4EA8E8" />
    </>
  ),
  bee: (
    <>
      <ellipse {...S} cx="16" cy="18" rx="9" ry="7" fill="#F6D365" />
      <path {...S} d="M12 12v12M17 11.5v13M22 13.5v9" />
      <ellipse {...S} cx="10" cy="9" rx="5" ry="3" fill="#fff" opacity=".9" />
      <ellipse {...S} cx="21" cy="8.5" rx="5" ry="3" fill="#fff" opacity=".9" />
      <circle cx="9" cy="17" r="1.5" fill={INK} />
    </>
  ),
  snail: (
    <>
      <path {...S} fill="#FFD9A0" d="M4 26c0-4 3-6 7-6h13c2 0 3 1 3 3v3z" />
      <circle {...S} cx="18" cy="14" r="8" fill="#F4A83A" />
      <path {...S} fill="none" d="M18 14a3.5 3.5 0 1 1 4 3" />
      <path {...S} d="M7 20V12M11 20v-7" />
      <circle cx="7" cy="11" r="1.6" fill={INK} />
      <circle cx="11" cy="12" r="1.6" fill={INK} />
    </>
  ),
  turtle: (
    <>
      <path {...S} fill="#7DBE4B" d="M6 20a10 8 0 0 1 20 0z" />
      <path {...S} fill="none" d="M11 20l3-5 4 0 3 5M14 15l2-3 2 3" />
      <ellipse {...S} cx="27" cy="19" rx="3.5" ry="3" fill="#A3D67A" />
      <circle cx="28" cy="18" r="1" fill={INK} />
      <path {...S} d="M9 26v-4M22 26v-4" />
    </>
  ),
  grad: (
    <>
      <path {...S} fill="#3B4A5C" d="M3 12l13-6 13 6-13 6z" />
      <path {...S} fill="#5F6E80" d="M9 15v6c0 2 3.5 4 7 4s7-2 7-4v-6l-7 3z" />
      <path {...S} d="M26 13v8" />
      <circle cx="26" cy="23" r="1.8" fill="#F6D365" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  gold: (
    <>
      <path {...S} fill="#EA5A5A" d="M10 3h12l-3 9h-6z" />
      <circle {...S} cx="16" cy="20" r="8" fill="#F6D365" />
      <text x="16" y="24" textAnchor="middle" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="10" fill={INK}>1</text>
    </>
  ),
  silver: (
    <>
      <path {...S} fill="#4EA8E8" d="M10 3h12l-3 9h-6z" />
      <circle {...S} cx="16" cy="20" r="8" fill="#DCE3EA" />
      <text x="16" y="24" textAnchor="middle" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="10" fill={INK}>2</text>
    </>
  ),
  bronze: (
    <>
      <path {...S} fill="#7DBE4B" d="M10 3h12l-3 9h-6z" />
      <circle {...S} cx="16" cy="20" r="8" fill="#E0A272" />
      <text x="16" y="24" textAnchor="middle" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="10" fill={INK}>3</text>
    </>
  ),
  search: (
    <>
      <circle {...S} cx="13" cy="13" r="9" fill="#D9F0FC" />
      <path {...S} strokeWidth="4" d="M20 20l7 7" />
      <Hi cx={9.5} cy={9.5} r={2.2} />
    </>
  ),
  clipboard: (
    <>
      <rect {...S} x="6" y="5" width="20" height="23" rx="2.5" fill="#F4A83A" />
      <rect {...S} x="9" y="9" width="14" height="16" rx="1.5" fill="#fff" />
      <rect {...S} x="11" y="3" width="10" height="4" rx="1.5" fill="#B9C4D0" />
      <path {...S} d="M12 14h8M12 18h8M12 22h5" />
    </>
  ),
  new: (
    <>
      <rect {...S} x="2" y="9" width="28" height="14" rx="4" fill="#7DBE4B" />
      <text x="16" y="20" textAnchor="middle" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="10" fill="#fff" stroke={INK} strokeWidth=".7">NEW</text>
    </>
  ),
  briefcase: (
    <>
      <path {...S} fill="none" d="M12 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <rect {...S} x="4" y="9" width="24" height="17" rx="3" fill="#B58C5C" />
      <path {...S} d="M4 16h24" />
      <rect {...S} x="13.5" y="14" width="5" height="4" rx="1" fill="#F6D365" />
    </>
  ),
  puzzle: (
    <>
      <path {...S} fill="#9C7BE0" d="M6 8h7a3 3 0 1 1 6 0h7v7a3 3 0 1 0 0 6v7h-7a3 3 0 1 0-6 0H6v-7a3 3 0 1 1 0-6z" />
      <Hi cx={10} cy={12} />
    </>
  ),
  dice: (
    <>
      <rect {...S} x="5" y="5" width="22" height="22" rx="5" fill="#fff" />
      <circle cx="11" cy="11" r="2" fill="#EA5A5A" />
      <circle cx="21" cy="11" r="2" fill="#EA5A5A" />
      <circle cx="16" cy="16" r="2" fill="#EA5A5A" />
      <circle cx="11" cy="21" r="2" fill="#EA5A5A" />
      <circle cx="21" cy="21" r="2" fill="#EA5A5A" />
    </>
  ),
  box: (
    <>
      <path {...S} fill="#B58C5C" d="M4 11l12-6 12 6v13l-12 6-12-6z" />
      <path {...S} fill="#D3A878" d="M4 11l12 6 12-6" />
      <path {...S} d="M16 17v13" />
      <path {...S} fill="#F6D365" d="M11 8l12 6v5l-4-2v-4z" />
    </>
  ),
  gem: (
    <>
      <path {...S} fill="#5ECFC0" d="M8 5h16l5 7-13 16L3 12z" />
      <path {...S} fill="none" d="M3 12h26M8 5l8 7 8-7M16 12v16" />
      <Hi cx={10} cy={8.5} />
    </>
  ),
  crown: (
    <>
      <path {...S} fill="#F6D365" d="M5 24L3 9l7 5 6-9 6 9 7-5-2 15z" />
      <path {...S} fill="#F4A83A" d="M5 24h22v3H5z" />
      <circle cx="16" cy="18" r="2" fill="#EA5A5A" stroke={INK} strokeWidth="1.4" />
      <circle cx="9.5" cy="19" r="1.5" fill="#4EA8E8" stroke={INK} strokeWidth="1.4" />
      <circle cx="22.5" cy="19" r="1.5" fill="#4EA8E8" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  globe: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#4EA8E8" />
      <path fill="#7DBE4B" stroke={INK} strokeWidth="1.5" d="M9 8c3 1 5 4 3 6s-4 1-5 4 2 4 1 6C5 22 4 18 5 13c1-3 3-4 4-5zM20 6c3 1 5 4 5 7-2 0-4 3-3 5s3 2 2 5c-3 2-7 1-8-2 2-1 4-4 3-6s-4-2-3-5 3-3 4-4z" />
      <Hi cx={10} cy={7} />
    </>
  ),
  question: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#F4A83A" />
      <path stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" d="M12 12.5a4 4 0 0 1 8 0c0 3-4 3-4 6" />
      <circle cx="16" cy="23" r="1.8" fill="#fff" />
    </>
  ),
  info: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#4EA8E8" />
      <path stroke="#fff" strokeWidth="3" strokeLinecap="round" d="M16 14v9" />
      <circle cx="16" cy="9.5" r="1.9" fill="#fff" />
    </>
  ),
  warning: (
    <>
      <path {...S} fill="#F6D365" d="M16 4L3 27h26z" />
      <path {...S} strokeWidth="3" d="M16 12v7" />
      <circle cx="16" cy="23" r="1.8" fill={INK} />
    </>
  ),
  checkered: (
    <>
      <path {...S} d="M7 29V4" />
      <path {...S} fill="#fff" d="M7 5h18v13H7z" />
      <path fill={INK} d="M7 5h4.5v4.3H7zM16 5h4.5v4.3H16zM11.5 9.3H16v4.3h-4.5zM20.5 9.3H25v4.3h-4.5zM7 13.6h4.5V18H7zM16 13.6h4.5V18H16z" />
    </>
  ),
  money: (
    <>
      <rect {...S} x="3" y="9" width="26" height="15" rx="2.5" fill="#7DBE4B" />
      <circle {...S} cx="16" cy="16.5" r="4.5" fill="#A3D67A" />
      <circle cx="8" cy="16.5" r="1.5" fill="#fff" />
      <circle cx="24" cy="16.5" r="1.5" fill="#fff" />
      <Hi cx={7} cy={12} />
    </>
  ),
  chartup: (
    <>
      <path {...S} d="M4 28h24M4 28V6" />
      <path {...S} fill="none" strokeWidth="3" d="M7 23l6-7 5 3 8-10" />
      <path {...S} fill="#7DBE4B" d="M21 8h6v6z" />
    </>
  ),
  chartdown: (
    <>
      <path {...S} d="M4 28h24M4 28V6" />
      <path {...S} fill="none" strokeWidth="3" d="M7 9l6 7 5-3 8 10" />
      <path {...S} fill="#EA5A5A" d="M21 24h6v-6z" />
    </>
  ),
  users: (
    <>
      <path {...S} fill="#7DBE4B" d="M16 28a8 7 0 0 1 16 0z" />
      <circle {...S} cx="24" cy="15" r="4.5" fill="#FFD9A0" />
      <path {...S} fill="#4EA8E8" d="M2 28a9 8 0 0 1 18 0z" />
      <circle {...S} cx="11" cy="13" r="5.5" fill="#FFD9A0" />
    </>
  ),
  handshake: (
    <>
      <path {...S} fill="#FFD9A0" d="M3 14l6-6 7 3 4-3 9 6-4 3-3 5-6 4-9-6z" />
      <path {...S} fill="none" d="M12 18l4 3M15 15l4 3M9 8l7 7" />
    </>
  ),
  bricks: (
    <>
      <rect {...S} x="3" y="6" width="12" height="7" fill="#E0A272" />
      <rect {...S} x="17" y="6" width="12" height="7" fill="#E0A272" />
      <rect {...S} x="9" y="13" width="14" height="7" fill="#EA5A5A" />
      <rect {...S} x="3" y="20" width="12" height="7" fill="#E0A272" />
      <rect {...S} x="17" y="20" width="12" height="7" fill="#E0A272" />
    </>
  ),
  boom: (
    <>
      <path {...S} fill="#F4A83A" d="M16 3l3 7 7-3-3 7 7 3-7 3 3 7-7-3-3 7-3-7-7 3 3-7-7-3 7-3-3-7 7 3z" />
      <path fill="#F6D365" d="M16 10l1.8 4.2 4.2-1.8-1.8 4.2 4.2 1.8-4.2 1.8 1.8 4.2-4.2-1.8L16 26l-1.8-4.2-4.2 1.8 1.8-4.2-4.2-1.8 4.2-1.8-1.8-4.2 4.2 1.8z" />
    </>
  ),
  sad: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#F6D365" />
      <circle cx="11.5" cy="13" r="1.7" fill={INK} />
      <circle cx="20.5" cy="13" r="1.7" fill={INK} />
      <path {...S} fill="none" d="M11.5 22a5 5 0 0 1 9 0" />
      <path {...S} fill="#4EA8E8" d="M23 15c1.5 2 2.5 4 2.5 5.5a2.5 2.5 0 0 1-5 0c0-1.5 1-3.5 2.5-5.5z" />
    </>
  ),
  cool: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#F6D365" />
      <path {...S} fill="#3B4A5C" d="M5 12h22v2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-4 5 5 0 0 1-5 4h-1a5 5 0 0 1-5-5z" />
      <path {...S} fill="none" d="M11 22c2 2 8 2 10 0" />
      <Hi cx={10} cy={15} />
    </>
  ),
  angry: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#F4A83A" />
      <path {...S} d="M9 10l5 2M23 10l-5 2" />
      <circle cx="11.5" cy="14.5" r="1.7" fill={INK} />
      <circle cx="20.5" cy="14.5" r="1.7" fill={INK} />
      <path {...S} d="M11 22h10" />
      <path {...S} fill="#fff" d="M24 21c2 0 4 1 4 3s-2 3-4 3z" />
    </>
  ),
  love: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#F6D365" />
      <path fill="#EA5A5A" stroke={INK} strokeWidth="1.4" d="M11 10.5a2 2 0 0 1 3.5 1.5 2 2 0 0 1 3.5-1.5c1 1 0 3-3.5 5.5-3.5-2.5-4.5-4.5-3.5-5.5z" transform="translate(-4 0)" />
      <path fill="#EA5A5A" stroke={INK} strokeWidth="1.4" d="M11 10.5a2 2 0 0 1 3.5 1.5 2 2 0 0 1 3.5-1.5c1 1 0 3-3.5 5.5-3.5-2.5-4.5-4.5-3.5-5.5z" transform="translate(6 0)" />
      <path {...S} fill="#EA5A5A" d="M11 20a5 5 0 0 0 10 0z" />
    </>
  ),
  sick: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#BEE48A" />
      <circle cx="11.5" cy="12" r="1.7" fill={INK} />
      <circle cx="20.5" cy="12" r="1.7" fill={INK} />
      <rect {...S} x="8" y="17" width="16" height="7" rx="2.5" fill="#fff" />
      <path {...S} d="M12 20.5h8" />
    </>
  ),
  think: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#F6D365" />
      <path {...S} d="M9 11l5-1M18 10l5 1" />
      <circle cx="11.5" cy="14" r="1.7" fill={INK} />
      <circle cx="20.5" cy="14" r="1.7" fill={INK} />
      <path {...S} d="M12 21c2-1.5 5-1 7 .5" />
      <circle {...S} cx="24" cy="25" r="3" fill="#FFD9A0" />
    </>
  ),
  eye: (
    <>
      <path {...S} fill="#fff" d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z" />
      <circle {...S} cx="16" cy="16" r="5" fill="#4EA8E8" />
      <circle cx="16" cy="16" r="2.2" fill={INK} />
      <Hi cx={13.5} cy={13.5} />
    </>
  ),
  eyes: (
    <>
      <ellipse {...S} cx="10" cy="16" rx="6.5" ry="8" fill="#fff" />
      <ellipse {...S} cx="22" cy="16" rx="6.5" ry="8" fill="#fff" />
      <circle cx="12" cy="17" r="2.8" fill={INK} />
      <circle cx="24" cy="17" r="2.8" fill={INK} />
      <Hi cx={11} cy={15.5} r={1} />
      <Hi cx={23} cy={15.5} r={1} />
    </>
  ),
  wave: (
    <>
      <path {...S} fill="#FFD9A0" d="M9 28c-3-3-4-7-3-11l2-7 3 1-1 6 2-9 3 1-1 8 3-9 3 1-2 9 3-6 3 1-3 9c-1 5-6 9-12 6z" />
      <path {...S} fill="none" d="M4 8a5 5 0 0 1 2-4M3 12a8 8 0 0 1 1-6" />
    </>
  ),
  phone: (
    <>
      <rect {...S} x="8" y="3" width="16" height="26" rx="3" fill="#3B4A5C" />
      <rect x="10" y="6.5" width="12" height="17" rx="1" fill="#D9F0FC" />
      <circle cx="16" cy="26" r="1.4" fill="#fff" />
    </>
  ),
  keyboard: (
    <>
      <rect {...S} x="2" y="9" width="28" height="15" rx="3" fill="#DCE3EA" />
      <path fill={INK} d="M6 13h3v3H6zM11 13h3v3h-3zM16 13h3v3h-3zM21 13h3v3h-3zM8 18h16v2.5H8z" />
    </>
  ),
  pause: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#F4A83A" />
      <rect x="11" y="10" width="3.5" height="12" rx="1" fill="#fff" />
      <rect x="17.5" y="10" width="3.5" height="12" rx="1" fill="#fff" />
    </>
  ),
  wind: (
    <>
      <path {...S} fill="none" strokeWidth="3" d="M3 11h14a3.5 3.5 0 1 0-3.5-3.5M3 17h20a3.5 3.5 0 1 1-3.5 3.5M3 23h10a3 3 0 1 1-3 3" />
    </>
  ),
  pumpkin: (
    <>
      <path {...S} fill="#7DBE4B" d="M15 4c0-1 2-2 4 0l-1 5h-3z" />
      <ellipse {...S} cx="16" cy="18" rx="12" ry="10" fill="#F4A83A" />
      <path {...S} fill="none" d="M11 9c-2 3-2 15 0 18M21 9c2 3 2 15 0 18" />
      <path fill={INK} d="M9 15l4 3H9zM23 15l-4 3h4zM10 21h12l-2 3H12z" />
    </>
  ),
  apple: (
    <>
      <path {...S} fill="#7DBE4B" d="M17 8c0-3 3-5 6-4-1 3-3 4-6 4z" />
      <path {...S} d="M16 8V4" />
      <path {...S} fill="#EA5A5A" d="M16 10c-3-2-9-2-10 5-1 6 3 13 6 13 2 0 2-1 4-1s2 1 4 1c3 0 7-7 6-13-1-7-7-7-10-5z" />
      <Hi cx={11} cy={14} r={2.2} />
    </>
  ),
  sleep: (
    <>
      <text x="6" y="27" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="14" fill="#9C7BE0" stroke={INK} strokeWidth="1">Z</text>
      <text x="14" y="19" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="11" fill="#9C7BE0" stroke={INK} strokeWidth="1">Z</text>
      <text x="21" y="12" fontFamily="Nunito, Arial, sans-serif" fontWeight="900" fontSize="8" fill="#9C7BE0" stroke={INK} strokeWidth="1">Z</text>
    </>
  ),
  music: (
    <>
      <path {...S} d="M12 24V6l14-3v18" />
      <circle {...S} cx="8" cy="24" r="4" fill="#F48FB1" />
      <circle {...S} cx="22" cy="21" r="4" fill="#F48FB1" />
    </>
  ),
  bell: (
    <>
      <path {...S} fill="#F6D365" d="M16 4a8 8 0 0 0-8 8v6l-3 4h22l-3-4v-6a8 8 0 0 0-8-8z" />
      <path {...S} fill="#F4A83A" d="M12 22a4 4 0 0 0 8 0z" />
      <path {...S} d="M16 2v2" />
      <Hi cx={12} cy={10} />
    </>
  ),
  bellOff: (
    <>
      <path {...S} fill="#B9C4D0" d="M16 4a8 8 0 0 0-8 8v6l-3 4h22l-3-4v-6a8 8 0 0 0-8-8z" />
      <path {...S} fill="#8A99AA" d="M12 22a4 4 0 0 0 8 0z" />
      <path {...S} strokeWidth="3" d="M5 27L27 5" />
    </>
  ),
  arrowLeft: (
    <>
      <path {...S} fill="#4EA8E8" d="M4 16L14 6v6h14v8H14v6z" />
    </>
  ),
  arrowRight: (
    <>
      <path {...S} fill="#4EA8E8" d="M28 16L18 6v6H4v8h14v6z" />
    </>
  ),
  arrowsLR: (
    <>
      <path {...S} fill="#4EA8E8" d="M3 12l7-6v4h12V6l7 6-7 6v-4H10v4z" />
      <path {...S} fill="#7DBE4B" d="M3 22l7-5v3h12v-3l7 5-7 5v-3H10v3z" />
    </>
  ),
  plus: (
    <>
      <circle {...S} cx="16" cy="16" r="12" fill="#7DBE4B" />
      <path stroke="#fff" strokeWidth="3.5" strokeLinecap="round" d="M16 9v14M9 16h14" />
    </>
  ),
  pin: (
    <>
      <circle {...S} cx="16" cy="9" r="6" fill="#EA5A5A" />
      <path {...S} fill="#EA5A5A" d="M11 12h10l-5 8z" />
      <path {...S} d="M16 20v9" />
      <Hi cx={13.5} cy={7} />
    </>
  ),
  cow: (
    <>
      <path {...S} fill="#FFD9A0" d="M4 12c-2-1-2-5 1-5 2 0 3 2 3 3M28 12c2-1 2-5-1-5-2 0-3 2-3 3" />
      <ellipse {...S} cx="16" cy="16" rx="11" ry="10" fill="#fff" />
      <path fill={INK} d="M8 11c3-2 5 0 4 3s-5 2-4-3zM21 22c2-1 4 0 3 2s-4 1-3-2z" />
      <ellipse {...S} cx="16" cy="22" rx="6" ry="4" fill="#F9B6CC" />
      <circle cx="14" cy="22" r="1.1" fill={INK} />
      <circle cx="18" cy="22" r="1.1" fill={INK} />
      <circle cx="12" cy="15" r="1.5" fill={INK} />
      <circle cx="20" cy="15" r="1.5" fill={INK} />
    </>
  ),
  dragon: (
    <>
      <path {...S} fill="#7DBE4B" d="M6 20c0-8 5-13 12-13 5 0 8 3 8 7 0 3-2 5-5 5l3 4H10c-2 0-4-1-4-3z" />
      <path {...S} fill="#F6D365" d="M12 7l2-4 2 4M18 7l2-4 1 4" />
      <path {...S} fill="#EA5A5A" d="M26 14l4 1-3 2z" />
      <circle cx="19" cy="13" r="1.6" fill={INK} />
    </>
  ),
  cat: (
    <>
      <path {...S} fill="#FFD9A0" d="M6 6l5 5h10l5-5v14a10 10 0 0 1-20 0z" />
      <circle cx="12" cy="17" r="1.6" fill={INK} />
      <circle cx="20" cy="17" r="1.6" fill={INK} />
      <path {...S} fill="#F48FB1" d="M14.5 21h3l-1.5 2z" />
      <path {...S} d="M4 19h5M23 19h5" />
    </>
  ),
  bunny: (
    <>
      <path {...S} fill="#fff" d="M10 3c3 0 4 6 4 10h-4c-3-4-3-10 0-10zM22 3c-3 0-4 6-4 10h4c3-4 3-10 0-10z" />
      <ellipse {...S} cx="16" cy="20" rx="10" ry="8.5" fill="#fff" />
      <circle cx="12" cy="19" r="1.6" fill={INK} />
      <circle cx="20" cy="19" r="1.6" fill={INK} />
      <path {...S} fill="#F48FB1" d="M14.5 23h3l-1.5 2z" />
    </>
  ),
  chick: (
    <>
      <circle {...S} cx="16" cy="18" r="10" fill="#F6D365" />
      <path {...S} fill="#F4A83A" d="M14 18h4l-2 3z" />
      <circle cx="12" cy="15" r="1.6" fill={INK} />
      <circle cx="20" cy="15" r="1.6" fill={INK} />
      <path {...S} fill="none" d="M14 8c0-3 2-4 2-4s2 1 2 4" />
    </>
  ),
  fish: (
    <>
      <path {...S} fill="#4EA8E8" d="M4 16c4-6 10-8 16-6l7-4-2 10 2 10-7-4c-6 2-12 0-16-6z" />
      <circle cx="10" cy="15" r="1.6" fill={INK} />
      <Hi cx={14} cy={12} />
    </>
  ),
  camera: (
    <>
      <rect {...S} x="3" y="9" width="26" height="18" rx="3" fill="#5F6E80" />
      <path {...S} fill="#3B4A5C" d="M11 9l2-4h6l2 4z" />
      <circle {...S} cx="16" cy="18" r="5.5" fill="#4EA8E8" />
      <Hi cx={14} cy={16} />
    </>
  ),
  mail: (
    <>
      <rect {...S} x="3" y="7" width="26" height="18" rx="3" fill="#F6D365" />
      <path {...S} fill="#F4A83A" d="M3 10l13 9 13-9v-3H3z" />
    </>
  ),
  save: (
    <>
      <path {...S} fill="#4EA8E8" d="M5 5h18l4 4v18H5z" />
      <rect {...S} x="9" y="5" width="11" height="7" fill="#fff" />
      <rect {...S} x="9" y="18" width="14" height="9" rx="1" fill="#DCE3EA" />
    </>
  ),
  scroll: (
    <>
      <path {...S} fill="#FFF0C8" d="M8 6h16a3 3 0 0 1 3 3v14H8z" />
      <path {...S} fill="#F4A83A" d="M5 23h22a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM5 6a3 3 0 0 1 3 3v14H5z" />
      <path {...S} d="M12 11h10M12 15h10M12 19h6" />
    </>
  ),
  mask: (
    <>
      <path {...S} fill="#F6D365" d="M4 8c3 2 6 2 9 0v9a4.5 4.5 0 0 1-9 0z" />
      <path {...S} fill="#9C7BE0" d="M19 12c3 2 6 2 9 0v9a4.5 4.5 0 0 1-9 0z" />
      <path fill={INK} d="M6 12l3 1-3 1zM11 12l-3 1 3 1zM21 16l3 1-3 1zM26 16l-3 1 3 1z" />
      <path {...S} fill="none" d="M6.5 17a2.5 2.5 0 0 0 4 0M21.5 22.5a2.5 2.5 0 0 1 4 0" />
    </>
  ),
  palette: (
    <>
      <path {...S} fill="#fff" d="M16 4a12 12 0 1 0 4 23c2-1 1-3 0-4s0-3 2-3h3a3 3 0 0 0 3-4A12 12 0 0 0 16 4z" />
      <circle cx="9" cy="14" r="2.2" fill="#EA5A5A" stroke={INK} strokeWidth="1.3" />
      <circle cx="13" cy="9" r="2.2" fill="#F6D365" stroke={INK} strokeWidth="1.3" />
      <circle cx="20" cy="9" r="2.2" fill="#7DBE4B" stroke={INK} strokeWidth="1.3" />
      <circle cx="10" cy="21" r="2.2" fill="#4EA8E8" stroke={INK} strokeWidth="1.3" />
    </>
  ),
  ruler: (
    <>
      <path {...S} fill="#F6D365" d="M4 22L22 4l6 6L10 28z" />
      <path {...S} d="M9 17l2 2M13 13l2 2M17 9l2 2M11 15l3 3M15 11l3 3" />
    </>
  ),
  building: (
    <>
      <rect {...S} x="6" y="4" width="20" height="24" rx="2" fill="#4EA8E8" />
      <path fill="#F6D365" d="M10 8h3v3h-3zM15 8h3v3h-3zM20 8h2v3h-2zM10 13h3v3h-3zM15 13h3v3h-3zM20 13h2v3h-2zM10 18h3v3h-3zM20 18h2v3h-2z" />
      <rect {...S} x="14" y="20" width="4.5" height="8" fill="#3B4A5C" />
    </>
  ),
  plane: (
    <>
      <path {...S} fill="#fff" d="M4 18l8-2 8-10a3 3 0 0 1 5 2l-6 9 3 6-3 2-4-5-5 1-2 4-3-1 1-4-3-1z" />
      <Hi cx={18} cy={10} />
    </>
  ),
  factory: (
    <>
      <path {...S} fill="#8A99AA" d="M4 28V12l7 4v-4l7 4v-4l7 4V6h4v22z" />
      <rect x="8" y="20" width="3" height="3" fill="#F6D365" />
      <rect x="15" y="20" width="3" height="3" fill="#F6D365" />
      <rect x="22" y="20" width="3" height="3" fill="#F6D365" />
    </>
  ),
  cart: (
    <>
      <path {...S} fill="none" d="M3 5h4l3 14h14l3-10H9" />
      <path {...S} fill="#F6D365" d="M9 9h18l-3 10H10z" />
      <circle {...S} cx="12" cy="25" r="2.5" fill="#3B4A5C" />
      <circle {...S} cx="22" cy="25" r="2.5" fill="#3B4A5C" />
    </>
  ),
  lotus: (
    <>
      <path {...S} fill="#F48FB1" d="M16 26C9 26 4 21 3 16c5 0 9 2 11 5 0-5 1-11 2-15 1 4 2 10 2 15 2-3 6-5 11-5-1 5-6 10-13 10z" />
      <path {...S} fill="#F9B6CC" d="M16 26c-3-1-5-4-5-8 3 1 5 4 5 8zM16 26c3-1 5-4 5-8-3 1-5 4-5 8z" />
    </>
  ),
  christmas: (
    <>
      <path {...S} fill="#7DBE4B" d="M16 3l6 8h-3l5 7h-3l6 8H5l6-8H8l5-7h-3z" />
      <rect {...S} x="14" y="26" width="4" height="4" fill="#B58C5C" />
      <circle cx="13" cy="15" r="1.5" fill="#EA5A5A" />
      <circle cx="19" cy="20" r="1.5" fill="#F6D365" />
      <circle cx="11" cy="23" r="1.5" fill="#4EA8E8" />
    </>
  ),
  tophat: (
    <>
      <path {...S} fill="#3B4A5C" d="M9 6h14v14H9z" />
      <path {...S} fill="#3B4A5C" d="M4 20h24v3H4z" />
      <path fill="#EA5A5A" d="M9 15h14v3H9z" />
      <Hi cx={12} cy={9} />
    </>
  ),
  tie: (
    <>
      <path {...S} fill="#EA5A5A" d="M13 4h6l-2 5 4 14-5 6-5-6 4-14z" />
      <path {...S} fill="#C63F3F" d="M13 4h6l-2 5h-2z" />
    </>
  ),
  pizza: (
    <>
      <path {...S} fill="#F6D365" d="M16 28L4 8c8-4 16-4 24 0z" />
      <path {...S} fill="none" strokeWidth="3" stroke="#E0A272" d="M5 8.5c7-3.5 15-3.5 22 0" />
      <circle cx="12" cy="13" r="2.2" fill="#EA5A5A" stroke={INK} strokeWidth="1.3" />
      <circle cx="20" cy="13" r="2.2" fill="#EA5A5A" stroke={INK} strokeWidth="1.3" />
      <circle cx="16" cy="20" r="2.2" fill="#EA5A5A" stroke={INK} strokeWidth="1.3" />
    </>
  ),
  plate: (
    <>
      <circle {...S} cx="16" cy="16" r="11" fill="#fff" />
      <circle {...S} cx="16" cy="16" r="6" fill="#D9F0FC" />
      <path {...S} d="M4 6v9M28 6c-2 0-3 2-3 4v5" />
    </>
  ),
  megaphone: (
    <>
      <path {...S} fill="#F4A83A" d="M5 13h6l12-7v20l-12-7H5z" />
      <path {...S} fill="#F6D365" d="M5 13h6v6H5z" />
      <path {...S} fill="none" d="M26 12a5 5 0 0 1 0 8" />
      <path {...S} fill="#B9C4D0" d="M7 19h4l1 7H8z" />
    </>
  ),
  notebook: (
    <>
      <rect {...S} x="7" y="4" width="19" height="24" rx="2.5" fill="#F4A83A" />
      <path {...S} d="M5 9h4M5 15h4M5 21h4" />
      <rect x="13" y="9" width="8" height="5" rx="1" fill="#fff" />
    </>
  ),
  greenbook: (
    <>
      <rect {...S} x="7" y="4" width="18" height="24" rx="2.5" fill="#7DBE4B" />
      <path {...S} fill="#5E9A35" d="M7 6.5A2.5 2.5 0 0 1 9.5 4H12v24H9.5A2.5 2.5 0 0 1 7 25.5z" />
      <rect x="14" y="11" width="9" height="4" rx="1" fill="#fff" />
    </>
  ),
  bluebook: (
    <>
      <rect {...S} x="7" y="4" width="18" height="24" rx="2.5" fill="#4EA8E8" />
      <path {...S} fill="#2F86C6" d="M7 6.5A2.5 2.5 0 0 1 9.5 4H12v24H9.5A2.5 2.5 0 0 1 7 25.5z" />
      <rect x="14" y="11" width="9" height="4" rx="1" fill="#fff" />
    </>
  ),
  books: (
    <>
      <rect {...S} x="4" y="8" width="7" height="20" rx="1.5" fill="#EA5A5A" />
      <rect {...S} x="11" y="4" width="7" height="24" rx="1.5" fill="#4EA8E8" />
      <path {...S} fill="#F6D365" d="M18 9l6.5-1.7L29 26l-6.5 1.7z" />
      <path {...S} d="M6 13h3M13 9h3" />
    </>
  ),
  moon: (
    <>
      <path {...S} fill="#F6D365" d="M20 3a13 13 0 1 0 9 22A11 11 0 0 1 20 3z" />
      <Hi cx={14} cy={12} r={2.2} />
    </>
  ),
  sun: (
    <>
      <path {...S} d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l3 3M23 23l3 3M6 26l3-3M23 9l3-3" />
      <circle {...S} cx="16" cy="16" r="7" fill="#F6D365" />
      <Hi cx={13} cy={13} />
    </>
  ),
  cloud: (
    <>
      <path {...S} fill="#fff" d="M9 25a5.5 5.5 0 0 1-1-11 7 7 0 0 1 13.5-2A5 5 0 0 1 24 25z" />
      <Hi cx={12} cy={17} r={2.2} />
    </>
  ),
  magnet: (
    <>
      <path {...S} fill="#EA5A5A" d="M6 16a10 10 0 0 1 20 0v10h-6V16a4 4 0 0 0-8 0v10H6z" />
      <path {...S} fill="#B9C4D0" d="M6 21h6v5H6zM20 21h6v5h-6z" />
    </>
  ),
  slider: (
    <>
      <path {...S} d="M6 9h20M6 16h20M6 23h20" />
      <circle {...S} cx="12" cy="9" r="3" fill="#4EA8E8" />
      <circle {...S} cx="21" cy="16" r="3" fill="#F6D365" />
      <circle {...S} cx="10" cy="23" r="3" fill="#EA5A5A" />
    </>
  ),
  train: (
    <>
      <path {...S} fill="#4EA8E8" d="M7 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" />
      <rect x="10" y="7" width="12" height="7" rx="1.5" fill="#D9F0FC" stroke={INK} strokeWidth="1.5" />
      <circle cx="11.5" cy="19" r="1.6" fill="#F6D365" />
      <circle cx="20.5" cy="19" r="1.6" fill="#F6D365" />
      <path {...S} d="M9 24l-3 5M23 24l3 5" />
    </>
  ),
  circle: (
    <>
      <circle {...S} cx="16" cy="16" r="10" fill="#fff" />
    </>
  ),
  dotGreen: (<circle {...S} cx="16" cy="16" r="9" fill="#7DBE4B" />),
  dotYellow: (<circle {...S} cx="16" cy="16" r="9" fill="#F6D365" />),
  dotRed: (<circle {...S} cx="16" cy="16" r="9" fill="#EA5A5A" />),
  square: (<rect {...S} x="6" y="6" width="20" height="20" rx="4" fill="#fff" />),
  down: (
    <>
      <path {...S} fill="none" d="M16 4v22" />
      <path {...S} fill="#4EA8E8" d="M8 18l8 10 8-10z" />
    </>
  ),
  up: (
    <>
      <path {...S} fill="none" d="M16 28V6" />
      <path {...S} fill="#7DBE4B" d="M8 14l8-10 8 10z" />
    </>
  ),
  monkey: (
    <>
      <circle {...S} cx="16" cy="16" r="11" fill="#B58C5C" />
      <path {...S} fill="#FFD9A0" d="M8 14a8 7 0 0 1 16 0 8 9 0 0 1-16 0z" />
      <circle {...S} cx="5" cy="15" r="3" fill="#B58C5C" />
      <circle {...S} cx="27" cy="15" r="3" fill="#B58C5C" />
      <path {...S} fill="#FFD9A0" d="M7 17c-2-5 4-7 7-3M25 17c2-5-4-7-7-3" />
      <path {...S} d="M12 21c2 1 6 1 8 0" />
    </>
  ),
  pray: (
    <>
      <path {...S} fill="#FFD9A0" d="M16 3l5 11v9a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4v-9z" />
      <path {...S} fill="none" d="M16 3v24" />
      <path {...S} fill="#F6D365" d="M6 8l2 2M26 8l-2 2M4 14h3M28 14h-3" />
    </>
  ),
  point: (
    <>
      <path {...S} fill="#FFD9A0" d="M4 18h12V9a2 2 0 0 1 4 0v9l6 0a3 3 0 0 1 3 3v3a5 5 0 0 1-5 5H10a6 6 0 0 1-6-6z" />
      <Hi cx={9} cy={22} />
    </>
  ),
  pointRight: (
    <>
      <path {...S} fill="#FFD9A0" d="M4 12h9v6H4zM13 9a2.5 2.5 0 0 1 5 0v3h9a2 2 0 0 1 0 4h-1a2 2 0 0 1 0 4h-1a2 2 0 0 1 0 4h-1a2 2 0 0 1 0 4H15a4 4 0 0 1-2-1z" />
    </>
  ),
  dumpling: (
    <>
      <path {...S} fill="#FFF0C8" d="M4 22a12 8 0 0 1 24 0z" />
      <path {...S} fill="none" d="M8 15c2-3 5-5 8-5s6 2 8 5M12 14l1-3M16 13v-3M20 14l-1-3" />
      <Hi cx={10} cy={19} />
    </>
  ),
  tent: (
    <>
      <path {...S} fill="#7DBE4B" d="M3 26L16 5l13 21z" />
      <path {...S} fill="#5E9A35" d="M16 5v21" />
      <path {...S} fill="#3B4A5C" d="M11 26l5-8 5 8z" />
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

/* Native emoji → Icon name (used by <Emoji> to upgrade common glyphs) */
export const EMOJI_ICON = {
  '✅': 'check', '❌': 'x', '🔊': 'sound', '🔇': 'mute', '🏆': 'trophy', '⭐': 'star', '🌟': 'star', '★': 'star',
  '🎉': 'party', '🎊': 'party', '🥳': 'party', '📚': 'books', '🔥': 'fire', '🎯': 'target', '⚡': 'bolt', '🐮': 'cow', '🐄': 'cow',
  '📖': 'book', '📕': 'redbook', '📗': 'greenbook', '📘': 'bluebook', '📒': 'notebook', '📓': 'notebook', '🐾': 'paw', '💪': 'muscle', '🪙': 'coin', '💡': 'bulb',
  '✨': 'sparkles', '📝': 'note', '🔄': 'refresh', '🔁': 'repeat', '💬': 'chat', '💭': 'chat', '🎁': 'gift', '💯': 'hundred',
  '🎧': 'headphones', '🃏': 'cards', '🎴': 'cards', '👍': 'thumb', '🎤': 'mic', '🎙️': 'mic', '⚔️': 'swords', '🔤': 'abc', '🔡': 'abc', '🔠': 'abc',
  '🐌': 'snail', '🐢': 'turtle', '🏅': 'medal', '🎖️': 'medal', '📊': 'chart', '📈': 'chartup', '📉': 'chartdown', '📅': 'calendar', '🗓️': 'calendar',
  '🔒': 'lock', '🥚': 'egg', '🌱': 'sprout', '🌿': 'leaf', '🍃': 'leaf', '🍀': 'clover', '🌳': 'tree', '🌲': 'tree', '🎄': 'christmas',
  '🚀': 'rocket', '⏱️': 'timer', '⏱': 'timer', '⏰': 'clock', '🕐': 'clock', '⏳': 'hourglass', '⌛': 'hourglass', '🔗': 'link',
  '🎮': 'gamepad', '🕹️': 'gamepad', '🐝': 'bee', '🎓': 'grad', '🧠': 'brain', '🥇': 'gold', '🥈': 'silver', '🥉': 'bronze',
  '🔍': 'search', '🔎': 'search', '📋': 'clipboard', '🆕': 'new', '🏠': 'home', '💼': 'briefcase', '✍️': 'pencil', '✏️': 'pencil', '🖊️': 'pencil',
  '🧩': 'puzzle', '🎲': 'dice', '😊': 'smile', '🙂': 'smile', '😄': 'smile', '😀': 'smile', '🥰': 'love', '😍': 'love', '😎': 'cool', '😢': 'sad', '😿': 'sad', '🥺': 'sad', '😤': 'angry', '😠': 'angry',
  '🤒': 'sick', '😷': 'sick', '🤔': 'think', '📦': 'box', '🗣️': 'speak', '👂': 'ear', '💎': 'gem', '👑': 'crown', '🌐': 'globe', '🌍': 'globe', '🌎': 'globe', '🌏': 'globe',
  '❓': 'question', '❔': 'question', 'ℹ️': 'info', '⚠️': 'warning', '⚠': 'warning', '🏁': 'checkered', '💸': 'money', '💵': 'money', '💰': 'money',
  '⬅️': 'arrowLeft', '➡️': 'arrowRight', '↔': 'arrowsLR', '↔️': 'arrowsLR', '⬆️': 'up', '⬇️': 'down', '➕': 'plus', '📌': 'pin', '📍': 'pin',
  '👥': 'users', '👤': 'user', '🧱': 'bricks', '💥': 'boom', '🤝': 'handshake', '📱': 'phone', '📲': 'phone', '⌨️': 'keyboard',
  '💨': 'wind', '⏸': 'pause', '⏸️': 'pause', '▶': 'play', '▶️': 'play', '🎃': 'pumpkin', '🍎': 'apple', '💤': 'sleep', '🛍️': 'bag', '🛒': 'cart',
  '🎵': 'music', '🎶': 'music', '👁️': 'eye', '👀': 'eyes', '👋': 'wave', '🔔': 'bell', '🔕': 'bellOff', '🗺️': 'map', '🛤️': 'road', '🛣️': 'road',
  '💝': 'gift', '❤️': 'heart', '💖': 'heart', '💕': 'heart', '💗': 'heart', '🧲': 'magnet', '🎚️': 'slider', '🚂': 'train', '🚆': 'train',
  '🏢': 'building', '🏫': 'building', '🏥': 'building', '✈️': 'plane', '🏭': 'factory', '📐': 'ruler', '📏': 'ruler', '🛠️': 'wrench', '🔧': 'wrench',
  '🎭': 'mask', '🎨': 'palette', '💧': 'water', '🪨': 'rock', '⚪': 'circle', '⬜': 'square', '📜': 'scroll', '💾': 'save', '🙈': 'monkey', '🙏': 'pray',
  '🟢': 'dotGreen', '🟡': 'dotYellow', '🔴': 'dotRed', '👆': 'point', '👉': 'pointRight', '🐤': 'chick', '🐣': 'chick', '🐰': 'bunny', '🐱': 'cat', '🐲': 'dragon', '🐉': 'dragon',
  '🪷': 'lotus', '🎩': 'tophat', '👔': 'tie', '🍕': 'pizza', '🍽️': 'plate', '📢': 'megaphone', '🌞': 'sun', '☀️': 'sun', '☁️': 'cloud', '🌙': 'moon',
  '🥟': 'dumpling', '🐟': 'fish', '🐠': 'fish', '📷': 'camera', '📸': 'camera', '📭': 'mail', '📧': 'mail', '✉️': 'mail', '⛺': 'tent',
  '🏋️': 'dumbbell', '🧘': 'lotus', '💻': 'keyboard',
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
