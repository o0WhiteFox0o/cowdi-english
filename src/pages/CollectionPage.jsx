import { useState, useMemo } from 'react';
import { usePet } from '../hooks/usePet';
import { useUser } from '../hooks/useUser';
import {
  PET_REGISTRY, getPetEvolution, calculatePowerScore, getSkillLevel,
  checkUnlockCondition, SKILL_META, ELEMENT_COLORS, RARITY_COLORS,
} from '../data/pets';

const RARITY_ORDER = ['starter', 'common', 'rare', 'epic', 'legendary', 'event'];

export default function CollectionPage() {
  const { petData, switchActivePet, unlockPet, renamePet } = usePet();
  const { userData } = useUser();
  const [selected, setSelected] = useState(null);

  const allSpecies = useMemo(() => Object.values(PET_REGISTRY), []);
  const ownedSpecies = useMemo(() => {
    const map = {};
    for (const [id, pet] of Object.entries(petData.collection)) {
      map[pet.speciesId] = { instanceId: id, ...pet };
    }
    return map;
  }, [petData.collection]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const sp of allSpecies) {
      if (!groups[sp.rarity]) groups[sp.rarity] = [];
      groups[sp.rarity].push(sp);
    }
    return groups;
  }, [allSpecies]);

  const collectionCount = Object.keys(petData.collection).length;
  const totalPets = allSpecies.length;
  const pct = Math.round((collectionCount / totalPets) * 100);

  function handleUnlock(speciesId) {
    const ok = unlockPet(speciesId);
    if (ok) setSelected(speciesId);
  }

  function handleSetActive(instanceId) {
    switchActivePet(instanceId);
  }

  // Detail modal
  const selectedSpecies = selected ? PET_REGISTRY[selected] : null;
  const selectedOwned = selected ? ownedSpecies[selected] : null;

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">📦 Bộ sưu tập Pet</h2>
        <p className="text-muted">{collectionCount}/{totalPets} pet đã mở khóa</p>
        <div className="progress mx-auto mb-2" style={{ maxWidth: 400, height: 10 }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${pct}%` }}></div>
        </div>
        {collectionCount < 17 && (
          <small className="text-muted">Thu thập tất cả pet để mở khóa Draco! 🐲</small>
        )}
      </div>

      {/* Grid by rarity */}
      {RARITY_ORDER.map((rarity) => {
        const pets = grouped[rarity];
        if (!pets || pets.length === 0) return null;
        const rc = RARITY_COLORS[rarity];
        return (
          <div key={rarity} className="mb-4">
            <h6 className="fw-bold mb-2" style={{ color: rc.text }}>{rc.name}</h6>
            <div className="row g-2">
              {pets.map((sp) => {
                const owned = ownedSpecies[sp.id];
                const isActive = owned && petData.activePetId === owned.instanceId;
                const canUnlock = !owned && checkUnlockCondition(sp.unlockCondition, userData, petData);
                const evo = owned ? getPetEvolution(sp.id, owned.totalXpEarned) : null;
                const power = owned ? calculatePowerScore(owned, sp) : 0;

                return (
                  <div className="col-6 col-md-4 col-lg-3" key={sp.id}>
                    <div
                      className={`card h-100 shadow-sm card-hover ${isActive ? 'border-warning border-2' : owned ? 'border-success' : ''}`}
                      style={{ cursor: 'pointer', opacity: owned ? 1 : 0.6 }}
                      onClick={() => setSelected(sp.id)}
                    >
                      <div className="card-body text-center py-3">
                        {owned && evo?.image ? (
                          <div className="mb-1">
                            <img src={evo.image} alt={sp.name} className="collection-pet-img" />
                          </div>
                        ) : (
                          <div className="fs-1 mb-1">{owned ? (evo?.emoji || sp.emoji) : '🔒'}</div>
                        )}
                        <div className="fw-bold small">{sp.name}</div>
                        <div style={{ fontSize: '0.7rem' }} className="text-muted">{sp.species}</div>
                        {owned ? (
                          <>
                            <div className="mt-1">
                              {isActive && <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>⭐ Active</span>}
                              {!isActive && <span className="badge bg-light text-muted" style={{ fontSize: '0.65rem' }}>💤 Resting</span>}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                              {evo?.name} · ⚡{power}
                            </div>
                          </>
                        ) : (
                          <div className="mt-1">
                            <span className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>
                              {getConditionText(sp.unlockCondition)}
                            </span>
                            {canUnlock && <div className="text-success fw-bold" style={{ fontSize: '0.7rem' }}>✅ Có thể mở!</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Detail Modal */}
      {selectedSpecies && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelected(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ background: ELEMENT_COLORS[selectedSpecies.element]?.bg }}>
                <h5 className="modal-title fw-bold">
                  {selectedSpecies.emoji} {selectedSpecies.name}
                </h5>
                <button className="btn-close" onClick={() => setSelected(null)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  {selectedOwned && getPetEvolution(selected, selectedOwned.totalXpEarned)?.image ? (
                    <img
                      src={getPetEvolution(selected, selectedOwned.totalXpEarned).image}
                      alt={selectedSpecies.name}
                      className="collection-modal-pet-img"
                    />
                  ) : (
                    <div style={{ fontSize: '4rem' }}>
                      {selectedOwned ? (getPetEvolution(selected, selectedOwned.totalXpEarned)?.emoji || selectedSpecies.emoji) : '🔒'}
                    </div>
                  )}
                  <div className="d-flex justify-content-center gap-1 mt-1">
                    <span className="badge" style={{ background: ELEMENT_COLORS[selectedSpecies.element]?.bg, color: ELEMENT_COLORS[selectedSpecies.element]?.text }}>
                      {ELEMENT_COLORS[selectedSpecies.element]?.name}
                    </span>
                    <span className="badge" style={{ background: RARITY_COLORS[selectedSpecies.rarity]?.bg, color: RARITY_COLORS[selectedSpecies.rarity]?.text }}>
                      {RARITY_COLORS[selectedSpecies.rarity]?.name}
                    </span>
                  </div>
                </div>
                <p className="text-muted small text-center">{selectedSpecies.description}</p>

                {/* Base stats */}
                <h6 className="fw-bold small">Chỉ số gốc</h6>
                <div className="row g-1 mb-3">
                  {Object.entries(SKILL_META).map(([key, meta]) => (
                    <div className="col-3 text-center" key={key}>
                      <div>{meta.icon}</div>
                      <div className="fw-bold small" style={{ color: meta.color }}>{selectedSpecies.baseStats[key]}</div>
                      <div style={{ fontSize: '0.6rem' }} className="text-muted">{meta.name}</div>
                    </div>
                  ))}
                </div>

                {selectedOwned ? (
                  <>
                    {/* Current skills */}
                    <h6 className="fw-bold small">Kỹ năng hiện tại</h6>
                    <div className="row g-1 mb-3">
                      {Object.entries(SKILL_META).map(([key, meta]) => (
                        <div className="col-3 text-center" key={key}>
                          <div>{meta.icon}</div>
                          <div className="fw-bold small" style={{ color: meta.color }}>Lv.{getSkillLevel(selectedOwned.skills[key] || 0)}</div>
                          <div style={{ fontSize: '0.6rem' }} className="text-muted">{selectedOwned.skills[key] || 0} pts</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-muted small mb-3">
                      ⚡ Power: {calculatePowerScore(selectedOwned, selectedSpecies)}
                    </div>

                    {/* Actions */}
                    {petData.activePetId !== selectedOwned.instanceId ? (
                      <button className="btn btn-cowdi-primary w-100" onClick={() => { handleSetActive(selectedOwned.instanceId); setSelected(null); }}>
                        ⭐ Chọn làm Active Pet
                      </button>
                    ) : (
                      <div className="text-center text-success fw-bold">⭐ Đang là Active Pet</div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <div className="mb-2 text-muted small">
                      Điều kiện: {getConditionText(selectedSpecies.unlockCondition)}
                    </div>
                    {checkUnlockCondition(selectedSpecies.unlockCondition, userData, petData) ? (
                      <button className="btn btn-success w-100" onClick={() => handleUnlock(selected)}>
                        🔓 Mở khóa ngay!
                      </button>
                    ) : (
                      <button className="btn btn-secondary w-100" disabled>🔒 Chưa đủ điều kiện</button>
                    )}
                  </div>
                )}

                {/* Evolution stages */}
                <h6 className="fw-bold small mt-3">Giai đoạn tiến hóa</h6>
                <div className="d-flex gap-1 flex-wrap">
                  {selectedSpecies.evolutions.map((evo) => {
                    const reached = selectedOwned && selectedOwned.totalXpEarned >= evo.xp;
                    return (
                      <div key={evo.stage} className={`text-center p-1 rounded flex-fill ${reached ? 'bg-success bg-opacity-10' : 'bg-light'}`} style={{ minWidth: 55 }}>
                        {reached && evo.image ? (
                          <img src={evo.image} alt={evo.name} className="collection-evo-thumb" />
                        ) : (
                          <div>{reached ? evo.emoji : '❓'}</div>
                        )}
                        <div style={{ fontSize: '0.6rem' }} className={reached ? 'fw-bold' : 'text-muted'}>{evo.name}</div>
                        <div style={{ fontSize: '0.55rem' }} className="text-muted">{evo.xp} XP</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getConditionText(condition) {
  if (!condition) return 'Starter';
  switch (condition.type) {
    case 'xp': return `Đạt ${condition.value} XP`;
    case 'lessons': return `Hoàn thành ${condition.value} bài`;
    case 'words': return `Học ${condition.value} từ`;
    case 'streak': return `Streak ${condition.value} ngày`;
    case 'quizzes': return `${condition.value} quiz${condition.category ? ` ${condition.category}` : ''}`;
    case 'perfectQuizzes': return `${condition.value} perfect quiz`;
    case 'collection': return `Sở hữu ${condition.value} pet`;
    case 'collection_species': {
      const names = condition.value.map((id) => PET_REGISTRY[id]?.name || id).join(', ');
      return `Sưu tầm: ${names}`;
    }
    case 'event': return `Sự kiện ${condition.eventId}`;
    default: return '???';
  }
}
