import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePet } from '../../hooks/usePet';
import { useUser } from '../../hooks/useUser';
import { useToast } from '../../components/Toast';
import {
  PET_REGISTRY, getPetEvolution, calculatePowerScore, getSkillLevel,
  getPetMood, getPetMessage, SKILL_META, ELEMENT_COLORS, RARITY_COLORS,
  DAILY_QUESTS, SHOP_ITEMS, COWDI_IMAGES,
} from '../../data/pets';

export default function PetPage() {
  const { petData, getActivePetWithDecay, feedPet, renamePet, useFood, completeDailyQuest, addCoins, feedXPToPet } = usePet();
  const { userData } = useUser();
  const showToast = useToast();
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
      <div className="pet-display-card mb-4">
        {/* Pet Stage with Image */}
        <div className={`pet-stage-container ${mood}`}>
          {/* Floating decorations */}
          <div className="pet-floating-decor">
            {activePet.cosmetics?.effect && (
              <span className="pet-effect-icon">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.effect)?.emoji || ''}</span>
            )}
          </div>

          {/* Hat */}
          {activePet.cosmetics?.hat && (
            <div className="pet-hat-img">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.hat)?.emoji || ''}</div>
          )}

          {/* Pet Image or Emoji */}
          <div className="pet-image-wrapper">
            {evolution?.image ? (
              <img
                src={evolution.image}
                alt={evolution.name}
                className="pet-character-img"
                draggable={false}
              />
            ) : (
              <div className="pet-emoji-fallback">{evolution?.emoji || species.emoji}</div>
            )}
          </div>

          {/* Outfit */}
          {activePet.cosmetics?.outfit && (
            <div className="pet-outfit-badge">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.outfit)?.emoji || ''}</div>
          )}

          {/* Mood indicator */}
          <div className="pet-mood-indicator">
            {mood === 'happy' ? '😊' : mood === 'sad' ? '😢' : '🤒'}
          </div>
        </div>

        {/* Pet Info Section */}
        <div className="pet-info-section">
          {/* Name */}
          <div className="pet-name-area">
            {renaming ? (
              <div className="d-flex justify-content-center gap-2">
                <input
                  type="text" className="form-control form-control-sm pet-name-input"
                  value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  maxLength={20} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
                <button className="btn btn-sm btn-cowdi-primary" onClick={handleRename}>✓</button>
              </div>
            ) : (
              <h3 className="pet-name">
                {activePet.customName}
                <button className="btn btn-sm btn-link text-muted ms-1" onClick={() => { setRenaming(true); setNameInput(activePet.customName); }} title="Đổi tên">✏️</button>
              </h3>
            )}
          </div>

          {/* Badges */}
          <div className="pet-badges">
            <span className="pet-badge" style={{ background: ELEMENT_COLORS[species.element]?.bg, color: ELEMENT_COLORS[species.element]?.text }}>
              {ELEMENT_COLORS[species.element]?.name}
            </span>
            <span className="pet-badge" style={{ background: RARITY_COLORS[species.rarity]?.bg, color: RARITY_COLORS[species.rarity]?.text }}>
              {RARITY_COLORS[species.rarity]?.name}
            </span>
            <span className="pet-badge pet-badge-power">⚡ {power}</span>
          </div>

          <div className="pet-evolution-label">{evolution?.name || 'Trứng'}</div>

          {/* Chat bubble */}
          <div className="pet-speech-bubble">
            <div className="pet-speech-arrow"></div>
            <p className="mb-0">{message}</p>
          </div>
        </div>
      </div>

      {/* Evolution Progress */}
      {nextEvo && (
        <div className="pet-section-card mb-3">
          <div className="pet-section-header">
            <span className="pet-section-icon">⚡</span>
            <span>Tiến hóa tiếp theo</span>
          </div>
          <div className="pet-evo-preview">
            {nextEvo.image ? (
              <img src={nextEvo.image} alt={nextEvo.name} className="pet-evo-next-img" />
            ) : (
              <span className="pet-evo-next-emoji">{nextEvo.emoji}</span>
            )}
            <span className="pet-evo-next-name">{nextEvo.name}</span>
          </div>
          <div className="pet-progress-bar">
            <div className="pet-progress-fill" style={{
              width: `${Math.min(100, ((activePet.totalXpEarned - (evolution?.xp || 0)) / (nextEvo.xp - (evolution?.xp || 0))) * 100)}%`
            }}></div>
          </div>
          <div className="pet-progress-text">{activePet.totalXpEarned} / {nextEvo.xp} XP</div>
        </div>
      )}

      {/* Feed XP – user tiêu XP đã kiếm được để tiến hóa Pet */}
      <div className="pet-section-card mb-3">
        <div className="pet-section-header">
          <span className="pet-section-icon">✨</span>
          <span>Cho Pet ăn XP</span>
          <span className="pet-badge ms-auto" style={{ background: '#FFF3CD', color: '#856404' }}>
            ⭐ Ví: {userData.availableXP || 0}
          </span>
        </div>
        <div className="text-muted small mb-2">
          XP bạn kiếm được qua học tập có thể “cho Pet ăn” để trực tiếp tăng tiến độ tiến hóa (1 XP = 1 điểm tiến hóa).
          Tổng XP sự nghiệp (lên cấp user / bảng xếp hạng) vẫn được giữ nguyên.
        </div>
        <div className="d-flex flex-wrap gap-2">
          {[50, 200, 500].map((amt) => (
            <button
              key={amt}
              type="button"
              className="btn btn-sm btn-warning fw-bold"
              disabled={(userData.availableXP || 0) < amt}
              onClick={() => {
                const r = feedXPToPet(amt);
                if (!r.ok) {
                  showToast('Không đủ XP trong ví!', 'warning');
                  return;
                }
                if (r.evolved) {
                  showToast(`🎉 Pet đã tiến hóa lên stage ${r.newEvoStage}!`, 'success');
                } else {
                  showToast(`+${amt} XP cho Pet`, 'success');
                }
              }}
            >
              +{amt} XP
            </button>
          ))}
          {nextEvo && (userData.availableXP || 0) >= (nextEvo.xp - (activePet.totalXpEarned || 0)) && (
            <button
              type="button"
              className="btn btn-sm btn-success fw-bold"
              onClick={() => {
                const need = nextEvo.xp - (activePet.totalXpEarned || 0);
                const r = feedXPToPet(need);
                if (r.ok && r.evolved) {
                  showToast(`🎉 Pet tiến hóa thành ${nextEvo.name}!`, 'success');
                }
              }}
            >
              🚀 Tiến hóa ngay ({nextEvo.xp - (activePet.totalXpEarned || 0)} XP)
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-warning fw-bold"
            disabled={(userData.availableXP || 0) <= 0}
            onClick={() => {
              const all = userData.availableXP || 0;
              const r = feedXPToPet(all);
              if (r.ok) {
                showToast(r.evolved
                  ? `🎉 +${all} XP – Pet tiến hóa lên stage ${r.newEvoStage}!`
                  : `+${all} XP cho Pet`, 'success');
              }
            }}
          >
            Tiêu tất cả ({userData.availableXP || 0})
          </button>
        </div>
      </div>

      {/* Needs bars */}
      <div className="pet-section-card mb-3">
        <div className="pet-section-header">
          <span className="pet-section-icon">💗</span>
          <span>Trạng thái</span>
        </div>
        <div className="pet-needs-grid">
          {[
            { key: 'energy', icon: '🍎', label: 'Năng lượng', color: '#4CAF50', gradient: 'linear-gradient(90deg, #66BB6A, #43A047)' },
            { key: 'happiness', icon: '😊', label: 'Vui vẻ', color: '#FFC107', gradient: 'linear-gradient(90deg, #FFD54F, #FFC107)' },
            { key: 'health', icon: '💤', label: 'Sức khỏe', color: '#EF5350', gradient: 'linear-gradient(90deg, #EF5350, #E53935)' },
            { key: 'knowledge', icon: '📚', label: 'Kiến thức', color: '#AB47BC', gradient: 'linear-gradient(90deg, #CE93D8, #AB47BC)' },
          ].map((need) => (
            <div key={need.key} className="pet-need-item">
              <div className="pet-need-icon">{need.icon}</div>
              <div className="pet-need-info">
                <div className="pet-need-label">
                  <span>{need.label}</span>
                  <span className={activePet.needs[need.key] < 30 ? 'pet-need-critical' : ''}>
                    {activePet.needs[need.key]}%
                  </span>
                </div>
                <div className="pet-need-bar">
                  <div className="pet-need-fill" style={{
                    width: `${activePet.needs[need.key]}%`,
                    background: activePet.needs[need.key] < 30 ? '#EF5350' : need.gradient,
                  }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="pet-section-card mb-3">
        <div className="pet-section-header">
          <span className="pet-section-icon">📊</span>
          <span>Kỹ năng</span>
        </div>
        <div className="pet-skills-grid">
          {Object.entries(SKILL_META).map(([key, meta]) => {
            const val = activePet.skills[key] || 0;
            const lvl = getSkillLevel(val);
            return (
              <div className="pet-skill-card" key={key} style={{ '--skill-color': meta.color }}>
                <div className="pet-skill-icon">{meta.icon}</div>
                <div className="pet-skill-level">Lv.{lvl}</div>
                <div className="pet-skill-name">{meta.name}</div>
                <div className="pet-skill-bar">
                  <div className="pet-skill-fill" style={{ width: `${Math.min(100, (val % 50) * 2)}%` }}></div>
                </div>
                <div className="pet-skill-pts">{val} pts</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Quests */}
      <div className="pet-section-card mb-3">
        <div className="pet-section-header">
          <span className="pet-section-icon">📋</span>
          <span>Nhiệm vụ hàng ngày</span>
          {allDailyDone && <span className="pet-badge-done">Hoàn thành!</span>}
        </div>
        {dailyStatus.map((q) => (
          <div key={q.id} className={`pet-quest-item ${q.done ? 'done' : ''}`}>
            <span className="pet-quest-check">{q.done ? '✅' : '⬜'}</span>
            <div className="pet-quest-info">
              <div className="pet-quest-title">{q.title}</div>
              <div className="pet-quest-desc">{q.desc}</div>
            </div>
            {q.canClaim ? (
              <button className="pet-quest-claim" onClick={() => completeDailyQuest(q.id)}>
                +{q.reward}🪙
              </button>
            ) : (
              <span className="pet-quest-reward">{q.reward}🪙</span>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pet-quick-actions">
        <Link to="/lessons" className="pet-action-card">
          <div className="pet-action-icon">🎓</div>
          <div className="pet-action-label">Học bài</div>
          <div className="pet-action-hint">+🍎 +Skills</div>
        </Link>
        <Link to="/practice" className="pet-action-card">
          <div className="pet-action-icon">🎮</div>
          <div className="pet-action-label">Luyện tập</div>
          <div className="pet-action-hint">+😊 +Skills</div>
        </Link>
        <Link to="/collection" className="pet-action-card">
          <div className="pet-action-icon">📦</div>
          <div className="pet-action-label">Bộ sưu tập</div>
          <div className="pet-action-hint">{Object.keys(petData.collection).length}/{Object.keys(PET_REGISTRY).length} pet</div>
        </Link>
        <Link to="/shop" className="pet-action-card">
          <div className="pet-action-icon">🛍️</div>
          <div className="pet-action-label">Cửa hàng</div>
          <div className="pet-action-hint">{petData.coins}🪙</div>
        </Link>
      </div>
    </div>
  );
}
