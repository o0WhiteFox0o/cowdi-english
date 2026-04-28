import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { usePet } from '../hooks/usePet';
import { LESSONS, LEVELS } from '../data/lessons';
import { PET_REGISTRY, getPetEvolution, getPetMood, SKILL_META } from '../data/pets';

// ── Quick-action shortcuts ───────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '📖', label: 'Bài học',     sublabel: 'Học ngay',       link: '/lessons',     color: '#00B894', bg: '#E0FBF5' },
  { icon: '🃏', label: 'Flashcard',   sublabel: 'Ôn từ vựng',     link: '/vocabulary',  color: '#FDCB6E', bg: '#FFFBEA' },
  { icon: '🎯', label: 'Quiz',        sublabel: 'Luyện tập',      link: '/practice',    color: '#6C5CE7', bg: '#F0EEFF' },
  { icon: '⚔️', label: 'Đấu trường', sublabel: 'Thách đấu pet',   link: '/duel',        color: '#E17055', bg: '#FFF0ED' },
  { icon: '🐾', label: 'Pet của tôi', sublabel: 'Chăm sóc',       link: '/pet',         color: '#FF6B9D', bg: '#FFF0F6' },
  { icon: '🏆', label: 'Xếp hạng',   sublabel: 'Bảng xếp hạng',  link: '/leaderboard', color: '#F39C12', bg: '#FFF8E1' },
];

export default function HomePage() {
  const { userData } = useUser();
  const { user, loginWithGoogle } = useAuth();
  const { petData, getActivePetWithDecay } = usePet();
  const level = getUserLevel(userData.totalXP);
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;
  const nextLevel = LEVELS.find((l) => l.xpRequired > userData.totalXP);
  const xpProgress = nextLevel
    ? Math.min(100, ((userData.totalXP - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100)
    : 100;

  const dailyLesson = LESSONS.find((l) => !userData.completedLessons.includes(l.id)) || LESSONS[0];
  const allDone = userData.dailyTasks.lessonDone && userData.dailyTasks.vocabDone;

  const petName  = activePet?.customName || species?.name || 'Cowdi';
  const petEmoji = evo?.emoji || '🐮';

  return (
    <div className="fade-in">

      {/* ═══════════════════════════════════════
          GUEST LOGIN BANNER
      ═══════════════════════════════════════ */}
      {!user && (
        <div className="alert d-flex align-items-center gap-3 mb-4 shadow-sm" style={{ background: '#fff', border: '2px solid #e8d5f5', borderRadius: 16, padding: '14px 18px' }}>
          <img src="/assets/images/logo/MiniLogoCowdi.svg" alt="" width="40" height="40" style={{ flexShrink: 0 }} />
          <div className="flex-grow-1">
            <div className="fw-bold mb-1" style={{ color: '#6C3FC7' }}>Đăng nhập để lưu tiến trình!</div>
            <div className="text-muted small">Đăng nhập bằng tài khoản Google để lưu XP, streak và pet của bạn trên mọi thiết bị.</div>
          </div>
          <button className="btn btn-cowdi-primary btn-sm d-flex align-items-center gap-2 flex-shrink-0" onClick={loginWithGoogle}>
            <i className="fab fa-google"></i> Đăng nhập
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════
          HERO BANNER
      ═══════════════════════════════════════ */}
      <div className="home-hero mb-4">
        {/* Text side */}
        <div className="home-hero-text">
          <div className="home-hero-greeting">Chào mừng trở lại! 👋</div>
          <h1 className="home-hero-title">
            Học cùng <span className="home-hero-petname">{petName}</span>
          </h1>
          <p className="home-hero-sub">
            Mỗi ngày một chút — tiến bộ mỗi ngày. Hôm nay bạn học gì?
          </p>
          <div className="d-flex gap-2 flex-wrap mt-3">
            <Link to="/lessons" className="btn btn-cowdi-primary">
              ▶ Bắt đầu học
            </Link>
            <Link to="/practice" className="btn btn-outline-cowdi">
              ✏️ Luyện tập
            </Link>
          </div>
        </div>

        {/* Pet side */}
        <Link to="/pet" className="home-hero-pet text-decoration-none">
          {evo?.image ? (
            <img
              src={evo.image}
              alt={petName}
              className="home-hero-pet-img"
              fetchpriority="high"
              decoding="async"
              width="180"
              height="180"
            />
          ) : (
            <img
              src="/assets/images/logo/MiniLogoCowdi.svg"
              alt={petName}
              className="home-hero-pet-img"
              fetchpriority="high"
              decoding="async"
              width="180"
              height="180"
            />
          )}
          <div className="home-hero-pet-badge">{evo?.name || 'Starter'}</div>
        </Link>
      </div>

      {/* ═══════════════════════════════════════
          XP + STREAK STRIP
      ═══════════════════════════════════════ */}
      <div className="home-xp-strip mb-4">
        {/* Level badge */}
        <div className="home-xp-level">
          <div className="home-xp-level-badge">Lv.{level.level}</div>
          <div>
            <div className="home-xp-level-title">{level.title}</div>
            <div className="home-xp-level-sub">
              {userData.totalXP} / {nextLevel ? nextLevel.xpRequired : level.xpRequired} XP
            </div>
          </div>
        </div>
        {/* XP bar */}
        <div className="home-xp-bar-wrap flex-grow-1">
          <div className="home-xp-bar">
            <div className="home-xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        {/* Streak pill */}
        <div className="home-streak-pill">
          <span>🔥</span>
          <span className="fw-bold">{userData.streak}</span>
          <span className="home-streak-label">ngày</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DAILY CHALLENGE CARD
      ═══════════════════════════════════════ */}
      <div className={`home-daily-card mb-4 ${allDone ? 'home-daily-done' : ''}`}>
        <div className="home-daily-icon">{allDone ? '🎉' : '🌟'}</div>
        <div className="home-daily-body">
          <div className="home-daily-title">
            {allDone ? 'Xuất sắc! Nhiệm vụ hôm nay hoàn thành!' : 'Nhiệm vụ hôm nay'}
          </div>
          {!allDone && (
            <div className="home-daily-tasks">
              <span className={userData.dailyTasks.lessonDone ? 'task-done' : 'task-todo'}>
                {userData.dailyTasks.lessonDone ? '✅' : '⬜'} Học 1 bài
              </span>
              <span className={userData.dailyTasks.vocabDone ? 'task-done' : 'task-todo'}>
                {userData.dailyTasks.vocabDone ? '✅' : '⬜'} Ôn từ vựng
              </span>
            </div>
          )}
        </div>
        {!allDone && (
          <Link to={`/lessons/${dailyLesson.id}`} className="btn btn-sm home-daily-btn">
            Làm ngay →
          </Link>
        )}
      </div>

      {/* ═══════════════════════════════════════
          QUICK ACTIONS GRID
      ═══════════════════════════════════════ */}
      <h5 className="home-section-title mb-3">⚡ Truy cập nhanh</h5>
      <div className="home-quick-grid mb-4">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.link} to={a.link} className="home-quick-item text-decoration-none" style={{ '--qa-color': a.color, '--qa-bg': a.bg }}>
            <div className="home-quick-icon">{a.icon}</div>
            <div className="home-quick-label">{a.label}</div>
            <div className="home-quick-sub">{a.sublabel}</div>
          </Link>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          STATS ROW
      ═══════════════════════════════════════ */}
      <div className="home-stats-row mb-4">
        {[
          { icon: '📚', value: userData.lessonsCompleted, label: 'Bài đã học',   link: '/lessons' },
          { icon: '🃏', value: userData.wordsLearned,     label: 'Từ đã thuộc', link: '/vocabulary' },
          { icon: '🪙', value: petData.coins,             label: 'Coins',        link: '/shop' },
          { icon: '🎯', value: userData.quizzesCompleted, label: 'Quiz đã làm', link: '/practice' },
        ].map((s) => (
          <Link key={s.label} to={s.link} className="home-stat-card text-decoration-none">
            <div className="home-stat-icon">{s.icon}</div>
            <div className="home-stat-value">{s.value ?? 0}</div>
            <div className="home-stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          4 SKILLS COMPACT
      ═══════════════════════════════════════ */}
      <Link to="/progress" className="text-decoration-none d-block mb-4">
        <div className="home-skills-card card shadow-sm card-hover">
          <div className="card-body pb-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-bold">🎯 Kỹ năng của bạn</span>
              <span className="text-cowdi-primary small">Xem chi tiết →</span>
            </div>
            <div className="home-skills-row">
              {Object.entries(SKILL_META).map(([key, meta]) => {
                const xp  = (userData.skillXP?.[key]) || 0;
                const max = Math.max(1, ...Object.values(userData.skillXP || { a: 1 }));
                const pct = Math.round((xp / max) * 100);
                return (
                  <div key={key} className="home-skill-item">
                    <div className="home-skill-emoji">{meta.icon}</div>
                    <div className="home-skill-bar-wrap">
                      <div className="home-skill-bar" style={{ width: `${pct}%`, background: meta.color }} />
                    </div>
                    <div className="home-skill-name" style={{ color: meta.color }}>{meta.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Link>

      {/* ═══════════════════════════════════════
          CONTINUE LEARNING CARD
      ═══════════════════════════════════════ */}
      <div className="home-continue-card mb-4">
        <div className="home-continue-icon">📖</div>
        <div className="home-continue-body">
          <div className="home-continue-label">Tiếp tục học</div>
          <div className="home-continue-title">{dailyLesson.title}</div>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className={`badge badge-level-${dailyLesson.level}`}>{dailyLesson.level}</span>
            <span className="text-muted small">{dailyLesson.icon}</span>
          </div>
        </div>
        <Link to={`/lessons/${dailyLesson.id}`} className="btn btn-cowdi-primary btn-sm ms-auto">
          Vào học →
        </Link>
      </div>

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
