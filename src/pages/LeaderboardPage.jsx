import { useState, useMemo, useEffect } from 'react';
import { usePet } from '../hooks/usePet';
import { useAuth } from '../hooks/useAuth';
import { PET_REGISTRY, calculatePowerScore, getSkillLevel, SKILL_META, getPetEvolution } from '../data/pets';

const TABS = [
  { id: 'power', icon: '⚡', label: 'Sức mạnh' },
  { id: 'skill', icon: '🎯', label: 'Kỹ năng' },
  { id: 'collection', icon: '📦', label: 'Bộ sưu tập' },
  { id: 'league', icon: '🏅', label: 'Giải đấu' },
];

const SKILL_TABS = Object.entries(SKILL_META).map(([key, meta]) => ({ id: key, ...meta }));

const LEAGUES = {
  bronze:  { name: 'Đồng',      icon: '🥉', color: '#CD7F32' },
  silver:  { name: 'Bạc',       icon: '🥈', color: '#9E9E9E' },
  gold:    { name: 'Vàng',      icon: '🥇', color: '#FFC107' },
  diamond: { name: 'Kim cương', icon: '💎', color: '#00BCD4' },
  master:  { name: 'Cao thủ',   icon: '👑', color: '#E91E63' },
};

function resolvePetAvatar(speciesId, totalXpEarned) {
  if (!speciesId) return { emoji: '🐾', image: null };
  const species = PET_REGISTRY[speciesId];
  if (!species) return { emoji: '🐾', image: null };
  const evo = getPetEvolution(speciesId, totalXpEarned || 0);
  return { emoji: evo?.emoji || species.emoji, image: evo?.image || null };
}

function PetAvatarInline({ speciesId, totalXpEarned, size = 32 }) {
  const { emoji, image } = resolvePetAvatar(speciesId, totalXpEarned);
  if (image) return <img src={image} alt="pet" loading="lazy" decoding="async" style={{ width: size, height: size, objectFit: 'contain' }} />;
  return <span style={{ fontSize: size * 0.8 }}>{emoji}</span>;
}

export default function LeaderboardPage() {
  const { petData } = usePet();
  const { authFetch, user } = useAuth();
  const [tab, setTab] = useState('power');
  const [skillTab, setSkillTab] = useState('listening');
  const [leaderboard, setLeaderboard] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch leaderboard from server (power/skill/collection)
  useEffect(() => {
    if (tab === 'league') return; // league uses /api/rankings
    setLoading(true);
    const type = tab === 'skill' ? 'skill' : tab;
    const params = new URLSearchParams({ type });
    if (tab === 'skill') params.set('skill', skillTab);
    authFetch(`/api/leaderboard?${params}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, [tab, skillTab]);

  // Fetch league rankings
  useEffect(() => {
    if (tab !== 'league') return;
    setLoading(true);
    authFetch('/api/rankings')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setRankings(Array.isArray(data) ? data : []))
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, [tab]);

  // My pet stats
  const myPet = useMemo(() => {
    const pet = petData.collection[petData.activePetId];
    if (!pet) return null;
    const species = PET_REGISTRY[pet.speciesId];
    const evo = getPetEvolution(pet.speciesId, pet.totalXpEarned);
    return {
      name: pet.customName,
      species: species?.name,
      emoji: evo?.emoji || species?.emoji,
      image: evo?.image || null,
      evoName: evo?.name,
      power: calculatePowerScore(pet, species),
      skills: pet.skills,
      collectionCount: Object.keys(petData.collection).length,
    };
  }, [petData]);

  const rankMedal = (i) => ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">🏆 Bảng xếp hạng</h2>
        <p className="text-muted small">So sánh pet & leo hạng giải đấu</p>
      </div>

      {/* Nickname */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex align-items-center gap-2 py-2">
          <span className="text-muted small">Tên hiển thị:</span>
          <span className="fw-bold">{petData.nickname || user?.display_name || user?.name || '(Ẩn danh)'}</span>
          <span className="text-muted small ms-auto">Đổi tên tại Tài khoản</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-center">
        {TABS.map((t) => (
          <button key={t.id}
            className={`btn btn-sm rounded-pill ${tab === t.id ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Skill sub-tabs */}
      {tab === 'skill' && (
        <div className="d-flex gap-1 mb-3 justify-content-center flex-wrap">
          {SKILL_TABS.map((s) => (
            <button key={s.id}
              className={`btn btn-sm ${skillTab === s.id ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setSkillTab(s.id)}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      )}

      {/* League Rankings */}
      {tab === 'league' && (
        <div className="card shadow-sm mb-4">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-cowdi-primary"></div>
                <p className="text-muted small mt-2">Đang tải...</p>
              </div>
            ) : rankings.length > 0 ? (
              <div className="list-group list-group-flush">
                {rankings.slice(0, 20).map((entry, i) => {
                  const lg = LEAGUES[entry.league] || LEAGUES.bronze;
                  return (
                    <div key={i} className={`list-group-item d-flex align-items-center gap-2 ${i < 3 ? 'bg-warning bg-opacity-10' : ''}`}>
                      <span className="fw-bold" style={{ minWidth: 32 }}>{rankMedal(i)}</span>
                      <PetAvatarInline speciesId={entry.pet?.speciesId} totalXpEarned={entry.pet?.totalXpEarned} size={36} />
                      <div className="flex-grow-1">
                        <div className="fw-bold small">{entry.nickname || entry.displayName || 'Ẩn danh'}</div>
                        <div style={{ fontSize: '0.7rem' }} className="text-muted">
                          <span className="text-success">{entry.duelWins}W</span> / <span className="text-danger">{entry.duelLosses}L</span>
                          {entry.duelStreak > 0 && <span className="ms-1">🔥{entry.duelStreak}</span>}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge" style={{ backgroundColor: lg.color, color: '#fff', fontSize: '0.7rem' }}>
                          {lg.icon} {lg.name}
                        </span>
                        <div className="fw-bold small mt-1">{entry.leaguePoints} LP</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="fs-2 mb-2">🏅</div>
                <p className="text-muted small">Chưa có dữ liệu. Hãy đấu trường để leo hạng!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pet Leaderboard entries (power/skill/collection) */}
      {tab !== 'league' && (
        <div className="card shadow-sm mb-4">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-cowdi-primary"></div>
                <p className="text-muted small mt-2">Đang tải...</p>
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="list-group list-group-flush">
                {leaderboard.slice(0, 20).map((entry, i) => (
                  <div key={i} className={`list-group-item d-flex align-items-center gap-2 ${i < 3 ? 'bg-warning bg-opacity-10' : ''}`}>
                    <span className="fw-bold" style={{ minWidth: 32 }}>{rankMedal(i)}</span>
                    <PetAvatarInline speciesId={entry.speciesId} totalXpEarned={entry.totalXpEarned} size={36} />
                    <div className="flex-grow-1">
                      <div className="fw-bold small">{entry.petName || entry.nickname || entry.displayName || 'Pet'}</div>
                      <div style={{ fontSize: '0.7rem' }} className="text-muted">{entry.nickname || entry.displayName || 'Ẩn danh'}</div>
                    </div>
                    <div className="text-end">
                      {tab === 'power' && <span className="badge bg-dark">⚡ {entry.power}</span>}
                      {tab === 'skill' && <span className="badge bg-primary">{SKILL_META[skillTab]?.icon} Lv.{getSkillLevel(entry.skill || 0)}</span>}
                      {tab === 'collection' && <span className="badge bg-success">📦 {entry.collectionCount}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="fs-2 mb-2">🏆</div>
                <p className="text-muted small">
                  {user ? 'Chưa có dữ liệu. Hãy học bài để leo hạng!' : 'Đăng nhập để xem bảng xếp hạng!'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My ranking */}
      {myPet && (
        <div className="card shadow-sm border-cowdi">
          <div className="card-body">
            <h6 className="fw-bold small mb-2">📊 Pet của bạn</h6>
            <div className="d-flex align-items-center gap-2">
              {myPet.image
                ? <img src={myPet.image} alt={myPet.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
                : <span className="fs-3">{myPet.emoji}</span>}
              <div className="flex-grow-1">
                <div className="fw-bold">{myPet.name}</div>
                <div className="text-muted small">{myPet.species} · {myPet.evoName}</div>
              </div>
              <div className="text-end">
                <div className="badge bg-dark mb-1">⚡ {myPet.power}</div>
                <div className="d-flex gap-1 justify-content-end">
                  {Object.entries(SKILL_META).map(([key, meta]) => (
                    <span key={key} className="badge bg-light text-dark" style={{ fontSize: '0.6rem' }}>
                      {meta.icon}{myPet.skills[key] || 0}
                    </span>
                  ))}
                </div>
                <div className="badge bg-success mt-1" style={{ fontSize: '0.65rem' }}>📦 {myPet.collectionCount} pet</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
