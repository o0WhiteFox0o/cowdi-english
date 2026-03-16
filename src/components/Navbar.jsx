import { NavLink } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { usePet } from '../hooks/usePet';
import { LEVELS } from '../data/lessons';
import { PET_REGISTRY, getPetEvolution } from '../data/pets';

export default function Navbar() {
  const { userData } = useUser();
  const { user, loginWithGoogle, logout } = useAuth();
  const { petData, getActivePetWithDecay } = usePet();
  const level = getUserLevel(userData.totalXP);
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;

  return (
    <nav className="navbar navbar-expand-lg bg-white fixed-top shadow-sm border-bottom">
      <div className="container">
        <NavLink className="navbar-brand fw-bold text-cowdi-primary" to="/">
          <span className="me-1 fs-5">{evo?.emoji || '🐮'}</span> Cowdi English
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-home me-1"></i>Trang chủ
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/lessons" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-book me-1"></i>Bài học
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/vocabulary" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-language me-1"></i>Từ vựng
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/practice" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-pen me-1"></i>Luyện tập
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-chart-line me-1"></i>Tiến trình
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/pet" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {evo?.emoji || '🐮'} Pet
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/collection" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-th me-1"></i>Bộ sưu tập
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-store me-1"></i>Shop
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/account" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-user-circle me-1"></i>Tài khoản
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0 flex-wrap">
            {/* XP / Streak / Level */}
            <span className="badge bg-warning text-dark fw-bold">⭐ {userData.totalXP} XP</span>
            <span className="badge bg-danger fw-bold">🔥 {userData.streak}</span>
            <span className="badge bg-primary fw-bold">Lv.{level.level}</span>
            <span className="badge bg-success fw-bold">🪙 {petData.coins}</span>

            {/* Auth */}
            {user ? (
              <NavLink to="/account" className="d-flex align-items-center gap-2 ms-2 text-decoration-none">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    width="30" height="30"
                    className="rounded-circle border border-2 border-cowdi"
                    alt={user.display_name}
                    title={user.display_name}
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="small fw-semibold text-secondary d-none d-xl-inline text-truncate" style={{ maxWidth: 120 }}>
                  {user.display_name}
                </span>
              </NavLink>
            ) : (
              <button className="btn btn-cowdi-primary btn-sm ms-2" onClick={loginWithGoogle}>
                <i className="fab fa-google me-1"></i>Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
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

