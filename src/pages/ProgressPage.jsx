import { useMemo } from 'react';
import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { ACHIEVEMENTS, LEVELS, LESSONS } from '../data/lessons';
import { PET_REGISTRY, getPetEvolution, calculatePowerScore, getSkillLevel, SKILL_META, PET_ACHIEVEMENTS } from '../data/pets';
import Icon, { SKILL_ICON } from '../components/Icon';
import Emoji from '../components/Emoji';
import RadarChart from '../components/charts/RadarChart';

export default function ProgressPage() {
  useSEO(SEO_CONFIGS['/progress']);
  const navigate = useNavigate();
  const { userData } = useUser();
  const { petData, getActivePetWithDecay } = usePet();
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;

  const level = useMemo(() => {
    let cur = LEVELS[0];
    for (const l of LEVELS) {
      if (userData.totalXP >= l.xpRequired) cur = l;
      else break;
    }
    return cur;
  }, [userData.totalXP]);

  const nextLevel = LEVELS.find((l) => l.xpRequired > userData.totalXP);
  const progress = nextLevel
    ? ((userData.totalXP - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100
    : 100;

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        date:    d.getDate(),
        active:  userData.activeDays.includes(d.toDateString()),
        isToday: i === 0,
      });
    }
    return days;
  }, [userData.activeDays]);

  const allWords = useMemo(() => LESSONS.flatMap((l) => l.vocabulary), []);
  const wordStats = useMemo(() => {
    const learned  = Object.values(userData.wordStatus).filter((s) => s === 'learned').length;
    const learning = Object.values(userData.wordStatus).filter((s) => s === 'learning').length;
    return { total: allWords.length, learned, learning, new: allWords.length - learned - learning };
  }, [allWords, userData.wordStatus]);

  // ── Radar Chart data ─────────────────────────────────────────────────
  const sk = userData.skillXP || { listening: 0, speaking: 0, reading: 0, writing: 0 };
  const cefr = level.level <= 5 ? 'A1' : level.level <= 10 ? 'A2' : level.level <= 15 ? 'B1' : level.level <= 20 ? 'B2' : level.level <= 25 ? 'C1' : 'C2';
  const cefrLabel = level.level <= 5 ? 'Sơ cấp' : level.level <= 10 ? 'Tiền trung cấp' : level.level <= 15 ? 'Trung cấp' : level.level <= 20 ? 'Trung cao cấp' : level.level <= 25 ? 'Cao cấp' : 'Thành thạo';
  const maxRef = Math.max(200, ...Object.values(sk)) * 1.2;
  const getPct = (val) => Math.min(100, Math.round((val / maxRef) * 100));
  const speakPct  = getPct(sk.speaking);
  const listenPct = getPct(sk.listening);
  const readPct   = getPct(sk.reading);
  const writePct  = getPct(sk.writing);
  const vocabPct  = Math.round((wordStats.learned / Math.max(1, wordStats.total)) * 100);
  const radarData   = [speakPct, Math.round((listenPct + speakPct) / 2), listenPct, Math.round((readPct + writePct) / 2), vocabPct];
  const radarLabels = [
    { name: 'Phát âm',  value: `${radarData[0]}%` },
    { name: 'Lưu loát', value: `${radarData[1]}%` },
    { name: 'Ngữ điệu', value: `${radarData[2]}%` },
    { name: 'Ngữ pháp', value: `${radarData[3]}%` },
    { name: 'Từ vựng',  value: `${radarData[4]}%` },
  ];
  const overall = Math.round(radarData.reduce((a, b) => a + b, 0) / 5);

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <i className="fas fa-chart-line text-cowdi me-2"></i>Tiến trình học tập
        </h2>
      </div>

      {/* ── Radar Chart Card (đầu trang) ── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3 p-sm-4">
          {/* Header row */}
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-1">
                <Icon name="target" size={18} /> Trình độ của bạn
              </h5>
              <small className="text-muted">CEFR: {cefrLabel}</small>
            </div>
            <span className="badge"
              style={{
                background: 'var(--leaf-pale)',
                color: 'var(--leaf-dark)',
                border: '2px dashed var(--leaf)',
                fontSize: '1.1rem',
                fontFamily: 'var(--font-hand)',
                padding: '4px 12px',
                borderRadius: '10px',
              }}
            >
              {cefr}
            </span>
          </div>

          {/* Radar chart — responsive width */}
          <div className="d-flex justify-content-center">
            <RadarChart
              data={radarData}
              labels={radarLabels}
              centerText={`${overall}%`}
            />
          </div>

          <p className="text-muted small text-center mt-2 mb-3">
            Tiếp tục luyện tập để cải thiện khả năng tiếng Anh của bạn.
          </p>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              style={{ flex: 1, borderRadius: '12px', fontFamily: 'var(--font-hand)' }}
            >
              <i className="fas fa-share me-1" /> Chia sẻ
            </button>
            <button
              className="btn btn-cowdi-primary"
              style={{ flex: 1, borderRadius: '12px', fontFamily: 'var(--font-hand)' }}
              onClick={() => navigate('/learning-path')}
            >
              Đi đến Bài học
            </button>
          </div>
        </div>
      </div>

      {/* ── Level ── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3"><Icon name="trophy" size={20} /> Cấp độ</h5>
          <div className="d-flex align-items-center gap-3">
            <div className="level-badge-lg">Lv.{level.level}</div>
            <div className="flex-grow-1">
              <div className="fw-bold mb-1">{level.title}</div>
              <div className="progress" style={{ height: '12px' }}>
                <div
                  className="progress-bar progress-bar-cowdi"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <small className="text-muted d-block mt-1">
                {userData.totalXP} / {nextLevel ? nextLevel.xpRequired : level.xpRequired} XP
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* ── Streak Calendar ── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0"><Icon name="calendar" size={20} /> Lịch hoạt động</h5>
            <span className="badge bg-danger" style={{ fontSize: '0.85rem' }}>
              <Icon name="fire" size={14} /> {userData.streak} ngày streak
            </span>
          </div>
          <div className="streak-calendar">
            {calendarDays.map((d, i) => (
              <div
                key={i}
                className={`calendar-day ${d.active ? 'active' : ''} ${d.isToday ? 'today' : ''}`}
                title={d.active ? 'Đã học' : 'Chưa học'}
              >
                {d.date}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="row g-3 mb-4">
        {[
          { icon: '⭐', value: userData.totalXP,         label: 'Tổng XP' },
          { icon: '📚', value: userData.lessonsCompleted, label: 'Bài đã hoàn thành' },
          { icon: '🎯', value: userData.quizzesCompleted, label: 'Quiz đã làm' },
          { icon: '💯', value: userData.perfectQuizzes,   label: 'Quiz hoàn hảo' },
        ].map((s, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div className="card text-center shadow-sm h-100">
              <div className="card-body py-3">
                <div className="fs-3 mb-1"><Emoji e={s.icon} size={28} /></div>
                <div className="fs-2 fw-bold text-cowdi-primary">{s.value}</div>
                <div className="text-muted small">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Vocabulary stats ── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3"><Icon name="cards" size={20} /> Từ vựng ({wordStats.total} từ)</h5>
          <div className="vocab-stat-bar">
            <div
              className="vocab-bar-fill learned"
              style={{ width: `${(wordStats.learned / wordStats.total) * 100}%` }}
            >
              {wordStats.learned > 0 && <><Icon name="check" size={14} /> {wordStats.learned}</>}
            </div>
            <div
              className="vocab-bar-fill learning"
              style={{ width: `${(wordStats.learning / wordStats.total) * 100}%` }}
            >
              {wordStats.learning > 0 && <><Icon name="note" size={14} /> {wordStats.learning}</>}
            </div>
            <div
              className="vocab-bar-fill new"
              style={{ width: `${(wordStats.new / wordStats.total) * 100}%` }}
            >
              {wordStats.new > 0 && <><Icon name="new" size={14} /> {wordStats.new}</>}
            </div>
          </div>
          <div className="d-flex gap-4 flex-wrap small text-muted">
            <span><Icon name="check" size={14} /> Đã thuộc: {wordStats.learned}</span>
            <span><Icon name="note" size={14} /> Đang học: {wordStats.learning}</span>
            <span><Icon name="new" size={14} /> Chưa học: {wordStats.new}</span>
          </div>
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <Icon name="medal" size={20} /> Thành tích ({userData.achievements.length}/{ACHIEVEMENTS.length})
          </h5>
          <div className="row g-2">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = userData.achievements.includes(ach.id);
              return (
                <div className="col-12 col-md-6" key={ach.id}>
                  <div className={`d-flex align-items-center gap-3 rounded p-3 ${unlocked ? 'bg-warning bg-opacity-10 border border-warning' : 'bg-light opacity-50'}`}>
                    <div className="fs-3">{unlocked ? <Emoji e={ach.icon} size={28} /> : <Icon name="lock" size={28} />}</div>
                    <div>
                      <div className="fw-bold small">{ach.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{ach.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Active Pet ── */}
      {activePet && species && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3"><Icon name="paw" size={20} /> Pet đang hoạt động</h5>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div>
                {evo?.image ? (
                  <img src={evo.image} alt={activePet.customName} style={{ width: 80, height: 80, objectFit: 'contain' }} />
                ) : (
                  <div style={{ fontSize: '3rem' }} className="emoji-big"><Emoji e={evo?.emoji || species.emoji} size={56} /></div>
                )}
              </div>
              <div>
                <div className="fw-bold">{activePet.customName}</div>
                <small className="text-muted">{evo?.name} • Power: {calculatePowerScore(activePet, species)}</small>
              </div>
            </div>
            <div className="row g-2">
              {Object.entries(SKILL_META).map(([key, meta]) => (
                <div className="col-6 col-md-3" key={key}>
                  <div className="text-center p-2 rounded bg-light">
                    <div><Icon name={SKILL_ICON[key]} size={18} /></div>
                    <div className="fw-bold small" style={{ color: meta.color }}>Lv.{getSkillLevel(activePet.skills[key] || 0)}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{meta.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Pet Achievements ── */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <Icon name="star" size={20} /> Pet Achievements ({petData.petAchievements.length}/{PET_ACHIEVEMENTS.length})
          </h5>
          <div className="row g-2">
            {PET_ACHIEVEMENTS.map((ach) => {
              const unlocked = petData.petAchievements.includes(ach.id);
              return (
                <div className="col-12 col-md-6" key={ach.id}>
                  <div className={`d-flex align-items-center gap-3 rounded p-3 ${unlocked ? 'bg-success bg-opacity-10 border border-success' : 'bg-light opacity-50'}`}>
                    <div className="fs-3">{unlocked ? <Emoji e={ach.icon} size={28} /> : <Icon name="lock" size={28} />}</div>
                    <div>
                      <div className="fw-bold small">{ach.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{ach.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
