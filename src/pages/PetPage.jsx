import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePet } from '../hooks/usePet';
import { useUser } from '../hooks/useUser';
import {
  PET_REGISTRY, getPetEvolution, calculatePowerScore, getSkillLevel,
  getPetMood, getPetMessage, SKILL_META, ELEMENT_COLORS, RARITY_COLORS,
  DAILY_QUESTS, SHOP_ITEMS,
} from '../data/pets';

export default function PetPage() {
  const { petData, getActivePetWithDecay, feedPet, renamePet, useFood, completeDailyQuest, addCoins } = usePet();
  const { userData } = useUser();
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evolution = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;
  const nextEvo = species?.evolutions.find((e) => e.xp > (activePet?.totalXpEarned || 0));
  const power = activePet && species ? calculatePowerScore(activePet, species) : 0;
  const mood = activePet ? getPetMood(activePet.needs) : 'happy';
  const message = species ? getPetMessage(activePet.speciesId, mood) : '';

  // Daily quests with completion check
  const dailyStatus = useMemo(() => {
    return DAILY_QUESTS.map((q) => ({
      ...q,
      done: petData.dailyQuests.completed.includes(q.id),
      canClaim: q.check(userData) && !petData.dailyQuests.completed.includes(q.id),
    }));
  }, [petData.dailyQuests, userData]);

  const allDailyDone = dailyStatus.every((q) => q.done);

  // Food items owned
  const ownedFood = useMemo(() =>
    SHOP_ITEMS.filter((i) => i.category === 'food' && petData.ownedItems.includes(i.id)),
  [petData.ownedItems]);

  if (!activePet || !species) {
    return (
      <div className="text-center py-5 fade-in">
        <div style={{ fontSize: '5rem' }}>🥚</div>
        <h2 className="fw-bold mt-3">Đang tải pet...</h2>
      </div>
    );
  }

  function handleRename() {
    if (nameInput.trim()) {
      renamePet(petData.activePetId, nameInput.trim());
    }
    setRenaming(false);
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <span className="me-2">🐾</span>Pet của bạn
        </h2>
      </div>

      {/* Pet Display Card */}
      <div className="card shadow-sm mb-4 pet-display-card">
        <div className="card-body text-center py-4">
          {/* Pet room background */}
          <div className={`pet-stage ${mood}`}>
            {/* Cosmetic effects */}
            {activePet.cosmetics?.effect && (
              <div className="pet-effect">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.effect)?.emoji || ''}</div>
            )}
            {/* Hat */}
            {activePet.cosmetics?.hat && (
              <div className="pet-hat">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.hat)?.emoji || ''}</div>
            )}
            {/* Pet emoji */}
            <div className="pet-emoji">{evolution?.emoji || species.emoji}</div>
            {/* Outfit */}
            {activePet.cosmetics?.outfit && (
              <div className="pet-outfit">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.outfit)?.emoji || ''}</div>
            )}
          </div>

          {/* Name + Evolution */}
          <div className="mt-3">
            {renaming ? (
              <div className="d-flex justify-content-center gap-2">
                <input
                  type="text" className="form-control form-control-sm" style={{ maxWidth: 160 }}
                  value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  maxLength={20} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
                <button className="btn btn-sm btn-cowdi-primary" onClick={handleRename}>✓</button>
              </div>
            ) : (
              <h3 className="fw-bold mb-1">
                {activePet.customName}
                <button className="btn btn-sm btn-link text-muted ms-1" onClick={() => { setRenaming(true); setNameInput(activePet.customName); }} title="Đổi tên">✏️</button>
              </h3>
            )}
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <span className="badge" style={{ background: ELEMENT_COLORS[species.element]?.bg, color: ELEMENT_COLORS[species.element]?.text }}>
                {ELEMENT_COLORS[species.element]?.name}
              </span>
              <span className="badge" style={{ background: RARITY_COLORS[species.rarity]?.bg, color: RARITY_COLORS[species.rarity]?.text }}>
                {RARITY_COLORS[species.rarity]?.name}
              </span>
              <span className="badge bg-dark">⚡ {power} Power</span>
            </div>
            <div className="text-muted small mt-1">{evolution?.name || 'Trứng'}</div>
          </div>

          {/* Chat bubble */}
          <div className="pet-chat-bubble mx-auto mt-3">
            <p className="mb-0 small">{message}</p>
          </div>
        </div>
      </div>

      {/* Evolution Progress */}
      {nextEvo && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h6 className="fw-bold mb-2">⚡ Tiến hóa tiếp theo: {nextEvo.name} {nextEvo.emoji}</h6>
            <div className="progress mb-1" style={{ height: 10 }}>
              <div className="progress-bar progress-bar-cowdi" style={{
                width: `${Math.min(100, ((activePet.totalXpEarned - (evolution?.xp || 0)) / (nextEvo.xp - (evolution?.xp || 0))) * 100)}%`
              }}></div>
            </div>
            <small className="text-muted">{activePet.totalXpEarned} / {nextEvo.xp} XP</small>
          </div>
        </div>
      )}

      {/* Needs bars */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">💗 Trạng thái</h6>
          {[
            { key: 'energy', icon: '🍎', label: 'Năng lượng', color: '#4CAF50' },
            { key: 'happiness', icon: '😊', label: 'Vui vẻ', color: '#FFC107' },
            { key: 'health', icon: '💤', label: 'Sức khỏe', color: '#F44336' },
            { key: 'knowledge', icon: '📚', label: 'Kiến thức', color: '#9C27B0' },
          ].map((need) => (
            <div key={need.key} className="mb-2">
              <div className="d-flex justify-content-between small">
                <span>{need.icon} {need.label}</span>
                <span className={activePet.needs[need.key] < 30 ? 'text-danger fw-bold' : 'text-muted'}>
                  {activePet.needs[need.key]}%
                </span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar" style={{
                  width: `${activePet.needs[need.key]}%`,
                  backgroundColor: activePet.needs[need.key] < 30 ? '#F44336' : need.color,
                  transition: 'width 0.5s ease',
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">📊 Kỹ năng</h6>
          <div className="row g-2">
            {Object.entries(SKILL_META).map(([key, meta]) => {
              const val = activePet.skills[key] || 0;
              const lvl = getSkillLevel(val);
              return (
                <div className="col-6" key={key}>
                  <div className="text-center p-2 rounded" style={{ background: meta.color + '15' }}>
                    <div className="fs-4">{meta.icon}</div>
                    <div className="fw-bold small" style={{ color: meta.color }}>Lv.{lvl}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{meta.name}</div>
                    <div className="progress mt-1" style={{ height: 4 }}>
                      <div className="progress-bar" style={{ width: `${Math.min(100, (val % 50) * 2)}%`, backgroundColor: meta.color }}></div>
                    </div>
                    <div style={{ fontSize: '0.65rem' }} className="text-muted">{val} pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Quests */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">📋 Nhiệm vụ hàng ngày {allDailyDone && <span className="badge bg-success ms-1">Hoàn thành!</span>}</h6>
          {dailyStatus.map((q) => (
            <div key={q.id} className={`d-flex align-items-center gap-2 p-2 rounded mb-2 ${q.done ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
              <span>{q.done ? '✅' : '⬜'}</span>
              <div className="flex-grow-1">
                <div className="small fw-bold">{q.title}</div>
                <div style={{ fontSize: '0.72rem' }} className="text-muted">{q.desc}</div>
              </div>
              {q.canClaim ? (
                <button className="btn btn-sm btn-warning" onClick={() => completeDailyQuest(q.id)}>
                  +{q.reward}🪙
                </button>
              ) : (
                <span className="badge bg-light text-muted">{q.reward}🪙</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Link to="/lessons" className="card text-center shadow-sm h-100 card-hover text-decoration-none">
            <div className="card-body py-3">
              <div className="fs-2">🎓</div>
              <div className="small fw-bold text-dark">Học bài</div>
              <div style={{ fontSize: '0.7rem' }} className="text-muted">+🍎 +Skills</div>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/practice" className="card text-center shadow-sm h-100 card-hover text-decoration-none">
            <div className="card-body py-3">
              <div className="fs-2">🎮</div>
              <div className="small fw-bold text-dark">Luyện tập</div>
              <div style={{ fontSize: '0.7rem' }} className="text-muted">+😊 +Skills</div>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/collection" className="card text-center shadow-sm h-100 card-hover text-decoration-none">
            <div className="card-body py-3">
              <div className="fs-2">📦</div>
              <div className="small fw-bold text-dark">Bộ sưu tập</div>
              <div style={{ fontSize: '0.7rem' }} className="text-muted">{Object.keys(petData.collection).length}/{Object.keys(PET_REGISTRY).length} pet</div>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/shop" className="card text-center shadow-sm h-100 card-hover text-decoration-none">
            <div className="card-body py-3">
              <div className="fs-2">🛍️</div>
              <div className="small fw-bold text-dark">Cửa hàng</div>
              <div style={{ fontSize: '0.7rem' }} className="text-muted">{petData.coins}🪙</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
