import { useState, useMemo, useRef, useEffect } from 'react';
import { useSEO } from '../../hooks/useSEO';
import { SEO_CONFIGS } from '../../data/seo-config';
import { Link } from 'react-router-dom';
import { usePet } from '../../hooks/usePet';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import {
  PET_REGISTRY, getEvolutionInfo, calculatePowerScore, getSkillLevel,
  getPetMood, getPetMessage, SKILL_META, ELEMENT_COLORS, RARITY_COLORS,
  DAILY_QUESTS, SHOP_ITEMS, COWDI_IMAGES,
} from '../../data/pets';
import { CURRENCIES } from '../../../shared/game-config.js';
import { COSMETIC_MAP } from '../../../shared/cosmetics-data.js';
import { computeStats, computePowerScore, canEvolve } from '../../../shared/battle-engine.js';
import { PetAvatar, bondOf, topSkillOf } from '../../pet-rig/PetAvatar';
import EvolutionAnimation from './EvolutionAnimation';
import InviteSheet from '../invite/InviteSheet';
import Icon, { SKILL_ICON } from '../../components/Icon';
import Emoji, { EmojiText } from '../../components/Emoji';
import { BATTLE_STAT_ICONS, SKILL_IMAGE_ICONS } from './CollectionPage';

export default function PetPage() {
  useSEO(SEO_CONFIGS['/pet']);
  const { petData, getActivePetWithDecay, feedPet, renamePet, useFood, completeDailyQuest, addCoins, evolvePet } = usePet();
  const { userData, refreshWallet } = useUser();
  const { user } = useAuth();
  const showToast = useToast();
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [evolving, setEvolving] = useState(false);
  const petAvatarRef = useRef(null);

  // Evolution animation flow:
  //  evoEvent = { stage: 'animation' | 'result', oldEvo, newEvo, petName }
  const [evoEvent, setEvoEvent] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePrefill, setSharePrefill] = useState('');

  const activePet = getActivePetWithDecay();
  const activePetId = petData.activePetId || activePet?.instanceId || 'cowdi_1';
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evolution = activePet && species ? getEvolutionInfo(activePet.speciesId, activePet.evolution) : null;
  const nextEvo = species && evolution ? species.evolutions[evolution.stage + 1] || null : null;
  const battleStats = activePet ? computeStats(activePet) : null;
  const power = activePet ? computePowerScore(activePet) : 0;
  const mood = activePet ? getPetMood(activePet.needs) : 'happy';
  const message = species ? getPetMessage(activePet.speciesId, mood) : '';

  const walletForEvo = userData.wallet || { milk: userData.availableXP || 0, gem: 0, stone: 0 };
  const evoCheck = activePet ? canEvolve(activePet, walletForEvo) : { ok: false, checks: [] };

  async function handleEvolve() {
    if (!evoCheck.ok || evolving || !petData.activePetId) return;
    setEvolving(true);
    try {
      const res = await evolvePet(petData.activePetId);
      if (res.ok) {
        if (refreshWallet) await refreshWallet();
        setEvoEvent({
          stage: 'animation',
          oldEvo: evolution,
          newEvo: nextEvo,
          petName: activePet.customName,
        });
        showToast('Tiến hóa thành công! 🎉', 'success');
      } else {
        showToast(res.error || 'Tiến hóa thất bại.', 'danger');
      }
    } catch {
      showToast('Lỗi mạng khi tiến hóa.', 'danger');
    } finally {
      setEvolving(false);
    }
  }

  function openShareForEvo() {
    if (!evoEvent) return;
    const msg = `Cowdi của mình vừa tiến hóa thành ${evoEvent.newEvo?.name || 'pet mới'}! 🎉\nHọc tiếng Anh chung cho vui nha 🐾`;
    setSharePrefill(msg);
    setEvoEvent(null);
    setShareOpen(true);
  }

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

  // Phát sự kiện tiến hoá khi cấp tiến hoá của pet tăng hoặc animation tiến hoá kích hoạt
  const prevEvoRef = useRef(activePet?.evolution);
  useEffect(() => {
    if (!activePet) return;
    if (prevEvoRef.current != null && activePet.evolution > prevEvoRef.current) {
      petAvatarRef.current?.emit('evolve_ok', { stage: activePet.evolution + 1 });
    }
    prevEvoRef.current = activePet.evolution;
  }, [activePet?.evolution]);

  useEffect(() => {
    if (evoEvent?.stage === 'animation' && evoEvent.newEvo) {
      const nextStage = (evoEvent.newEvo.stage ?? (activePet?.evolution || 0)) + 1;
      petAvatarRef.current?.emit('evolve_ok', { stage: nextStage });
    }
  }, [evoEvent]);

  function handleFeedFood(item) {
    if (!item || !activePet) return;
    if (useFood(item.id)) {
      petAvatarRef.current?.emit('feed');
      showToast(`${activePet.customName} rất thích ${item.name}!`, 'success');
    }
  }

  if (!activePet || !species) {
    return (
      <div className="text-center py-5 fade-in">
        <div style={{ fontSize: '5rem' }} className="emoji-big"><Icon name="egg" size={96} /></div>
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
          <span className="me-2"><Icon name="paw" size={32} /></span>Pet của bạn
        </h2>
      </div>

      {/* Pet Display Card */}
      <div className="pet-display-card mb-4">
        {/* Pet Stage with Image */}
        <div
          className={`pet-stage-container ${mood}`}
          style={{
            background: activePet.cosmetics?.room
              ? (COSMETIC_MAP[activePet.cosmetics.room]?.bgStyle || SHOP_ITEMS.find(i => i.id === activePet.cosmetics.room)?.bgStyle || undefined)
              : undefined,
            transition: 'background 0.3s ease',
          }}
        >
          {/* Floating decorations */}
          <div className="pet-floating-decor">
            {activePet.cosmetics?.effect && (
              <span className="pet-effect-icon">
                <Emoji e={COSMETIC_MAP[activePet.cosmetics.effect]?.emoji || SHOP_ITEMS.find(i => i.id === activePet.cosmetics.effect)?.emoji || ''} size={30} />
              </span>
            )}
          </div>

          {/* Hat */}
          {activePet.cosmetics?.hat && (
            <div className="pet-hat-img"><Emoji e={SHOP_ITEMS.find(i => i.id === activePet.cosmetics.hat)?.emoji || ''} size={42} /></div>
          )}

          {/* Pet Avatar (live rig nếu đã duyệt, ảnh tĩnh nếu chưa duyệt) */}
          <div className="pet-image-wrapper">
            <PetAvatar
              ref={petAvatarRef}
              petId={activePet.speciesId}
              stage={(activePet.evolution || 0) + 1}
              group={species.group}
              bond={bondOf(activePet.skills)}
              topSkill={topSkillOf(activePet.skills)}
              mode="home"
              fallbackSrc={evolution?.image}
              alt={evolution?.name || activePet.customName}
              className="pet-character-img"
            />
          </div>

          {/* Outfit */}
          {activePet.cosmetics?.outfit && (
            <div className="pet-outfit-badge"><Emoji e={SHOP_ITEMS.find(i => i.id === activePet.cosmetics.outfit)?.emoji || ''} size={28} /></div>
          )}

          {/* Mood indicator */}
          <div className="pet-mood-indicator">
            <Icon name={mood === 'happy' ? 'smile' : mood === 'sad' ? 'sad' : 'sick'} size={26} />
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
                <button className="btn btn-sm btn-link text-muted ms-1" onClick={() => { setRenaming(true); setNameInput(activePet.customName); }} title="Đổi tên"><Icon name="pencil" size={16} /></button>
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
            <span className="pet-badge pet-badge-power"><Icon name="bolt" size={14} /> {power}</span>
          </div>

          <div className="pet-evolution-label">{evolution?.name || 'Trứng'}</div>

          {/* Chat bubble */}
          <div className="pet-speech-bubble">
            <div className="pet-speech-arrow"></div>
            <p className="mb-0"><EmojiText>{message}</EmojiText></p>
          </div>
        </div>
      </div>

      {/* 4 Chỉ số chiến đấu v2 */}
      {battleStats && (
        <div className="pet-section-card mb-3">
          <div className="pet-section-header">
            <span className="pet-section-icon"><Icon name="bolt" size={22} /></span>
            <span>Chỉ số chiến đấu</span>
            <span className="badge bg-primary ms-auto">Lực chiến: {power}</span>
          </div>
          <div className="row g-2 text-center">
            <div className="col-6 col-sm-3">
              <div className="p-2 border rounded bg-light d-flex flex-column align-items-center">
                <img src={BATTLE_STAT_ICONS.hp} alt="HP" style={{ width: 24, height: 24, objectFit: 'contain' }} className="mb-1" />
                <div className="small text-muted fw-bold">HP</div>
                <div className="fs-5 fw-bold text-success">{battleStats.hp}</div>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2 border rounded bg-light d-flex flex-column align-items-center">
                <img src={BATTLE_STAT_ICONS.atk} alt="ATK" style={{ width: 24, height: 24, objectFit: 'contain' }} className="mb-1" />
                <div className="small text-muted fw-bold">ATK</div>
                <div className="fs-5 fw-bold text-danger">{battleStats.atk}</div>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2 border rounded bg-light d-flex flex-column align-items-center">
                <img src={BATTLE_STAT_ICONS.def} alt="DEF" style={{ width: 24, height: 24, objectFit: 'contain' }} className="mb-1" />
                <div className="small text-muted fw-bold">DEF</div>
                <div className="fs-5 fw-bold text-primary">{battleStats.def.toFixed(1)}</div>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2 border rounded bg-light d-flex flex-column align-items-center">
                <img src={BATTLE_STAT_ICONS.agi} alt="AGI" style={{ width: 24, height: 24, objectFit: 'contain' }} className="mb-1" />
                <div className="small text-muted fw-bold">AGI</div>
                <div className="fs-5 fw-bold text-warning">{battleStats.agi.toFixed(1)}</div>
              </div>
            </div>
          </div>
          <div className="small text-muted text-center mt-2">
            Sát thương chí mạng: <span className="fw-bold">×{battleStats.critMult.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Evolution Progress & Evolve Button (v2) */}
      {nextEvo ? (
        <div className="pet-section-card mb-3">
          <div className="pet-section-header">
            <span className="pet-section-icon"><Icon name="sparkle" size={22} /></span>
            <span>Tiến hóa tiếp theo: {nextEvo.name}</span>
          </div>
          <div className="pet-evo-preview d-flex align-items-center gap-3 mb-3">
            {nextEvo.image ? (
              <img src={nextEvo.image} alt={nextEvo.name} className="pet-evo-next-img" style={{ width: 64, height: 64, objectFit: 'contain' }} />
            ) : (
              <span className="pet-evo-next-emoji"><Emoji e={nextEvo.emoji} size={48} /></span>
            )}
            <div>
              <div className="fw-bold fs-5">{nextEvo.name}</div>
              <div className="small text-muted">Cấp {evolution?.stage ?? 0} → Cấp {(evolution?.stage ?? 0) + 1}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="small fw-bold text-muted mb-2">Điều kiện tiến hóa:</div>
            <div className="d-flex flex-column gap-2">
              {evoCheck.checks.map((chk, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center small p-2 rounded border bg-light">
                  <span>
                    {chk.key === 'milk' && '🥛 Sữa'}
                    {chk.key === 'gem' && '💎 Gem'}
                    {chk.key === 'stone' && '🪨 Đá nguyên tố'}
                    {chk.key === 'totalSkills' && '📚 Tổng điểm 4 kỹ năng'}
                    {chk.kind === 'skill' && `🎯 Kỹ năng ${chk.key}`}
                  </span>
                  <span className={chk.ok ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                    {chk.have} / {chk.need} {chk.ok ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`btn w-100 py-2 fw-bold ${evoCheck.ok ? 'btn-success' : 'btn-secondary'}`}
            disabled={!evoCheck.ok || evolving}
            onClick={handleEvolve}
          >
            {evolving ? 'Đang tiến hóa...' : evoCheck.ok ? '✨ Tiến hóa ngay!' : 'Chưa đủ điều kiện'}
          </button>
        </div>
      ) : (
        <div className="pet-section-card mb-3 text-center py-3">
          <span className="badge bg-warning text-dark fs-6">👑 Pet đã đạt cấp tối đa</span>
        </div>
      )}

      {/* Needs bars */}
      <div className="pet-section-card mb-3">
        <div className="pet-section-header">
          <span className="pet-section-icon"><Icon name="heart" size={22} /></span>
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
              <div className="pet-need-icon"><Emoji e={need.icon} size={26} /></div>
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
        {ownedFood.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mt-3 pt-2 border-top">
            {ownedFood.map((item) => (
              <button
                key={item.id}
                type="button"
                className="btn btn-sm btn-outline-cowdi d-inline-flex align-items-center gap-1"
                onClick={() => handleFeedFood(item)}
              >
                <Emoji e={item.emoji} size={16} /> Cho ăn {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="pet-section-card mb-3">
        <div className="pet-section-header">
          <span className="pet-section-icon"><Icon name="chart" size={22} /></span>
          <span>Kỹ năng</span>
        </div>
        <div className="pet-skills-grid">
          {Object.entries(SKILL_META).map(([key, meta]) => {
            const val = activePet.skills[key] || 0;
            const lvl = getSkillLevel(val);
            return (
              <div className="pet-skill-card" key={key} style={{ '--skill-color': meta.color }}>
                <div className="pet-skill-icon">
                  {SKILL_IMAGE_ICONS[key] ? (
                    <img src={SKILL_IMAGE_ICONS[key]} alt={meta.name} style={{ width: 34, height: 34, objectFit: 'contain' }} />
                  ) : (
                    <Icon name={SKILL_ICON[key]} size={30} />
                  )}
                </div>
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
          <span className="pet-section-icon"><Icon name="clipboard" size={22} /></span>
          <span>Nhiệm vụ hàng ngày</span>
          {allDailyDone && <span className="pet-badge-done">Hoàn thành!</span>}
        </div>
        {dailyStatus.map((q) => (
          <div key={q.id} className={`pet-quest-item ${q.done ? 'done' : ''}`}>
            <span className="pet-quest-check"><Icon name={q.done ? 'check' : 'square'} size={20} /></span>
            <div className="pet-quest-info">
              <div className="pet-quest-title">{q.title}</div>
              <div className="pet-quest-desc">{q.desc}</div>
            </div>
            {q.canClaim ? (
              <button className="pet-quest-claim" onClick={() => completeDailyQuest(q.id)}>
                +{q.reward} 🥛 Sữa
              </button>
            ) : (
              <span className="pet-quest-reward">+{q.reward} 🥛</span>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pet-quick-actions">
        <Link to={user?.is_admin ? "/lessons" : "/"} className="pet-action-card">
          <div className="pet-action-icon"><Icon name="grad" size={36} /></div>
          <div className="pet-action-label">Học bài</div>
          <div className="pet-action-hint">+<Icon name="apple" size={12} /> +Skills</div>
        </Link>
        <Link to="/practice" className="pet-action-card">
          <div className="pet-action-icon"><Icon name="gamepad" size={36} /></div>
          <div className="pet-action-label">Luyện tập</div>
          <div className="pet-action-hint">+<Icon name="smile" size={12} /> +Skills</div>
        </Link>
        <Link to="/collection" className="pet-action-card">
          <div className="pet-action-icon"><Icon name="box" size={36} /></div>
          <div className="pet-action-label">Bộ sưu tập</div>
          <div className="pet-action-hint">{Object.keys(petData.collection).length}/{Object.keys(PET_REGISTRY).length} pet</div>
        </Link>
        <Link to={`/shop?from=pet&pet=${activePetId}`} className="pet-action-card">
          <div className="pet-action-icon"><Icon name="bag" size={36} /></div>
          <div className="pet-action-label">Cửa hàng</div>
          <div className="pet-action-hint">🥛 {(userData.wallet?.milk || userData.availableXP || 0).toLocaleString('vi-VN')}</div>
        </Link>
      </div>

      {/* Pokemon-style evolution animation */}
      {evoEvent?.stage === 'animation' && (
        <EvolutionAnimation
          oldEvo={evoEvent.oldEvo}
          newEvo={evoEvent.newEvo}
          petName={evoEvent.petName}
          onComplete={() => setEvoEvent((e) => e ? { ...e, stage: 'result' } : e)}
          onSkip={()    => setEvoEvent((e) => e ? { ...e, stage: 'result' } : e)}
        />
      )}

      {/* Evolution result modal with share */}
      {evoEvent?.stage === 'result' && (
        <div className="cowdi-evo-result-overlay" role="dialog">
          <div className="cowdi-evo-result-card">
            <div className="cowdi-evo-result-title"><Icon name="party" size={24} /> {evoEvent.petName} vừa tiến hóa!</div>
            <div className="cowdi-evo-result-pet">
              {evoEvent.newEvo?.image ? (
                <img src={evoEvent.newEvo.image} alt={evoEvent.newEvo.name} />
              ) : (
                <span style={{ fontSize: '6rem' }} className="emoji-big"><Emoji e={evoEvent.newEvo?.emoji || '✨'} size={96} /></span>
              )}
            </div>
            <div className="cowdi-evo-result-name">{evoEvent.newEvo?.name}</div>
            <div className="cowdi-evo-result-actions">
              <button type="button" className="btn btn-cowdi-primary fw-bold" onClick={openShareForEvo}>
                <Icon name="gift" size={18} /> Khoe & mời bạn
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setEvoEvent(null)}>
                Đóng
              </button>
            </div>
          </div>
          <style>{`
            .cowdi-evo-result-overlay {
              position: fixed; inset: 0; z-index: 1201;
              background: rgba(10, 6, 20, 0.78);
              display: flex; align-items: center; justify-content: center;
              padding: 20px;
              animation: cowdiEvoResultIn 0.3s ease-out;
            }
            @keyframes cowdiEvoResultIn { from { opacity: 0; } to { opacity: 1; } }
            .cowdi-evo-result-card {
              background: linear-gradient(180deg, #fff 0%, #fff7e3 100%);
              border-radius: 20px;
              padding: 28px 24px;
              max-width: 360px; width: 100%;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,215,100,0.4);
              animation: cowdiEvoResultPop 0.45s cubic-bezier(.2,1.4,.4,1);
            }
            @keyframes cowdiEvoResultPop {
              0%   { transform: scale(0.7) translateY(20px); opacity: 0; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            .cowdi-evo-result-title {
              font-size: 1.15rem; font-weight: 700; color: #6a3d00;
              margin-bottom: 14px;
            }
            .cowdi-evo-result-pet {
              width: 180px; height: 180px; margin: 0 auto 12px;
              display: flex; align-items: center; justify-content: center;
              background: radial-gradient(circle, #fffbe4 0%, transparent 70%);
            }
            .cowdi-evo-result-pet img {
              width: 100%; height: 100%; object-fit: contain;
              filter: drop-shadow(0 6px 14px rgba(0,0,0,0.2));
              animation: cowdiEvoResultBob 2s ease-in-out infinite;
            }
            @keyframes cowdiEvoResultBob {
              0%, 100% { transform: translateY(0); }
              50%      { transform: translateY(-8px); }
            }
            .cowdi-evo-result-name {
              font-size: 1.4rem; font-weight: 800;
              background: linear-gradient(90deg, #ff8c42, #ff5e62);
              -webkit-background-clip: text; background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 18px;
            }
            .cowdi-evo-result-actions {
              display: flex; flex-direction: column; gap: 10px;
            }
            .cowdi-evo-result-actions .btn { padding: 10px 18px; border-radius: 12px; }
          `}</style>
        </div>
      )}

      {/* Share sheet (pre-filled with evolution message) */}
      <InviteSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        prefilledMessage={sharePrefill}
      />
    </div>
  );
}
