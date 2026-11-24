import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import { useSound } from '../../hooks/useSound';
import { LEVELS } from '../../data/config/levels';
import { PET_REGISTRY, getEvolutionInfo } from '../../data/pets';
import { COWDI_MESSAGES } from '../../data/config/messages';
import InviteSheet from '../../features/invite/InviteSheet';
import Icon from '../Icon';
import { EmojiText } from '../Emoji';

/* ── Route groups for highlighting the active tab/section ── */
const LEARN_PATHS    = ['/', '/learning-path', '/placement', '/lessons', '/vocabulary'];
const PRACTICE_PATHS = ['/practice', '/review', '/mini-games', '/duel', '/typing'];
const PET_PATHS      = ['/pet', '/collection', '/shop'];
const ME_PATHS       = ['/overview', '/progress', '/student-ranking', '/leaderboard', '/account', '/admin'];

/* Desktop nav — chỉ giữ mục dùng thường xuyên; mục ít dùng chuyển vào popup "Thêm" */
const TAB_GROUPS = [
  { label: null, items: [
    { to: '/', end: true, icon: 'road', label: 'Lộ trình học', color: '#7DBE4B' },
  ]},
  { label: 'Học & Luyện', items: [
    { to: '/practice',      icon: 'target',  label: 'Ôn tập & Bài tập', color: '#EA5A5A' },
    { to: '/vocabulary',    icon: 'map',     label: 'Từ vựng',         color: '#F4A83A' },
    { to: '/mini-games',    icon: 'gamepad', label: 'Đấu trường game', color: '#F48FB1' },
  ]},
  { label: 'Pet & Cửa hàng', items: [
    { to: '/pet',        icon: 'PET',     label: 'Pet của tôi', color: '#7DBE4B' },
    { to: '/collection', icon: 'redbook', label: 'Cowdi Dex',   color: '#EA5A5A' },
    { to: '/shop',       icon: 'bag',     label: 'Cửa hàng',    color: '#F4A83A' },
  ]},
];

/* Desktop secondary links — gom vào popup gọn để không phải cuộn sidebar */
const DESKTOP_MORE_ITEMS = [
  { to: '/overview',        icon: 'home',    label: 'Sổ tay cá nhân', color: '#4EA8E8' },
  { to: '/progress',        icon: 'chart',   label: 'Tiến trình học', color: '#5ECFC0' },
  { to: '/student-ranking', icon: 'ranking', label: 'Bảng xếp hạng',  color: '#F6D365' },
  { to: '/duel',            icon: 'swords',  label: 'Đấu bạn bè',     color: '#EA5A5A' },
  { to: '/review',          icon: 'brain',   label: 'Ôn nhanh SRS',   color: '#7DBE4B' },
  { to: '/account',         icon: 'user',    label: 'Tài khoản',      color: '#8A99AA' },
];

/* Mobile popup sub-menus (SDD §5.5: gom 2 mục Luyện thi IELTS/TOEIC thành 1 mục Luyện thi) */
const buildMobileMenus = (activePath) => {
  const examTab = ['ielts', 'toeic', 'b1', 'b2'].includes(activePath) ? activePath : 'ielts';
  return {
    learn: [
      { icon: 'road',    label: 'Lộ trình học',    path: '/' },
      { icon: 'target',  label: 'Ôn tập & Bài tập', path: '/practice' },
      { icon: 'map',     label: 'Từ vựng',         path: '/vocabulary' },
      { icon: 'book',    label: 'Thư viện bài',    path: '/lessons' },
      { icon: 'medal',   label: 'Luyện thi',       path: `/?tab=${examTab}` },
    ],
    practice: [
      { icon: 'gamepad', label: 'Đấu trường game', path: '/mini-games' },
      { icon: 'PET',     label: 'Đánh máy',        path: '/typing' },
      { icon: 'swords',  label: 'Đấu bạn bè',      path: '/duel' },
      { icon: 'brain',   label: 'Ôn nhanh',        path: '/review' },
    ],
    pet: [
      { icon: 'PET',     label: 'Pet của tôi', path: '/pet' },
      { icon: 'redbook', label: 'Cowdi Dex',   path: '/collection' },
      { icon: 'bag',     label: 'Shop vật phẩm', path: '/shop' },
    ],
    me: [
      { icon: 'home',    label: 'Sổ tay cá nhân', path: '/overview' },
      { icon: 'chart',   label: 'Tiến trình',     path: '/progress' },
      { icon: 'ranking', label: 'Bảng xếp hạng',  path: '/student-ranking' },
      { icon: 'gift',    label: 'Mời bạn học',    action: 'invite' },
      { icon: 'user',    label: 'Tài khoản',      path: '/account' },
    ],
  };
};

function formatCompact(num) {
  const val = Number(num || 0);
  if (val >= 1000) {
    const k = (val / 1000).toFixed(1).replace('.', ',');
    return k.endsWith(',0') ? k.slice(0, -2) + 'k' : k + 'k';
  }
  return String(val);
}

export default function BookShell({ children }) {
  const { userData } = useUser();
  const { user, isAdmin, loginWithGoogle } = useAuth();
  const { petData, getActivePetWithDecay } = usePet();
  const { muted, toggleMute } = useSound();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mobileMenus = useMemo(() => buildMobileMenus(userData.activePath), [userData.activePath]);

  const rawWallet = userData.wallet || {};
  const wallet = {
    milk: Number(rawWallet.milk ?? userData.availableXP ?? 0) || 0,
    gem: Number(rawWallet.gem ?? 0) || 0,
    stone: Number(rawWallet.stone ?? 0) || 0,
    stone_shard: Number(rawWallet.stone_shard ?? 0) || 0,
  };
  const prevMilkRef = useRef(wallet.milk);
  const prevGemRef = useRef(wallet.gem);
  const [milkDelta, setMilkDelta] = useState(null);
  const [gemDelta, setGemDelta] = useState(null);

  useEffect(() => {
    if (prevMilkRef.current !== undefined && wallet.milk > prevMilkRef.current) {
      setMilkDelta(wallet.milk - prevMilkRef.current);
      const t = setTimeout(() => setMilkDelta(null), 1800);
      return () => clearTimeout(t);
    }
    prevMilkRef.current = wallet.milk;
  }, [wallet.milk]);

  useEffect(() => {
    if (prevGemRef.current !== undefined && wallet.gem > prevGemRef.current) {
      setGemDelta(wallet.gem - prevGemRef.current);
      const t = setTimeout(() => setGemDelta(null), 1800);
      return () => clearTimeout(t);
    }
    prevGemRef.current = wallet.gem;
  }, [wallet.gem]);

  const level = getUserLevel(userData.totalXP);
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getEvolutionInfo(activePet.speciesId, activePet.evolution) : null;
  const nextEvo = species && evo ? species.evolutions[evo.stage + 1] : null;
  // v2: thanh này thể hiện cấp C1→C5 (không còn tiến độ theo XP). Phase 4 có thể đổi
  // sang tiến độ điều kiện tiến hoá (canEvolve).
  const lastStage = species ? species.evolutions.length - 1 : 0;
  const petPct = activePet && evo
    ? (nextEvo && lastStage > 0 ? Math.round((evo.stage / lastStage) * 100) : 100)
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

  /* ── Mobile & Desktop popup menu state ── */
  const [openTab, setOpenTab] = useState(null);
  const [desktopPopup, setDesktopPopup] = useState(null); // null | 'more' | 'tip'
  const [inviteOpen, setInviteOpen] = useState(false);
  const popupRef = useRef(null);
  const desktopFooterRef = useRef(null);

  useEffect(() => { setOpenTab(null); setDesktopPopup(null); }, [pathname]);

  useEffect(() => {
    if (!openTab && !desktopPopup) return;
    const handler = (e) => {
      if (openTab && popupRef.current && !popupRef.current.contains(e.target)) setOpenTab(null);
      if (desktopPopup && desktopFooterRef.current && !desktopFooterRef.current.contains(e.target)) setDesktopPopup(null);
    };
    const keyHandler = (e) => {
      if (e.key === 'Escape') { setOpenTab(null); setDesktopPopup(null); }
    };
    document.addEventListener('pointerdown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('pointerdown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [openTab, desktopPopup]);

  const handleTabTap = useCallback((key) => {
    setOpenTab((cur) => (cur === key ? null : key));
  }, []);

  const goTo = useCallback((path) => {
    setOpenTab(null);
    navigate(path);
  }, [navigate]);

  const renderTabIcon = (icon, size = 22) => {
    if (icon === 'PET') return <img src={petImg} alt="" style={{ width: size, height: size, objectFit: 'contain', borderRadius: '50%' }} />;
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
          <span className="book-pill book-mobile-lvl" title={`Lv.${level.level} · ${userData.totalXP} XP`}><Icon name="medal" size={20} />Lv{level.level}</span>
          <Link to="/shop?help=earn" className={`book-pill position-relative ${milkDelta ? 'pulse-pop' : ''}`} title={`Sữa: ${wallet.milk} · Bấm để xem cách kiếm`}>
            <span>🥛</span>{formatCompact(wallet.milk)}
            {milkDelta && <span className="resource-float-delta text-primary">+{milkDelta}</span>}
          </Link>
          <Link to="/shop?help=earn" className={`book-pill position-relative ${gemDelta ? 'pulse-pop' : ''}`} title={`Gem: ${wallet.gem} · Bấm để xem cách kiếm`}>
            <span>💎</span>{formatCompact(wallet.gem)}
            {gemDelta && <span className="resource-float-delta text-info">+{gemDelta}</span>}
          </Link>
          <Link to="/pet" className="book-pill book-mobile-pet-pill" title={`${petName} · ${petPct}%`}>
            <img src={petImg} alt="" className="book-pill-pet" />
            <span className="book-bar"><i style={{ width: `${petPct}%` }} /></span>
          </Link>
          <button type="button" className="book-sound" onClick={toggleMute}
            aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}>
            <Icon name={muted ? 'mute' : 'sound'} size={18} />
          </button>
          {user ? (
            <NavLink to="/account" aria-label={`Tài khoản ${displayName}`}>
              {avatarUrl
                ? <img src={avatarUrl} className="book-mobile-avatar" alt={displayName} referrerPolicy="no-referrer" />
                : <Icon name="user" size={26} />}
            </NavLink>
          ) : (
            <button type="button" className="book-login-btn btn-sm" onClick={loginWithGoogle} aria-label="Đăng nhập với Google" style={{ padding: '3px 10px', fontSize: '.85rem' }}>
              <i className="fab fa-google" aria-hidden="true" />
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
            <span className="book-plaque-text">
              <strong>Cowdi</strong>
              <em>English Notebook</em>
            </span>
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
                        <span className="book-tab-icon">{renderTabIcon(item.icon, 20)}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Chức năng ít dùng & Lời nhắn Pet gom vào popup gọn */}
          <div className="book-side-footer" ref={desktopFooterRef}>
            {desktopPopup === 'more' && (
              <div className="book-side-popup" role="dialog" aria-label="Tiện ích mở rộng">
                <div className="book-side-popup-head">
                  <span>Tiện ích &amp; Hồ sơ</span>
                  <button type="button" className="btn btn-sm p-0 border-0 text-muted" onClick={() => setDesktopPopup(null)} aria-label="Đóng">✕</button>
                </div>
                {DESKTOP_MORE_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `book-tab ${isActive ? 'active' : ''}`}
                    style={{ '--tab-color': item.color }}
                    onClick={() => setDesktopPopup(null)}
                  >
                    <span className="book-tab-icon">{renderTabIcon(item.icon, 18)}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                <button
                  type="button"
                  className="book-tab"
                  style={{ '--tab-color': '#F6D365' }}
                  onClick={() => { setDesktopPopup(null); setInviteOpen(true); }}
                >
                  <span className="book-tab-icon"><Icon name="gift" size={18} /></span>
                  <span>Mời bạn học</span>
                </button>
                {isAdmin && (
                  <>
                    <div className="book-tab-group mt-1">Quản trị</div>
                    <NavLink to="/lessons" className={({ isActive }) => `book-tab ${isActive ? 'active' : ''}`} style={{ '--tab-color': '#5ECFC0' }} onClick={() => setDesktopPopup(null)}>
                      <span className="book-tab-icon"><Icon name="book" size={18} /></span><span>Thư viện bài</span>
                    </NavLink>
                    <NavLink to="/admin" end className={({ isActive }) => `book-tab ${isActive ? 'active' : ''}`} style={{ '--tab-color': '#3B4A5C' }} onClick={() => setDesktopPopup(null)}>
                      <span className="book-tab-icon"><Icon name="wrench" size={18} /></span><span>Quản trị hệ thống</span>
                    </NavLink>
                    <NavLink to="/admin/pet-motion" className={({ isActive }) => `book-tab ${isActive ? 'active' : ''}`} style={{ '--tab-color': '#2F9E4F' }} onClick={() => setDesktopPopup(null)}>
                      <span className="book-tab-icon">{renderTabIcon('PET', 18)}</span><span>Quản lý Pet</span>
                    </NavLink>
                  </>
                )}
              </div>
            )}

            {desktopPopup === 'tip' && (
              <div className="book-side-popup" role="dialog" aria-label={`Lời nhắn của ${petName}`}>
                <div className="book-side-popup-head">
                  <span>{petName} nhắn hôm nay</span>
                  <button type="button" className="btn btn-sm p-0 border-0 text-muted" onClick={() => setDesktopPopup(null)} aria-label="Đóng">✕</button>
                </div>
                <div className="p-2 text-center">
                  <img src={petImg} alt={petName} style={{ width: 72, height: 72, objectFit: 'contain' }} />
                  <p className="small mb-2 mt-1"><EmojiText>{tip}</EmojiText></p>
                  <Link to="/pet" className="btn btn-sm btn-cowdi-primary w-100" onClick={() => setDesktopPopup(null)}>
                    Thăm {petName}
                  </Link>
                </div>
              </div>
            )}

            <button
              type="button"
              className={`book-tab ${desktopPopup === 'more' || isIn(ME_PATHS) ? 'active' : ''}`}
              style={{ '--tab-color': '#4EA8E8' }}
              aria-expanded={desktopPopup === 'more'}
              onClick={() => setDesktopPopup((v) => (v === 'more' ? null : 'more'))}
            >
              <span className="book-tab-icon"><Icon name="home" size={19} /></span>
              <span>Thêm &amp; Hồ sơ ⋯</span>
            </button>

            <button
              type="button"
              className="book-mascot-mini"
              aria-expanded={desktopPopup === 'tip'}
              onClick={() => setDesktopPopup((v) => (v === 'tip' ? null : 'tip'))}
              title={`Xem lời nhắn của ${petName}`}
            >
              <img src={petImg} alt={petName} />
              <span><b>{petName}:</b> Lời nhắn hôm nay</span>
            </button>
          </div>
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
              <Link
                to="/shop?help=earn"
                className={`book-pill book-hud-resource position-relative ${milkDelta ? 'pulse-pop' : ''}`}
                title={`Sữa: ${wallet.milk.toLocaleString('vi-VN')} · Bấm để xem cách kiếm`}
              >
                <span>🥛</span><span>{formatCompact(wallet.milk)}</span>
                {milkDelta && (
                  <span className="resource-float-delta text-primary">+{milkDelta}</span>
                )}
              </Link>
              <Link
                to="/shop?help=earn"
                className={`book-pill book-hud-resource position-relative ${gemDelta ? 'pulse-pop' : ''}`}
                title={`Gem: ${wallet.gem.toLocaleString('vi-VN')} · Bấm để xem cách kiếm`}
              >
                <span>💎</span><span>{formatCompact(wallet.gem)}</span>
                {gemDelta && (
                  <span className="resource-float-delta text-info">+{gemDelta}</span>
                )}
              </Link>
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
        {openTab && mobileMenus[openTab] && (
          <div className="bottom-popup-menu">
            {[
              ...mobileMenus[openTab].filter((item) => item.path !== '/lessons' || isAdmin),
              ...(openTab === 'me' && isAdmin
                ? [
                    { icon: 'wrench', label: 'Quản trị', path: '/admin' },
                    { icon: 'PET', label: 'Quản lý Pet', path: '/admin/pet-motion' },
                  ]
                : []),
            ].map((item) => (
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
          <span className="book-bottom-tab-icon"><Icon name="road" size={28} /></span>
          <span>Lộ trình</span>
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
