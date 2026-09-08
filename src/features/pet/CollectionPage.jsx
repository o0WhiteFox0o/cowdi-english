import { useState, useMemo, useEffect } from 'react';
import { usePet } from '../../hooks/usePet';
import { useUser } from '../../hooks/useUser';
import {
  PET_REGISTRY, getPetEvolution, calculatePowerScore, getSkillLevel,
  checkUnlockCondition, SKILL_META, ELEMENT_COLORS, RARITY_COLORS,
} from '../../data/pets';
import Icon, { ELEMENT_ICON, SKILL_ICON } from '../../components/Icon';

const RARITY_ORDER = ['starter', 'common', 'rare', 'epic', 'legendary', 'event'];
const RARITY_STARS = { starter: 1, common: 1, rare: 2, epic: 3, legendary: 4, event: 3 };
const MAX_STAT = 10;
const elName = (el) => (el?.name || '').replace(' 🌱', '');
const Stars = ({ n }) => (
  <span className="dex-stars">{Array.from({ length: n }, (_, i) => <Icon key={i} name="star" size={12} />)}</span>
);

/* Image with emoji fallback (some species have no artwork yet) */
function PetArt({ src, emoji, alt, className, silhouette }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  if (!src || broken) {
    return <span className={`${className} dex-emoji ${silhouette ? 'silhouette' : ''}`} role="img" aria-label={alt}>{emoji}</span>;
  }
  return (
    <img src={src} alt={alt} className={`${className} ${silhouette ? 'silhouette' : ''}`}
      loading="lazy" decoding="async" onError={() => setBroken(true)} />
  );
}

export default function CollectionPage() {
  const { petData, switchActivePet, unlockPet } = usePet();
  const { userData } = useUser();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | element | 'owned'

  /* Dex entries: numbered by rarity then registry order */
  const entries = useMemo(() => {
    const all = Object.values(PET_REGISTRY);
    const sorted = [...all].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
    return sorted.map((sp, i) => ({ ...sp, no: i + 1 }));
  }, []);

  const ownedSpecies = useMemo(() => {
    const map = {};
    for (const [id, pet] of Object.entries(petData.collection)) {
      map[pet.speciesId] = { instanceId: id, ...pet };
    }
    return map;
  }, [petData.collection]);

  const visible = useMemo(() => {
    if (filter === 'all') return entries;
    if (filter === 'owned') return entries.filter((e) => ownedSpecies[e.id]);
    return entries.filter((e) => e.element === filter);
  }, [entries, filter, ownedSpecies]);

  const ownedCount = Object.keys(ownedSpecies).length;
  const total = entries.length;
  const pct = Math.round((ownedCount / total) * 100);

  // Default selection: active pet
  useEffect(() => {
    if (selected) return;
    const active = petData.collection[petData.activePetId];
    if (active && window.matchMedia('(min-width: 992px)').matches) setSelected(active.speciesId);
  }, [petData.activePetId, petData.collection, selected]);

  const sel = selected ? entries.find((e) => e.id === selected) : null;
  const selOwned = sel ? ownedSpecies[sel.id] : null;
  const selEvo = selOwned ? getPetEvolution(sel.id, selOwned.totalXpEarned) : null;
  const selCanUnlock = sel && !selOwned && !sel.comingSoon && checkUnlockCondition(sel.unlockCondition, userData, petData);
  const isActive = selOwned && petData.activePetId === selOwned.instanceId;

  function handleUnlock(id) {
    if (unlockPet(id)) setSelected(id);
  }

  return (
    <div className="fade-in dex-page">
      {/* ── Header ── */}
      <div className="dex-head">
        <div className="dex-title">
          <span className="dex-lens"><Icon name="lens" size={40} /></span>
          <div>
            <h2 className="mb-0">Pokédex Pet</h2>
            <small className="text-muted">Sổ tay ghi chép mọi loài pet trong thế giới Cowdi</small>
          </div>
        </div>
        <div className="dex-counter">
          <div className="dex-counter-num">{String(ownedCount).padStart(2, '0')}<span>/{total}</span></div>
          <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
          <small className="text-muted">đã sở hữu · {pct}%</small>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="dex-filters">
        <button type="button" className={`dex-chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
        <button type="button" className={`dex-chip ${filter === 'owned' ? 'on' : ''}`} onClick={() => setFilter('owned')}><Icon name="star" size={16} /> Đã có</button>
        {Object.entries(ELEMENT_COLORS).map(([key, el]) => (
          <button type="button" key={key} className={`dex-chip ${filter === key ? 'on' : ''}`}
            style={{ '--c': el.text }} onClick={() => setFilter(key)}>
            <Icon name={ELEMENT_ICON[key]} size={16} /> {elName(el)}
          </button>
        ))}
      </div>

      <div className="dex-layout">
        {/* ── Grid of entries ── */}
        <div className="dex-grid">
          {visible.map((sp) => {
            const owned = ownedSpecies[sp.id];
            const evo = owned ? getPetEvolution(sp.id, owned.totalXpEarned) : null;
            const art = owned ? evo?.image : (sp.evolutions[1]?.image || sp.evolutions[0]?.image);
            const emoji = owned ? (evo?.emoji || sp.emoji) : sp.emoji;
            const active = owned && petData.activePetId === owned.instanceId;
            const canUnlock = !owned && !sp.comingSoon && checkUnlockCondition(sp.unlockCondition, userData, petData);
            const el = ELEMENT_COLORS[sp.element];
            return (
              <button
                type="button"
                key={sp.id}
                className={`dex-card ${owned ? 'owned' : 'unknown'} ${selected === sp.id ? 'selected' : ''} ${active ? 'active' : ''}`}
                style={{ '--c': el?.text, '--cbg': el?.bg }}
                onClick={() => setSelected(sp.id)}
              >
                <span className="dex-no">#{String(sp.no).padStart(3, '0')}</span>
                {active && <span className="dex-flag"><Icon name="star" size={18} /></span>}
                {canUnlock && <span className="dex-flag new">MỚI</span>}
                {sp.comingSoon && <span className="dex-flag soon">SOON</span>}
                <span className="dex-art">
                  <PetArt src={art} emoji={emoji} alt={sp.name} className="dex-art-img" silhouette={!owned} />
                </span>
                <span className="dex-name">{owned ? sp.name : sp.comingSoon ? '???' : sp.name}</span>
                <span className="dex-type"><Icon name={ELEMENT_ICON[sp.element]} size={14} /> {elName(el)}</span>
              </button>
            );
          })}
          {visible.length === 0 && (
            <div className="text-muted small p-3">Chưa có pet nào trong mục này.</div>
          )}
        </div>

        {/* ── Detail panel ── */}
        {sel && (
          <div className="dex-detail-wrap" onClick={() => setSelected(null)}>
            <aside className="dex-detail" style={{ '--c': ELEMENT_COLORS[sel.element]?.text, '--cbg': ELEMENT_COLORS[sel.element]?.bg }} onClick={(e) => e.stopPropagation()}>
              <button type="button" className="dex-close" onClick={() => setSelected(null)} aria-label="Đóng">✕</button>

              <div className="dex-screen">
                <div className="dex-screen-top">
                  <span className="dex-led" /><span className="dex-led r" /><span className="dex-led y" />
                  <span className="dex-screen-no">#{String(sel.no).padStart(3, '0')}</span>
                </div>
                <div className="dex-screen-view">
                  <PetArt
                    src={selOwned ? selEvo?.image : (sel.evolutions[1]?.image || sel.evolutions[0]?.image)}
                    emoji={selOwned ? (selEvo?.emoji || sel.emoji) : sel.emoji}
                    alt={sel.name} className="dex-screen-img" silhouette={!selOwned}
                  />
                  {!selOwned && <span className="dex-screen-lock"><Icon name={sel.comingSoon ? 'clock' : 'lock'} size={30} /></span>}
                </div>
                <div className="dex-screen-bottom">
                  <b>{sel.comingSoon && !selOwned ? '???' : (selOwned?.customName || sel.name)}</b>
                  <span>{sel.species}</span>
                </div>
              </div>

              <div className="dex-badges">
                <span className="dex-badge" style={{ background: ELEMENT_COLORS[sel.element]?.bg, color: ELEMENT_COLORS[sel.element]?.text }}>
                  <Icon name={ELEMENT_ICON[sel.element]} size={16} /> {elName(ELEMENT_COLORS[sel.element])}
                </span>
                <span className="dex-badge" style={{ background: RARITY_COLORS[sel.rarity]?.bg, color: RARITY_COLORS[sel.rarity]?.text }}>
                  <Stars n={RARITY_STARS[sel.rarity] || 1} /> {RARITY_COLORS[sel.rarity]?.name.replace(/^[⭐🎃 ]+/, '')}
                </span>
                {selOwned && <span className="dex-badge power"><Icon name="bolt" size={16} /> {calculatePowerScore(selOwned, sel)}</span>}
              </div>

              <p className="dex-desc">{sel.description}</p>

              {/* Base stats */}
              <div className="dex-section">
                <div className="dex-section-title">Chỉ số gốc</div>
                <div className="dex-stats">
                  {Object.entries(SKILL_META).map(([key, meta]) => (
                    <div className="dex-stat" key={key}>
                      <span className="dex-stat-name"><Icon name={SKILL_ICON[key]} size={16} /> {meta.name}</span>
                      <div className="book-bar"><i style={{ width: `${(sel.baseStats[key] / MAX_STAT) * 100}%`, background: meta.color }} /></div>
                      <span className="dex-stat-val">{sel.baseStats[key]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selOwned && (
                <div className="dex-section">
                  <div className="dex-section-title">Kỹ năng hiện tại</div>
                  <div className="dex-skills">
                    {Object.entries(SKILL_META).map(([key, meta]) => (
                      <div className="dex-skill" key={key} style={{ '--c': meta.color }}>
                        <span><Icon name={SKILL_ICON[key]} size={22} /></span>
                        <b>Lv.{getSkillLevel(selOwned.skills?.[key] || 0)}</b>
                        <small>{selOwned.skills?.[key] || 0} pts</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evolution chain */}
              <div className="dex-section">
                <div className="dex-section-title">Tiến hoá</div>
                <div className="dex-evo">
                  {sel.evolutions.map((evo, i) => {
                    const reached = selOwned && selOwned.totalXpEarned >= evo.xp;
                    const isNow = selEvo && selEvo.stage === evo.stage;
                    return (
                      <div key={evo.stage} className={`dex-evo-step ${reached ? 'reached' : ''} ${isNow ? 'now' : ''}`}>
                        {i > 0 && <span className="dex-evo-arrow">›</span>}
                        <div className="dex-evo-ring">
                          <PetArt src={evo.image} emoji={reached ? evo.emoji : '❓'} alt={evo.name} className="dex-evo-img" silhouette={!reached} />
                        </div>
                        <small>{evo.xp} XP</small>
                      </div>
                    );
                  })}
                </div>
                {selOwned && selEvo && (
                  <div className="text-center small text-muted mt-1">{selEvo.name} · {selOwned.totalXpEarned} XP</div>
                )}
              </div>

              {/* Action */}
              <div className="dex-action">
                {selOwned ? (
                  isActive
                    ? <div className="dex-active-note d-flex align-items-center justify-content-center gap-2"><Icon name="heart" size={20} /> Đang là pet đồng hành</div>
                    : <button type="button" className="btn btn-cowdi-primary w-100 d-inline-flex align-items-center justify-content-center gap-2" onClick={() => switchActivePet(selOwned.instanceId)}><Icon name="heart" size={20} /> Chọn làm pet đồng hành</button>
                ) : sel.comingSoon ? (
                  <button type="button" className="btn btn-secondary w-100" disabled>Sắp ra mắt</button>
                ) : (
                  <>
                    <div className="dex-cond d-flex align-items-center gap-2"><Icon name="target" size={18} /> Điều kiện: {getConditionText(sel.unlockCondition)}</div>
                    {selCanUnlock
                      ? <button type="button" className="btn btn-success w-100" onClick={() => handleUnlock(sel.id)}>Mở khoá ngay!</button>
                      : <button type="button" className="btn btn-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2" disabled><Icon name="lock" size={18} /> Chưa đủ điều kiện</button>}
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
        {!sel && (
          <aside className="dex-detail dex-detail-empty d-none d-lg-flex">
            <div className="dex-screen">
              <div className="dex-screen-top"><span className="dex-led" /><span className="dex-led r" /><span className="dex-led y" /></div>
              <div className="dex-screen-view"><span className="dex-screen-lock"><Icon name="paw" size={40} /></span></div>
              <div className="dex-screen-bottom"><b>Chọn một pet</b><span>để xem thông tin</span></div>
            </div>
          </aside>
        )}
      </div>
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
    case 'event': {
      const labels = {
        halloween: '🎃 Online vào tuần lễ Halloween (25/10 – 01/11)',
        christmas: '🎄 Online vào tuần lễ Giáng sinh (20 – 26/12)',
        buddhist:  '🪷 Online vào ngày lễ lớn của Phật giáo (Phật Đản, Vu Lan, Vía Quan Âm, Phật Thành Đạo)',
      };
      return labels[condition.eventId] || `Sự kiện ${condition.eventId}`;
    }
    default: return '???';
  }
}
