import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import { useSound } from '../../hooks/useSound';
import { LEVELS } from '../../data/config/levels';
import { PET_REGISTRY, getPetEvolution } from '../../data/pets';
import { COWDI_MESSAGES } from '../../data/config/messages';
import InviteSheet from '../../features/invite/InviteSheet';

/* ── Route groups for highlighting the active tab/section ── */
const LEARN_PATHS    = ['/lessons', '/vocabulary', '/review'];
const EXAM_PATHS_NAV = ['/learning-path'];
const PRACTICE_PATHS = ['/practice', '/mini-games', '/duel'];
const PET_PATHS      = ['/pet', '/collection', '/shop'];
const ME_PATHS       = ['/progress', '/student-ranking', '/leaderboard', '/account', '/admin'];

const ICONS = {
  home:   '/assets/images/Icons/icon_home.svg',
  learn:  '/assets/images/Icons/icon_learn.svg',
  exam:   '/assets/images/Icons/icon_exam.svg',
  lesson: '/assets/images/Icons/icon_lesson.svg',
};

/* Desktop bookmark tabs (grouped like chapters in a book) */
const TAB_GROUPS = [
  { label: null, items: [
    { to: '/', end: true, icon: <img src={ICONS.home} alt="" />, label: 'Trang chủ', color: '#5C7A3F' },
  ]},
  { label: 'Học tập', items: [
    { to: '/lessons',    icon: '📖', label: 'Bài học',    color: '#5C7A3F' },
    { to: '/vocabulary', icon: '🗺️', label: 'Từ vựng',    color: '#D9A93C' },
    { to: '/review',     icon: '🧠', label: 'Ôn tập',     color: '#6F9DB5' },
    { to: '/practice',   icon: '🎯', label: 'Bài tập',    color: '#C97B4A' },
    { to: '/mini-games', icon: '🎮', label: 'Mini-games', color: '#8C6644' },
    { to: '/duel',       icon: '⚔️', label: 'Đấu trường', color: '#B5533C' },
    { to: '/learning-path', icon: <img src={ICONS.exam} alt="" />, label: 'Khóa thi', color: '#4F6B3A' },
  ]},
  { label: 'Pet', items: [
    { to: '/pet',        icon: 'PET', label: 'Pet của tôi', color: '#5C7A3F' },
    { to: '/collection', icon: '📦', label: 'Bộ sưu tập',  color: '#D9A93C' },
    { to: '/shop',       icon: '🛍️', label: 'Cửa hàng',    color: '#C97B4A' },
  ]},
  { label: 'Sổ tay', items: [
    { to: '/progress',        icon: '📊', label: 'Tiến trình', color: '#6F9DB5' },
    { to: '/student-ranking', icon: '🏆', label: 'Xếp hạng',   color: '#D9A93C' },
    { to: '/leaderboard',     icon: '🏅', label: 'Xếp hạng Pet', color: '#C97B4A' },
    { to: '/account',         icon: '👤', label: 'Tài khoản',  color: '#8C6644' },
  ]},
];

/* Mobile popup sub-menus */
const MOBILE_MENUS = {
  learn: [
    { icon: '📖', label: 'Bài học',    path: '/lessons' },
    { icon: '🗺️', label: 'Từ vựng',    path: '/vocabulary' },
    { icon: '🧠', label: 'Ôn tập',     path: '/review' },
    { icon: '🎯', label: 'Bài tập',    path: '/practice' },
    { icon: '🎮', label: 'Mini-games', path: '/mini-games' },
    { icon: '⚔️', label: 'Đấu trường', path: '/duel' },
  ],
  exam: [
    { icon: '🛤️', label: 'Lộ trình',       path: '/learning-path' },
    { icon: '🎯', label: 'IELTS',          path: '/learning-path?tab=ielts' },
    { icon: '🌍', label: 'B1 Preliminary', path: '/learning-path?tab=b1' },
    { icon: '📘', label: 'B2 First',       path: '/learning-path?tab=b2' },
    { icon: '🏢', label: 'TOEIC',          path: '/learning-path?tab=toeic' },
  ],
  pet: [
    { icon: '🐮', label: 'Pet của tôi', path: '/pet' },
    { icon: '📦', label: 'Bộ sưu tập', path: '/collection' },
    { icon: '🛍️', label: 'Shop',       path: '/shop' },
  ],
  me: [
    { icon: '🎁', label: 'Mời bạn',      action: 'invite' },
    { icon: '📊', label: 'Tiến trình',   path: '/progress' },
    { icon: '🏆', label: 'Xếp hạng',     path: '/student-ranking' },
    { icon: '🏅', label: 'Xếp hạng Pet', path: '/leaderboard' },
    { icon: '👤', label: 'Tài khoản',    path: '/account' },
  ],
};

const VI_DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

function seasonOf(month) {
  if (month >= 2 && month <= 4) return '🌸 Mùa xuân';
  if (month >= 5 && month <= 7) return '☀️ Mùa hè';
  if (month >= 8 && month <= 10) return '🍂 Mùa thu';
  return '❄️ Mùa đông';
}

export default function BookShell({ children }) {
  const { userData } = useUser();
  const { user, loginWithGoogle } = useAuth();
  const { petData, getActivePetWithDecay } = usePet();
  const { muted, toggleMute } = useSound();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const level = getUserLevel(userData.totalXP);
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;
  const petImg = evo?.image || '/assets/images/logo/MiniLogoCowdi.svg';
  const petName = activePet?.customName || species?.name || 'Cowdi';

  const avatarUrl = user?.avatar_url;
  const displayName = user?.display_name || 'Khách';

  const isIn = (paths) => paths.some((p) => pathname === p || pathname.startsWith(p + '/'));

  /* Daily tip — stable for the day */
  const tip = useMemo(() => {
    const seed = new Date().getDate();
    return COWDI_MESSAGES[seed % COWDI_MESSAGES.length];
  }, []);

  const now = new Date();
  const dateLabel = `${now.getDate()} thg ${now.getMonth() + 1}, ${now.getFullYear()}`;

  /* ── Mobile popup sub-menu state ── */
  const [openTab, setOpenTab] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => { setOpenTab(null); }, [pathname]);

  useEffect(() => {
    if (!openTab) return;
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpenTab(null);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [openTab]);

  const handleTabTap = useCallback((key) => {
    setOpenTab((cur) => (cur === key ? null : key));
  }, []);

  const goTo = useCallback((path) => {
    setOpenTab(null);
    navigate(path);
  }, [navigate]);

  const renderTabIcon = (icon) => {
    if (icon === 'PET') return <img src={petImg} alt="" />;
    return icon;
  };

  return (
    <div className="book-shell">
      {/* ═══════════ Mobile top bar (< 992px) ═══════════ */}
      <header className="book-mobile-top">
        <Link to="/" className="book-mobile-brand">
          <img src="/assets/images/logo/MiniLogoCowdi.svg" alt="" />
          <span>Cowdi</span>
        </Link>
        <div className="book-mobile-stats">
          <span className="badge bg-warning">⭐{userData.totalXP}</span>
          <span className="badge bg-danger">🔥{userData.streak}</span>
          <span className="badge bg-success">🪙{petData.coins}</span>
          <button type="button" className="book-sound" onClick={toggleMute}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'} style={{ opacity: muted ? 0.5 : 1 }}>
            {muted ? '🔇' : '🔊'}
          </button>
          {user ? (
            <NavLink to="/account">
              {avatarUrl
                ? <img src={avatarUrl} className="book-mobile-avatar" alt={displayName} referrerPolicy="no-referrer" />
                : <span className="badge bg-secondary rounded-circle p-1">👤</span>}
            </NavLink>
          ) : (
            <button type="button" className="book-login-btn btn-sm" onClick={loginWithGoogle} style={{ padding: '3px 10px', fontSize: '.85rem' }}>
              <i className="fab fa-google" />
            </button>
          )}
        </div>
      </header>

      <div className="book">
        {/* ═══════════ Left cover — sidebar (≥ 992px) ═══════════ */}
        <aside className="book-side">
          <Link to="/" className="book-plaque text-decoration-none">
            <img src="/assets/images/logo/MiniLogoCowdi.svg" alt="" />
            <small>Welcome to</small>
            <strong>Cowdi</strong>
            <em>English Journal</em>
          </Link>

          <nav aria-label="Điều hướng chính">
            {TAB_GROUPS.map((group, gi) => (
              <div key={gi}>
                {group.label && <div className="book-tab-group">{group.label}</div>}
                <ul className="book-tabs">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => `book-tab ${isActive ? 'active' : ''}`}
                        style={{ '--tab-color': item.color }}
                      >
                        <span className="book-tab-icon">{renderTabIcon(item.icon)}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                  {group.label === 'Sổ tay' && user?.is_admin && (
                    <li>
                      <NavLink to="/admin" className={({ isActive }) => `book-tab ${isActive ? 'active' : ''}`} style={{ '--tab-color': '#3E2A1D' }}>
                        <span className="book-tab-icon">🛠️</span><span>Quản trị</span>
                      </NavLink>
                    </li>
                  )}
                  {group.label === 'Sổ tay' && (
                    <li>
                      <button type="button" className="book-tab" style={{ '--tab-color': '#D9A93C' }} onClick={() => setInviteOpen(true)}>
                        <span className="book-tab-icon">🎁</span><span>Mời bạn học</span>
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>

          <Link to="/pet" className="book-mascot text-decoration-none">
            <img src={petImg} alt={petName} />
            <div className="book-note">
              <b>{petName} nhắn:</b>
              {tip}
            </div>
          </Link>
        </aside>

        {/* ═══════════ Right page — paper ═══════════ */}
        <section className="book-page">
          <div className="book-page-top">
            <div className="book-polaroid">
              <div className="book-polaroid-lines">
                <span>📅 {dateLabel}</span>
                <span>{seasonOf(now.getMonth() + 1)} · {VI_DAYS[now.getDay()]}</span>
                <span>⭐ {userData.totalXP} XP · 🔥 {userData.streak} · 🪙 {petData.coins}</span>
                {!user ? (
                  <button type="button" className="book-login-btn mt-1" onClick={loginWithGoogle}>
                    <i className="fab fa-google me-1" /> Đăng nhập
                  </button>
                ) : (
                  <span className="text-muted">Lv.{level.level} · {displayName}</span>
                )}
              </div>
              {user ? (
                <Link to="/account" title="Tài khoản">
                  {avatarUrl
                    ? <img src={avatarUrl} className="book-polaroid-avatar" alt={displayName} referrerPolicy="no-referrer" />
                    : <span className="book-polaroid-avatar">👤</span>}
                </Link>
              ) : (
                <span className="book-polaroid-avatar">👤</span>
              )}
              <button type="button" className="book-polaroid-btn ms-1" onClick={toggleMute}
                title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'} style={{ opacity: muted ? 0.5 : 1, fontSize: '1.1rem' }}>
                {muted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>

          <div className="book-content">{children}</div>
          <div className="book-page-curl" />
        </section>
      </div>

      {/* ═══════════ Mobile bottom bookmarks (< 992px) ═══════════ */}
      <nav className="book-bottom-nav" aria-label="Điều hướng di động" ref={popupRef}>
        {openTab && MOBILE_MENUS[openTab] && (
          <div className="bottom-popup-menu">
            {MOBILE_MENUS[openTab].map((item) => (
              <button
                key={item.path || item.action}
                type="button"
                className={`bottom-popup-item ${item.path && pathname === item.path ? 'active' : ''}`}
                onClick={() => {
                  if (item.action === 'invite') { setOpenTab(null); setInviteOpen(true); }
                  else goTo(item.path);
                }}
              >
                <span className="bottom-popup-icon">{item.icon}</span>
                <span className="bottom-popup-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <NavLink to="/" end className={({ isActive }) => `book-bottom-tab ${isActive ? 'active' : ''}`} onClick={() => setOpenTab(null)}>
          <span className="book-bottom-tab-icon"><img src={ICONS.home} alt="" /></span>
          <span>Home</span>
        </NavLink>
        <button type="button" className={`book-bottom-tab ${isIn(LEARN_PATHS) || isIn(PRACTICE_PATHS) ? 'active' : ''} ${openTab === 'learn' ? 'open' : ''}`}
          onClick={() => handleTabTap('learn')}>
          <span className="book-bottom-tab-icon"><img src={ICONS.learn} alt="" /></span>
          <span>Học</span>
        </button>
        <button type="button" className={`book-bottom-tab ${isIn(EXAM_PATHS_NAV) ? 'active' : ''} ${openTab === 'exam' ? 'open' : ''}`}
          onClick={() => handleTabTap('exam')}>
          <span className="book-bottom-tab-icon"><img src={ICONS.exam} alt="" /></span>
          <span>Thi</span>
        </button>
        <button type="button" className={`book-bottom-tab ${isIn(PET_PATHS) ? 'active' : ''} ${openTab === 'pet' ? 'open' : ''}`}
          onClick={() => handleTabTap('pet')}>
          <span className="book-bottom-tab-icon"><img src={petImg} alt="" /></span>
          <span>Pet</span>
        </button>
        <button type="button" className={`book-bottom-tab ${isIn(ME_PATHS) ? 'active' : ''} ${openTab === 'me' ? 'open' : ''}`}
          onClick={() => handleTabTap('me')}>
          <span className="book-bottom-tab-icon">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="rounded-circle" referrerPolicy="no-referrer" />
              : '👤'}
          </span>
          <span>Tôi</span>
        </button>
      </nav>

      {/* 🎁 Floating invite button (mobile, logged in) */}
      {user && (
        <button type="button" onClick={() => setInviteOpen(true)} className="d-lg-none cowdi-invite-fab"
          aria-label="Mời bạn học cùng" title="Mời bạn học cùng">
          🎁
        </button>
      )}

      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

function getUserLevel(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  return current;
}
