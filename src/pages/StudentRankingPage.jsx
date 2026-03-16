import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { PET_REGISTRY, getPetEvolution } from '../data/pets';
import { LEVELS, ACHIEVEMENTS } from '../data/lessons';

const SORT_TABS = [
  { id: 'xp',           icon: '⭐', label: 'Tổng XP' },
  { id: 'streak',       icon: '🔥', label: 'Streak' },
  { id: 'lessons',      icon: '📚', label: 'Bài học' },
  { id: 'words',        icon: '🃏', label: 'Từ vựng' },
  { id: 'quizzes',      icon: '🎯', label: 'Quiz' },
  { id: 'achievements', icon: '🏅', label: 'Thành tích' },
];

function resolveEmoji(pet) {
  if (!pet?.speciesId) return '🐾';
  const species = PET_REGISTRY[pet.speciesId];
  if (!species) return '🐾';
  const evo = getPetEvolution(pet.speciesId, pet.totalXpEarned || 0);
  return evo?.emoji || species.emoji;
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
    case 'xp':           return { value: entry.totalXP, unit: 'XP', icon: '⭐' };
    case 'streak':       return { value: entry.streak, unit: 'ngày', icon: '🔥' };
    case 'lessons':      return { value: entry.lessonsCompleted, unit: 'bài', icon: '📚' };
    case 'words':        return { value: entry.wordsLearned, unit: 'từ', icon: '🃏' };
    case 'quizzes':      return { value: entry.quizzesCompleted, unit: 'quiz', icon: '🎯' };
    case 'achievements': return { value: entry.achievementCount, unit: '', icon: '🏅' };
    default:             return { value: entry.totalXP, unit: 'XP', icon: '⭐' };
  }
}

export default function StudentRankingPage() {
  const { authFetch, user } = useAuth();
  const { userData } = useUser();
  const { petData } = usePet();
  const [sort, setSort] = useState('xp');
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
    return {
      emoji: evo?.emoji || species?.emoji || '🐮',
      level,
      totalXP: userData.totalXP,
      streak: userData.streak,
      lessonsCompleted: userData.lessonsCompleted,
      quizzesCompleted: userData.quizzesCompleted,
      perfectQuizzes: userData.perfectQuizzes,
      wordsLearned: userData.wordsLearned,
      achievementCount: userData.achievements?.length || 0,
      activeDaysCount: userData.activeDays?.length || 0,
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
              <div className="fs-1">{myStats.emoji}</div>
              <div className="flex-grow-1">
                <div className="fw-bold">{petData.nickname || user.display_name || 'Bạn'}</div>
                <div className="text-muted small">
                  Lv.{myStats.level.level} · {myStats.level.title}
                  {myRank && <span className="ms-2 badge bg-cowdi-primary">Hạng #{myRank}</span>}
                </div>
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
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-center">
        {SORT_TABS.map(t => (
          <button
            key={t.id}
            className={`btn btn-sm rounded-pill ${sort === t.id ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSort(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

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
                return (
                  <div
                    key={i}
                    className={`list-group-item d-flex align-items-center gap-2 ${isTop3 ? 'bg-warning bg-opacity-10' : ''}`}
                  >
                    <span className="fw-bold" style={{ minWidth: 36, fontSize: isTop3 ? '1.2rem' : '0.9rem' }}>
                      {rankMedal(i)}
                    </span>
                    <span className="fs-4">{resolveEmoji(entry.pet)}</span>
                    <div className="flex-grow-1">
                      <div className="fw-bold small">{entry.nickname}</div>
                      <div style={{ fontSize: '0.7rem' }} className="text-muted">
                        Lv.{level.level} · {entry.lessonsCompleted} bài · {entry.wordsLearned} từ
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ color: isTop3 ? '#E91E63' : '#333' }}>
                        {stat.icon} {stat.value.toLocaleString?.() ?? stat.value}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>{stat.unit}</div>
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
