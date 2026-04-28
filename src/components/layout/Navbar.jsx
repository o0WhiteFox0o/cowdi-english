import { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import { useSound } from '../../hooks/useSound';
import { LEVELS } from '../../data/config/levels';
import { PET_REGISTRY, getPetEvolution } from '../../data/pets';

/* Route groups for highlighting active nav section */
const LEARN_PATHS    = ['/lessons', '/vocabulary', '/review'];
const EXAM_PATHS_NAV = ['/learning-path'];
const PRACTICE_PATHS = ['/practice', '/mini-games', '/duel'];
const PET_PATHS      = ['/pet', '/collection', '/shop'];
const ME_PATHS       = ['/progress', '/student-ranking', '/leaderboard', '/account'];

export default function Navbar() {
  const { userData } = useUser();
  const { user, loginWithGoogle } = useAuth();
  const { petData, getActivePetWithDecay } = usePet();
  const { muted, toggleMute } = useSound();
  const level = getUserLevel(userData.totalXP);
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isIn = (paths) => paths.some(p => pathname === p || pathname.startsWith(p + '/'));

  const petEmoji = evo?.emoji || '🐮';

  /* ── User avatar helper ── */
  const avatarUrl = user?.avatar_url;
  const displayName = user?.display_name || 'Tôi';

  /* ── Đã học hôm nay chưa? (dùng cho nút nhắc nhở học tập) ── */
  const today = new Date().toDateString();
  const hasStudiedToday = userData?.dailyDate === today && (userData?.dailyXP || 0) > 0;

  /* ── Mobile popup sub-menu state ── */
  const [openTab, setOpenTab] = useState(null);
  const popupRef = useRef(null);

  // Close popup when route changes
  useEffect(() => { setOpenTab(null); }, [pathname]);

  // Close popup when tapping outside
  useEffect(() => {
    if (!openTab) return;
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpenTab(null);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [openTab]);

  const handleTabTap = useCallback((key, defaultPath) => {
    if (openTab === key) { setOpenTab(null); return; }
    setOpenTab(key);
  }, [openTab]);

  const goTo = useCallback((path) => {
    setOpenTab(null);
    navigate(path);
  }, [navigate]);

  /* Sub-menu definitions */
  const MOBILE_MENUS = {
    learn:    { items: [
      { icon: '📖', label: 'Bài học',    path: '/lessons' },
      { icon: '🗺️', label: 'Từ vựng',    path: '/vocabulary' },
      { icon: '🧠', label: 'Ôn tập',     path: '/review' },
      { icon: '🎯', label: 'Bài tập',    path: '/practice' },
      { icon: '🎮', label: 'Mini-games', path: '/mini-games' },
      { icon: '⚔️', label: 'Đấu trường', path: '/duel' },
    ]},
    exam:     { items: [
      { icon: '🛤️', label: 'Lộ trình',       path: '/learning-path' },
      { icon: '🎯', label: 'IELTS',          path: '/learning-path?tab=ielts' },
      { icon: '🌍', label: 'B1 Preliminary', path: '/learning-path?tab=b1' },
      { icon: '📘', label: 'B2 First',       path: '/learning-path?tab=b2' },
      { icon: '🏢', label: 'TOEIC',          path: '/learning-path?tab=toeic' },
    ]},
    pet:      { items: [
      { icon: '🐮', label: 'Pet của tôi', path: '/pet' },
      { icon: '📦', label: 'Bộ sưu tập', path: '/collection' },
      { icon: '🛍️', label: 'Shop',       path: '/shop' },
    ]},
    me:       { items: [
      { icon: '📊', label: 'Tiến trình',      path: '/progress' },
      { icon: '🏆', label: 'Xếp hạng',        path: '/student-ranking' },
      { icon: '🏅', label: 'Xếp hạng Pet',    path: '/leaderboard' },
      { icon: '👤', label: 'Tài khoản',       path: '/account' },
    ]},
  };

  return (
    <>
      {/* ═══════════ Top Bar ═══════════ */}
      <nav className="navbar navbar-expand-lg bg-white fixed-top shadow-sm border-bottom" style={{ zIndex: 1040 }}>
        <div className="container d-flex align-items-center gap-2">

          {/* Brand */}
          <NavLink className="navbar-brand d-flex align-items-center mb-0 me-1 flex-shrink-0" to="/">
            <img src="/assets/images/logo/Logo_Cowdi.svg" alt="Cowdi" height="32" style={{ maxWidth: 120 }} />
          </NavLink>

          {/* ── Desktop nav (≥ 992 px) ── */}
          <ul className="navbar-nav flex-row d-none d-lg-flex me-auto gap-1" style={{ minWidth: 0 }}>
            <li className="nav-item">
              <NavLink to="/" end className={({ isActive }) => `nav-link px-3 fw-semibold d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}>
                <img src="/assets/images/Icons/icon_home.webp" alt="" width="18" height="18" /> Home
              </NavLink>
            </li>

            {/* Học tập */}
            <li className="nav-item dropdown">
              <a className={`nav-link dropdown-toggle px-3 fw-semibold d-flex align-items-center gap-1 ${isIn(LEARN_PATHS) ? 'active' : ''}`}
                href="#" role="button">
                <img src="/assets/images/Icons/icon_learn.webp" alt="" width="18" height="18" /> Học tập
              </a>
              <ul className="dropdown-menu cowdi-dropdown-menu">
                <li><NavLink className="dropdown-item" to="/lessons">📖 Bài học</NavLink></li>
                <li><NavLink className="dropdown-item" to="/vocabulary">🗺️ Từ vựng</NavLink></li>
                <li><NavLink className="dropdown-item" to="/review">🧠 Ôn tập</NavLink></li>
              </ul>
            </li>

            {/* Khóa thi */}
            <li className="nav-item dropdown">
              <a className={`nav-link dropdown-toggle px-3 fw-semibold d-flex align-items-center gap-1 ${isIn(EXAM_PATHS_NAV) ? 'active' : ''}`}
                href="#" role="button">
                <img src="/assets/images/Icons/icon_exam.webp" alt="" width="18" height="18" /> Khóa thi
              </a>
              <ul className="dropdown-menu cowdi-dropdown-menu">
                <li><NavLink className="dropdown-item" to="/learning-path">🛤️ Lộ trình chung</NavLink></li>
                <li><hr className="dropdown-divider" /></li>
                <li><NavLink className="dropdown-item" to="/learning-path?tab=ielts">🎯 IELTS</NavLink></li>
                <li><NavLink className="dropdown-item" to="/learning-path?tab=b1">🌍 B1 Preliminary</NavLink></li>
                <li><NavLink className="dropdown-item" to="/learning-path?tab=b2">📘 B2 First</NavLink></li>
                <li><NavLink className="dropdown-item" to="/learning-path?tab=toeic">🏢 TOEIC</NavLink></li>
              </ul>
            </li>

            {/* Luyện tập */}
            <li className="nav-item dropdown">
              <a className={`nav-link dropdown-toggle px-3 fw-semibold d-flex align-items-center gap-1 ${isIn(PRACTICE_PATHS) ? 'active' : ''}`}
                href="#" role="button">
                <img src="/assets/images/Icons/icon_lesson.webp" alt="" width="18" height="18" /> Luyện tập
              </a>
              <ul className="dropdown-menu cowdi-dropdown-menu">
                <li><NavLink className="dropdown-item" to="/practice">🎯 Bài tập</NavLink></li>
                <li><NavLink className="dropdown-item" to="/mini-games">🎮 Mini-games</NavLink></li>
                <li><NavLink className="dropdown-item" to="/duel">⚔️ Đấu trường</NavLink></li>
              </ul>
            </li>

            {/* 🐮 Pet */}
            <li className="nav-item dropdown">
              <a className={`nav-link dropdown-toggle px-3 fw-semibold d-flex align-items-center gap-1 ${isIn(PET_PATHS) ? 'active' : ''}`}
                href="#" role="button">
                <img
                  src={evo?.image || '/assets/images/logo/MiniLogoCowdi.svg'}
                  alt="" width="20" height="20" style={{ objectFit: 'contain' }} /> Pet
              </a>
              <ul className="dropdown-menu cowdi-dropdown-menu">
                <li><NavLink className="dropdown-item" to="/pet">🐮 Pet của tôi</NavLink></li>
                <li><NavLink className="dropdown-item" to="/collection">📦 Bộ sưu tập</NavLink></li>
                <li><NavLink className="dropdown-item" to="/shop">🛍️ Shop</NavLink></li>
              </ul>
            </li>

            {/* 👤 Tôi — avatar + name */}
            <li className="nav-item dropdown">
              <a className={`nav-link dropdown-toggle px-3 fw-semibold d-flex align-items-center gap-1 ${isIn(ME_PATHS) ? 'active' : ''}`}
                href="#" role="button">
                {avatarUrl
                  ? <img src={avatarUrl} alt="" width="22" height="22" className="rounded-circle" referrerPolicy="no-referrer" />
                  : <span>👤</span>}
                <span className="d-none d-xl-inline" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                <span className="d-xl-none">Tôi</span>
              </a>
              <ul className="dropdown-menu cowdi-dropdown-menu">
                <li><NavLink className="dropdown-item" to="/progress">📊 Tiến trình</NavLink></li>
                <li><NavLink className="dropdown-item" to="/student-ranking">🏆 Xếp hạng</NavLink></li>
                <li><NavLink className="dropdown-item" to="/leaderboard">🏅 Xếp hạng Pet</NavLink></li>
                <li><hr className="dropdown-divider" /></li>
                <li><NavLink className="dropdown-item" to="/account">👤 Tài khoản</NavLink></li>
              </ul>
            </li>
          </ul>

          {/* ── Desktop-only right action (≥ 992 px) ── */}
          <div className="d-none d-lg-flex align-items-center ms-auto">
            {!user ? (
              <button
                type="button"
                className="navbar-action-btn navbar-login-btn"
                onClick={loginWithGoogle}
                title="Đăng nhập với Google để đồng bộ tiến trình"
              >
                <i className="fab fa-google" />
                <span className="navbar-action-label">Đăng nhập</span>
              </button>
            ) : (
              <button
                type="button"
                className={`navbar-action-btn navbar-reminder-btn ${hasStudiedToday ? '' : 'has-reminder'}`}
                onClick={() => navigate('/lessons')}
                title={hasStudiedToday
                  ? `Hôm nay bạn đã học ${userData.dailyXP || 0} XP rồi! 🎉`
                  : 'Đến giờ học rồi nè! Nhấn để vào bài học 📚'}
              >
                <span className="navbar-action-icon">{hasStudiedToday ? '🔔' : '⏰'}</span>
                <span className="navbar-action-label">{hasStudiedToday ? 'Nhắc học' : 'Học ngay'}</span>
              </button>
            )}
          </div>

          {/* ── Stats + Auth (mobile only — hidden on desktop via CSS) ── */}
          <div className="navbar-stats ms-auto flex-shrink-0">
            <span className="badge bg-warning text-dark">⭐{userData.totalXP}</span>
            <span className="badge bg-danger">🔥{userData.streak}</span>
            <span className="badge bg-primary d-none d-sm-inline">Lv.{level.level}</span>
            <span className="badge bg-success">🪙{petData.coins}</span>
            <button className="btn btn-sm p-0 border-0 ms-1" onClick={toggleMute}
              title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              style={{ fontSize: '1rem', lineHeight: 1, background: 'none', opacity: muted ? 0.5 : 1 }}>
              {muted ? '🔇' : '🔊'}
            </button>

            {user ? (
              <NavLink to="/account" className="ms-1">
                {user.avatar_url ? (
                  <img src={user.avatar_url} width="28" height="28"
                    className="rounded-circle border border-2 border-cowdi"
                    alt={user.display_name} referrerPolicy="no-referrer" />
                ) : (
                  <span className="badge bg-secondary rounded-circle p-1">👤</span>
                )}
              </NavLink>
            ) : (
              <button className="btn btn-cowdi-primary btn-sm ms-1 px-2" onClick={loginWithGoogle}
                style={{ fontSize: '.75rem' }}>
                <i className="fab fa-google me-1"></i><span className="d-none d-sm-inline">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════ Mobile Bottom Tab Bar (< 992 px) ═══════════ */}
      <nav className="cowdi-bottom-nav d-lg-none" aria-label="Mobile navigation" ref={popupRef}>

        {/* Popup sub-menu */}
        {openTab && MOBILE_MENUS[openTab] && (
          <div className="bottom-popup-menu">
            {MOBILE_MENUS[openTab].items.map((item) => (
              <button
                key={item.path}
                className={`bottom-popup-item ${pathname === item.path ? 'active' : ''}`}
                onClick={() => goTo(item.path)}
              >
                <span className="bottom-popup-icon">{item.icon}</span>
                <span className="bottom-popup-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab buttons */}
        <NavLink to="/" end className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
          onClick={() => setOpenTab(null)}>
          <span className="bottom-tab-icon"><img src="/assets/images/Icons/icon_home.webp" alt="" width="22" height="22" /></span>
          <span className="bottom-tab-label">Home</span>
        </NavLink>
        <button type="button" className={`bottom-tab ${isIn(LEARN_PATHS) || isIn(PRACTICE_PATHS) ? 'active' : ''} ${openTab === 'learn' ? 'open' : ''}`}
          onClick={() => handleTabTap('learn', '/lessons')}>
          <span className="bottom-tab-icon"><img src="/assets/images/Icons/icon_learn.webp" alt="" width="22" height="22" /></span>
          <span className="bottom-tab-label">Học</span>
        </button>
        <button type="button" className={`bottom-tab ${isIn(EXAM_PATHS_NAV) ? 'active' : ''} ${openTab === 'exam' ? 'open' : ''}`}
          onClick={() => handleTabTap('exam', '/learning-path')}>
          <span className="bottom-tab-icon"><img src="/assets/images/Icons/icon_exam.webp" alt="" width="22" height="22" /></span>
          <span className="bottom-tab-label">Thi</span>
        </button>
        <button type="button" className={`bottom-tab ${isIn(PET_PATHS) ? 'active' : ''} ${openTab === 'pet' ? 'open' : ''}`}
          onClick={() => handleTabTap('pet', '/pet')}>
          <span className="bottom-tab-icon"><img src={evo?.image || '/assets/images/logo/MiniLogoCowdi.svg'} alt="" width="22" height="22" style={{ objectFit: 'contain' }} /></span>
          <span className="bottom-tab-label">Pet</span>
        </button>
        <button type="button" className={`bottom-tab ${isIn(ME_PATHS) ? 'active' : ''} ${openTab === 'me' ? 'open' : ''}`}
          onClick={() => handleTabTap('me', '/progress')}>
          <span className="bottom-tab-icon">
            {avatarUrl
              ? <img src={avatarUrl} alt="" width="24" height="24" className="rounded-circle" referrerPolicy="no-referrer" />
              : '👤'}
          </span>
          <span className="bottom-tab-label">Tôi</span>
        </button>
      </nav>
    </>
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

