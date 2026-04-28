import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { PET_REGISTRY, getPetEvolution } from '../data/pets';
import { LEVELS, ACHIEVEMENTS } from '../data/lessons';

const SORT_TABS = [
  { id: 'score',        icon: '🏆', label: 'Tổng điểm', info: true },
  { id: 'xp',           icon: '⭐', label: 'Tổng XP' },
  { id: 'streak',       icon: '🔥', label: 'Streak' },
  { id: 'lessons',      icon: '📚', label: 'Bài học' },
  { id: 'words',        icon: '🎴', label: 'Từ vựng' },
  { id: 'quizzes',      icon: '🎯', label: 'Quiz' },
  { id: 'achievements', icon: '🏅', label: 'Thành tích' },
];

// Công thức tính điểm tổng hợp (khớp với server computeRankScore)
const SCORE_WEIGHTS = {
  xp: 0.4,
  lessons: 50,
  words: 8,
  quizzes: 12,
  perfect: 30,
  streak: 25,
  activeDays: 8,
  achievements: 120,
};
function computeRankScore(e) {
  const xpCapped = Math.min(e.totalXP || 0, 50000);
  const streakCapped = Math.min(e.streak || 0, 365);
  return Math.round(
    xpCapped * SCORE_WEIGHTS.xp +
    (e.lessonsCompleted || 0) * SCORE_WEIGHTS.lessons +
    (e.wordsLearned || 0) * SCORE_WEIGHTS.words +
    (e.quizzesCompleted || 0) * SCORE_WEIGHTS.quizzes +
    (e.perfectQuizzes || 0) * SCORE_WEIGHTS.perfect +
    streakCapped * SCORE_WEIGHTS.streak +
    (e.activeDaysCount || 0) * SCORE_WEIGHTS.activeDays +
    (e.achievementCount || 0) * SCORE_WEIGHTS.achievements
  );
}

function resolvePetAvatar(pet) {
  if (!pet?.speciesId) return { emoji: '🐾', image: null };
  const species = PET_REGISTRY[pet.speciesId];
  if (!species) return { emoji: '🐾', image: null };
  const evo = getPetEvolution(pet.speciesId, pet.totalXpEarned || 0);
  return {
    emoji: evo?.emoji || species.emoji,
    image: evo?.image || null,
  };
}

function getUserLevel(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  return current;
}

function getStatValue(entry, sort) {
  switch (sort) {
    case 'score':        return { value: entry.rankScore ?? computeRankScore(entry), unit: 'điểm', icon: '🏆' };
    case 'xp':           return { value: entry.totalXP, unit: 'XP', icon: '⭐' };
    case 'streak':       return { value: entry.streak, unit: 'ngày', icon: '🔥' };
    case 'lessons':      return { value: entry.lessonsCompleted, unit: 'bài', icon: '📚' };
    case 'words':        return { value: entry.wordsLearned, unit: 'từ', icon: '🎴' };
    case 'quizzes':      return { value: entry.quizzesCompleted, unit: 'quiz', icon: '🎯' };
    case 'achievements': return { value: entry.achievementCount, unit: '', icon: '🏅' };
    default:             return { value: entry.rankScore ?? computeRankScore(entry), unit: 'điểm', icon: '🏆' };
  }
}

export default function StudentRankingPage() {
  const { authFetch, user } = useAuth();
  const { userData } = useUser();
  const { petData } = usePet();
  const [sort, setSort] = useState('score');
  const [showFormula, setShowFormula] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    authFetch(`/api/student-rankings?sort=${encodeURIComponent(sort)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setRankings(Array.isArray(data) ? data : []))
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, [sort]);

  // My stats
  const myStats = useMemo(() => {
    const pet = petData.collection[petData.activePetId];
    const species = pet ? PET_REGISTRY[pet.speciesId] : null;
    const evo = pet && species ? getPetEvolution(pet.speciesId, pet.totalXpEarned) : null;
    const level = getUserLevel(userData.totalXP);
    const base = {
      totalXP: userData.totalXP,
      streak: userData.streak,
      lessonsCompleted: userData.lessonsCompleted,
      quizzesCompleted: userData.quizzesCompleted,
      perfectQuizzes: userData.perfectQuizzes,
      wordsLearned: userData.wordsLearned,
      achievementCount: userData.achievements?.length || 0,
      activeDaysCount: userData.activeDays?.length || 0,
    };
    return {
      emoji: evo?.emoji || species?.emoji || '🐮',
      image: evo?.image || null,
      level,
      ...base,
      rankScore: computeRankScore(base),
    };
  }, [userData, petData]);

  const rankMedal = (i) => ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;

  // Find my rank in current sort
  const myRank = useMemo(() => {
    const nick = petData.nickname || '';
    if (!nick) return null;
    const idx = rankings.findIndex(r => r.nickname === nick);
    return idx >= 0 ? idx + 1 : null;
  }, [rankings, petData.nickname]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold"><span className="me-2">📊</span>Xếp hạng học tập</h2>
        <p className="text-muted small">Xếp hạng dựa trên thành tích học tập</p>
      </div>

      {/* My Overview Card */}
      {user && (
        <div className="card shadow-sm mb-4 border-cowdi">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {myStats.image
                  ? <img src={myStats.image} alt="pet" width="48" height="48" style={{ objectFit: 'contain' }} />
                  : <span className="fs-1">{myStats.emoji}</span>}
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold">{petData.nickname || user.display_name || 'Bạn'}</div>
                <div className="text-muted small">
                  Lv.{myStats.level.level} · {myStats.level.title}
                  {myRank && <span className="ms-2 badge bg-cowdi-primary">Hạng #{myRank}</span>}
                </div>
              </div>
              <div className="text-end">
                <div className="fw-bold" style={{ fontSize: '1.4rem', color: '#E91E63' }}>
                  🏆 {myStats.rankScore.toLocaleString()}
                </div>
                <div className="text-muted" style={{ fontSize: '0.65rem' }}>tổng điểm</div>
              </div>
            </div>
            <div className="row g-2">
              {[
                { icon: '⭐', label: 'XP', value: myStats.totalXP, color: '#FFC107' },
                { icon: '🔥', label: 'Streak', value: `${myStats.streak} ngày`, color: '#F44336' },
                { icon: '📚', label: 'Bài học', value: myStats.lessonsCompleted, color: '#2196F3' },
                { icon: '🃏', label: 'Từ vựng', value: myStats.wordsLearned, color: '#9C27B0' },
                { icon: '🎯', label: 'Quiz', value: myStats.quizzesCompleted, color: '#4CAF50' },
                { icon: '💯', label: 'Điểm tối đa', value: myStats.perfectQuizzes, color: '#FF9800' },
                { icon: '🏅', label: 'Thành tích', value: `${myStats.achievementCount}/${ACHIEVEMENTS.length}`, color: '#E91E63' },
                { icon: '📅', label: 'Ngày học', value: myStats.activeDaysCount, color: '#00BCD4' },
              ].map((s, i) => (
                <div className="col-3" key={i}>
                  <div className="text-center p-2 rounded" style={{ background: s.color + '12' }}>
                    <div>{s.icon}</div>
                    <div className="fw-bold small" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-muted" style={{ fontSize: '0.6rem' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-center align-items-center">
        {SORT_TABS.map(t => (
          <div key={t.id} className="d-flex align-items-center" style={{ gap: 2 }}>
            <button
              className={`btn btn-sm rounded-pill ${sort === t.id ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSort(t.id)}
            >
              {t.icon} {t.label}
            </button>
            {t.info && (
              <button
                className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                style={{ fontSize: '0.75rem', lineHeight: 1, marginLeft: 2 }}
                title="Xem cách tính điểm"
                onClick={() => setShowFormula(v => !v)}
                aria-label="Cách tính điểm"
              >ℹ️</button>
            )}
          </div>
        ))}
      </div>

      {/* Formula explanation (collapsed, shown via ℹ️ button) */}
      {showFormula && (
        <div className="card border mb-3">
          <div className="card-body py-2 px-3" style={{ fontSize: '0.72rem' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="fw-bold">🏆 Cách tính tổng điểm</span>
              <button className="btn btn-sm p-0 border-0 bg-transparent text-muted" style={{ fontSize: '1rem', lineHeight: 1 }} onClick={() => setShowFormula(false)}>✕</button>
            </div>
            <div className="row g-1">
              {[
                { label: 'XP (cap 50k)', weight: '× 0.4', icon: '⭐', note: 'khối lượng' },
                { label: 'Bài học',      weight: '× 50',  icon: '📚', note: 'học có cấu trúc' },
                { label: 'Từ vựng',      weight: '× 8',   icon: '🎴', note: 'vốn từ' },
                { label: 'Quiz',         weight: '× 12',  icon: '🎯', note: 'luyện tập' },
                { label: 'Quiz tối đa',  weight: '× 30',  icon: '💯', note: 'chất lượng' },
                { label: 'Streak (cap 365)', weight: '× 25', icon: '🔥', note: 'kiên trì' },
                { label: 'Ngày học',     weight: '× 8',   icon: '📅', note: 'đều đặn' },
                { label: 'Thành tích',   weight: '× 120', icon: '🏅', note: 'cột mốc lớn' },
              ].map((row, idx) => (
                <div className="col-6" key={idx}>
                  <div className="d-flex align-items-center gap-1 py-1 border-bottom" style={{ borderColor: '#eee' }}>
                    <span>{row.icon}</span>
                    <span className="flex-grow-1 text-muted">{row.label}</span>
                    <span className="fw-bold" style={{ color: '#E91E63' }}>{row.weight}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-muted mt-2" style={{ fontSize: '0.65rem' }}>Cân bằng giữa <b>khối lượng</b>, <b>chất lượng</b> và <b>sự kiên trì</b>.</div>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-cowdi-primary"></div>
              <p className="text-muted small mt-2">Đang tải...</p>
            </div>
          ) : rankings.length > 0 ? (
            <div className="list-group list-group-flush">
              {rankings.map((entry, i) => {
                const stat = getStatValue(entry, sort);
                const level = getUserLevel(entry.totalXP);
                const isTop3 = i < 3;
                const avatar = resolvePetAvatar(entry.pet);
                return (
                  <div
                    key={i}
                    className={`list-group-item d-flex align-items-center gap-2 ${isTop3 ? 'bg-warning bg-opacity-10' : ''}`}
                  >
                    <span className="fw-bold" style={{ minWidth: 36, fontSize: isTop3 ? '1.2rem' : '0.9rem' }}>
                      {rankMedal(i)}
                    </span>
                    <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {avatar.image
                        ? <img src={avatar.image} alt="pet" width="36" height="36" style={{ objectFit: 'contain' }} />
                        : <span className="fs-4">{avatar.emoji}</span>}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold small">{entry.nickname}</div>
                      <div style={{ fontSize: '0.7rem' }} className="text-muted">
                        Lv.{level.level} · {entry.lessonsCompleted} bài · {entry.wordsLearned} từ · 🔥 {entry.streak}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ color: isTop3 ? '#E91E63' : '#333' }}>
                        {stat.icon} {stat.value.toLocaleString?.() ?? stat.value}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>{stat.unit}</div>
                      {sort !== 'score' && (
                        <div className="text-muted" style={{ fontSize: '0.6rem', marginTop: 2 }}>
                          🏆 {(entry.rankScore ?? computeRankScore(entry)).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="fs-2 mb-2">📊</div>
              <p className="text-muted small">
                {user ? 'Chưa có dữ liệu. Hãy học bài để lên bảng xếp hạng!' : 'Đăng nhập để xem bảng xếp hạng!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
