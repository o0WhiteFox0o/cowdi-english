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
import Icon from '../Icon';
import { EmojiText } from '../Emoji';

/* ── Route groups for highlighting the active tab/section ── */
const LEARN_PATHS    = ['/learning-path', '/lessons', '/vocabulary', '/review'];
const PRACTICE_PATHS = ['/practice', '/mini-games', '/duel', '/typing'];
const PET_PATHS      = ['/pet', '/collection', '/shop'];
const ME_PATHS       = ['/progress', '/student-ranking', '/leaderboard', '/account', '/admin'];

/* Desktop nav (grouped like chapters in a notebook). icon = Icon name or 'PET' */
const TAB_GROUPS = [
  { label: null, items: [
    { to: '/', end: true, icon: 'home', label: 'Trang chủ', color: '#7DBE4B' },
  ]},
  { label: 'Học tập', items: [
    { to: '/learning-path', icon: 'road',  label: 'Lộ trình học', color: '#7DBE4B' },
    { to: '/vocabulary',    icon: 'map',   label: 'Từ vựng',    color: '#F4A83A' },
    { to: '/review',        icon: 'brain', label: 'Ôn tập',     color: '#4EA8E8' },
    { to: '/lessons',       icon: 'book',  label: 'Thư viện bài', color: '#5ECFC0' },
  ]},
  { label: 'Luyện tập', items: [
    { to: '/practice',   icon: 'target',  label: 'Bài tập',    color: '#EA5A5A' },
    { to: '/mini-games', icon: 'gamepad', label: 'Mini-games', color: '#F48FB1' },
    { to: '/typing',     icon: 'PET',     label: 'Đánh máy',    color: '#c44f8a' },
    { to: '/duel',       icon: 'swords',  label: 'Đấu trường', color: '#9C7BE0' },
  ]},
  { label: 'Pet', items: [
    { to: '/pet',        icon: 'PET',     label: 'Pet của tôi', color: '#7DBE4B' },
    { to: '/collection', icon: 'redbook', label: 'Cowdi Dex',   color: '#EA5A5A' },
    { to: '/shop',       icon: 'bag',     label: 'Cửa hàng',    color: '#F4A83A' },
  ]},
  { label: 'Sổ tay', items: [
    { to: '/progress',        icon: 'chart',   label: 'Tiến trình', color: '#4EA8E8' },
    { to: '/student-ranking', icon: 'ranking', label: 'Xếp hạng',   color: '#F6D365' },
    { to: '/leaderboard',     icon: 'paw',     label: 'Xếp hạng Pet', color: '#F4A83A' },
    { to: '/account',         icon: 'user',    label: 'Tài khoản',  color: '#8A99AA' },
  ]},
];

/* Mobile popup sub-menus */
const MOBILE_MENUS = {
  learn: [
    { icon: 'road',  label: 'Lộ trình học', path: '/learning-path' },
    { icon: 'map',   label: 'Từ vựng',    path: '/vocabulary' },
    { icon: 'brain', label: 'Ôn tập',     path: '/review' },
    { icon: 'book',  label: 'Thư viện bài', path: '/lessons' },
  ],
  practice: [
    { icon: 'target',  label: 'Bài tập',    path: '/practice' },
    { icon: 'gamepad', label: 'Mini-games', path: '/mini-games' },
    { icon: 'PET',     label: 'Đánh máy',    path: '/typing' },
    { icon: 'swords',  label: 'Đấu trường', path: '/duel' },
    { icon: 'medal',   label: 'Luyện thi IELTS', path: '/learning-path?tab=ielts' },
    { icon: 'flag',    label: 'Luyện thi TOEIC', path: '/learning-path?tab=toeic' },
  ],
  pet: [
    { icon: 'PET',     label: 'Pet của tôi', path: '/pet' },
    { icon: 'redbook', label: 'Cowdi Dex',   path: '/collection' },
    { icon: 'bag',     label: 'Shop',        path: '/shop' },
  ],
  me: [
    { icon: 'gift',    label: 'Mời bạn',      action: 'invite' },
    { icon: 'chart',   label: 'Tiến trình',   path: '/progress' },
    { icon: 'ranking', label: 'Xếp hạng',     path: '/student-ranking' },
    { icon: 'paw',     label: 'Xếp hạng Pet', path: '/leaderboard' },
    { icon: 'user',    label: 'Tài khoản',    path: '/account' },
  ],
};

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
  const nextEvo = species && evo ? species.evolutions[evo.stage + 1] : null;
  const petPct = activePet && evo
    ? (nextEvo ? Math.min(100, Math.round(((activePet.totalXpEarned - evo.xp) / (nextEvo.xp - evo.xp)) * 100)) : 100)
    : 0;
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

  const renderTabIcon = (icon, size = 22) => {
    if (icon === 'PET') return <img src={petImg} alt="" />;
    return <Icon name={icon} size={size} />;
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
          <span className="book-pill" title="Chuỗi ngày học"><Icon name="fire" size={20} />{userData.streak}</span>
          <span className="book-pill" title={`Lv.${level.level} · ${userData.totalXP} XP`}><Icon name="medal" size={20} />Lv{level.level}</span>
          <Link to="/pet" className="book-pill" title={`${petName} · ${petPct}%`}>
            <img src={petImg} alt="" className="book-pill-pet" />
            <span className="book-bar"><i style={{ width: `${petPct}%` }} /></span>
          </Link>
          <button type="button" className="book-sound" onClick={toggleMute}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}>
            <Icon name={muted ? 'mute' : 'sound'} size={18} />
          </button>
          {user ? (
            <NavLink to="/account">
              {avatarUrl
                ? <img src={avatarUrl} className="book-mobile-avatar" alt={displayName} referrerPolicy="no-referrer" />
                : <Icon name="user" size={26} />}
            </NavLink>
          ) : (
            <button type="button" className="book-login-btn btn-sm" onClick={loginWithGoogle} style={{ padding: '3px 10px', fontSize: '.85rem' }}>
              <i className="fab fa-google" />
            </button>
          )}
        </div>
      </header>

      <div className="book">
        <span className="book-corner tl" /><span className="book-corner tr" />
        <span className="book-corner bl" /><span className="book-corner br" />

        {/* ═══════════ Left page — nav (≥ 992px) ═══════════ */}
        <aside className="book-side">
          <Link to="/" className="book-plaque text-decoration-none">
            <img src="/assets/images/logo/MiniLogoCowdi.svg" alt="" />
            <small>Welcome to</small>
            <strong>Cowdi</strong>
            <em>English Notebook</em>
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
                      <NavLink to="/admin" className={({ isActive }) => `book-tab ${isActive ? 'active' : ''}`} style={{ '--tab-color': '#3B4A5C' }}>
                        <span className="book-tab-icon"><Icon name="wrench" size={22} /></span><span>Quản trị</span>
                      </NavLink>
                    </li>
                  )}
                  {group.label === 'Sổ tay' && (
                    <li>
                      <button type="button" className="book-tab" style={{ '--tab-color': '#F6D365' }} onClick={() => setInviteOpen(true)}>
                        <span className="book-tab-icon"><Icon name="gift" size={22} /></span><span>Mời bạn học</span>
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
              <EmojiText>{tip}</EmojiText>
            </div>
          </Link>
        </aside>

        {/* Spiral binding */}
        <div className="book-rings" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => <span key={i} className="book-ring" />)}
        </div>

        {/* ═══════════ Right page — graph paper ═══════════ */}
        <section className="book-page">
          <div className="book-page-top">
            <div className="book-hud">
              <span className="book-pill" title="Chuỗi ngày học liên tiếp">
                <Icon name="fire" size={24} />{userData.streak}
              </span>
              <Link to="/progress" className="book-pill" title={`${level.title} · ${userData.totalXP} XP`}>
                <Icon name="medal" size={24} />Lv{level.level}
              </Link>
              <span className="book-pill" title="Xu">
                <Icon name="coin" size={24} />{petData.coins}
              </span>
              <Link to="/pet" className="book-pill" title={`${petName} · ${evo?.name || ''} · ${petPct}% tới cấp tiếp theo`}>
                <img src={petImg} alt="" className="book-pill-pet" />
                <span className="book-bar"><i style={{ width: `${petPct}%` }} /></span>
              </Link>
              {!user ? (
                <button type="button" className="book-login-btn" onClick={loginWithGoogle}>
                  <i className="fab fa-google me-1" /> Đăng nhập
                </button>
              ) : (
                <Link to="/account" className="book-pill" title={displayName}>
                  {avatarUrl
                    ? <img src={avatarUrl} className="book-pill-avatar" alt={displayName} referrerPolicy="no-referrer" />
                    : <Icon name="user" size={24} />}
                  <span className="d-none d-xl-inline">{displayName}</span>
                </Link>
              )}
              <button type="button" className="book-pill book-polaroid-btn" onClick={toggleMute}
                title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}>
                <Icon name={muted ? 'mute' : 'sound'} size={22} />
              </button>
            </div>
          </div>

          <div className="book-content">{children}</div>
          <div className="book-page-curl" />

          <div className="book-ribbons" aria-hidden="true">
            <Link to="/learning-path" className="book-ribbon teal" title="Lộ trình học" tabIndex={-1}><Icon name="star" size={20} /></Link>
            <Link to="/pet" className="book-ribbon pink" title="Pet của tôi" tabIndex={-1}><Icon name="heart" size={20} /></Link>
            <Link to="/collection" className="book-ribbon yellow" title="Cowdi Dex" tabIndex={-1}><Icon name="redbook" size={20} /></Link>
          </div>
        </section>
      </div>

      {/* ═══════════ Mobile bottom tabs (< 992px) ═══════════ */}
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
                <span className="bottom-popup-icon">{renderTabIcon(item.icon, 26)}</span>
                <span className="bottom-popup-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <NavLink to="/" end className={({ isActive }) => `book-bottom-tab ${isActive ? 'active' : ''}`} onClick={() => setOpenTab(null)}>
          <span className="book-bottom-tab-icon"><Icon name="home" size={28} /></span>
          <span>Home</span>
        </NavLink>
        <button type="button" className={`book-bottom-tab ${isIn(LEARN_PATHS) ? 'active' : ''} ${openTab === 'learn' ? 'open' : ''}`}
          onClick={() => handleTabTap('learn')}>
          <span className="book-bottom-tab-icon"><Icon name="book" size={28} /></span>
          <span>Học</span>
        </button>
        <button type="button" className={`book-bottom-tab ${isIn(PRACTICE_PATHS) ? 'active' : ''} ${openTab === 'practice' ? 'open' : ''}`}
          onClick={() => handleTabTap('practice')}>
          <span className="book-bottom-tab-icon"><Icon name="dumbbell" size={28} /></span>
          <span>Luyện</span>
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
              : <Icon name="user" size={28} />}
          </span>
          <span>Tôi</span>
        </button>
      </nav>

      {/* Floating invite button (mobile, logged in) */}
      {user && (
        <button type="button" onClick={() => setInviteOpen(true)} className="d-lg-none cowdi-invite-fab"
          aria-label="Mời bạn học cùng" title="Mời bạn học cùng">
          <Icon name="gift" size={28} />
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
