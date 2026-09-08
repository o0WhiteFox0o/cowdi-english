import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { usePet } from '../hooks/usePet';
import { LESSONS, LEVELS, UNITS } from '../data/lessons';
import { getPathById, getPathProgress } from '../data/path';
import { PET_REGISTRY, getPetEvolution, getPetMood, SKILL_META, DAILY_QUESTS } from '../data/pets';
import ForestBanner from '../components/ForestBanner';
import InviteSheet from '../features/invite/InviteSheet';
import Icon, { SKILL_ICON } from '../components/Icon';

const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const NEED_META = {
  energy:    { icon: 'bolt',  name: 'Năng lượng', tone: 'gold' },
  happiness: { icon: 'smile', name: 'Vui vẻ',     tone: 'clay' },
  health:    { icon: 'heart', name: 'Sức khỏe',   tone: '' },
  knowledge: { icon: 'book',  name: 'Tri thức',   tone: 'sky' },
};
const MOOD_LABEL = { happy: 'đang vui', normal: 'bình thường', sad: 'hơi buồn', sick: 'đang ốm' };

export default function HomePage() {
  const { userData } = useUser();
  const { user, loginWithGoogle } = useAuth();
  const { petData, getActivePetWithDecay } = usePet();
  const [inviteOpen, setInviteOpen] = useState(false);

  const level = getUserLevel(userData.totalXP);
  const nextLevel = LEVELS.find((l) => l.xpRequired > userData.totalXP);
  const xpProgress = nextLevel
    ? Math.min(100, ((userData.totalXP - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100)
    : 100;
  const stars = Math.max(1, Math.min(5, Math.ceil(level.level / LEVELS.length * 5)));

  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;
  const petName = activePet?.customName || species?.name || 'Cowdi';
  const petImg = evo?.image || '/assets/images/logo/MiniLogoCowdi.svg';
  const mood = activePet ? getPetMood(activePet.needs) : 'happy';

  const completed = userData.completedLessons || [];
  const pathInfo = getPathProgress(getPathById('general'), userData);
  const currentNode = pathInfo.nodes.find((n) => n.status === 'current');
  const nextLesson = (currentNode?.type === 'lesson' && LESSONS.find((l) => l.id === currentNode.lessonId))
    || LESSONS.find((l) => !completed.includes(l.id)) || LESSONS[0];
  const nextIsCheckpoint = currentNode?.type === 'checkpoint';
  const nextHref = nextIsCheckpoint ? '/learning-path' : `/lessons/${nextLesson.id}`;
  const nextLabel = nextIsCheckpoint ? currentNode.unit.checkpoint.title : `Học tiếp: ${nextLesson.title}`;
  const nextIcon = nextIsCheckpoint ? 'trophy' : 'play';
  const allDailyDone = userData.dailyTasks.lessonDone && userData.dailyTasks.vocabDone;

  // Today's journal entry
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = userData.dailyJournal?.[todayKey] || {};

  // Pet collection avatars (fill to 8 slots)
  const owned = Object.entries(petData.collection || {});
  const slots = Array.from({ length: Math.max(8, Math.ceil(owned.length / 4) * 4) }, (_, i) => owned[i] || null);

  // Goal rows (long-term)
  const goals = [
    { icon: 'book',    name: 'Hoàn thành bài học', cur: completed.length, max: LESSONS.length },
    { icon: 'road',    name: 'Vượt qua các Unit', cur: UNITS.filter((u) => u.lessons.every((id) => completed.includes(id))).length, max: UNITS.length },
    { icon: 'fire',    name: 'Streak 7 ngày', cur: Math.min(7, userData.streak), max: 7, tone: 'clay' },
    { icon: 'paw',     name: 'Sưu tập Pet', cur: owned.length, max: Object.keys(PET_REGISTRY).length },
  ];

  return (
    <div className="fade-in">
      {/* ═══════════ Header: title + banner ═══════════ */}
      <div className="journal-header">
        <div>
          <h1 className="journal-title">Chào mừng trở lại!</h1>
          <p className="journal-sub">Đây là sổ tay học tập của bạn cùng {petName}</p>
          <div className="journal-actions">
            <Link to={nextHref} className="btn btn-cowdi-primary d-inline-flex align-items-center gap-2"><Icon name={nextIcon} size={20} /> {nextLabel}</Link>
            <Link to="/practice" className="btn btn-outline-cowdi d-inline-flex align-items-center gap-2"><Icon name="pencil" size={20} /> Luyện tập</Link>
            {!user && (
              <button type="button" className="btn btn-outline-cowdi" onClick={loginWithGoogle}>
                <i className="fab fa-google me-1" /> Đăng nhập để lưu tiến trình
              </button>
            )}
          </div>
        </div>
        <div className="journal-banner"><ForestBanner /></div>
      </div>

      {/* ═══════════ Row 1: Tổng quan (rộng) + Pet ═══════════ */}
      <div className="journal-grid mb-3">
        {/* Tổng quan */}
        <section className="book-card span-2">
          <div className="book-card-head">
            <div className="book-card-title">Tổng quan</div>
            <Link to="/progress" className="book-card-link">Xem tất cả →</Link>
          </div>
          <div className="journal-overview">
            <div className="journal-kv">
              <div className="book-slip">
                <small>Cấp độ</small>
                <div className="journal-stars">
                  {Array.from({ length: 5 }, (_, i) => <span key={i} className={i < stars ? '' : 'dim'}>★</span>)}
                  <span className="ms-1" style={{ color: 'var(--ink-soft)', fontSize: '.85rem' }}>Lv.{level.level}</span>
                </div>
                <div className="journal-level-title">{level.title}</div>
                <div className="book-bar mt-1"><i style={{ width: `${xpProgress}%` }} /></div>
                <small>{userData.totalXP} / {nextLevel ? nextLevel.xpRequired : level.xpRequired} XP</small>
              </div>
              <div className="book-slip">
                <small>Chuỗi ngày học</small>
                <div className="journal-level-title d-flex align-items-center gap-1"><Icon name="fire" size={22} /> {userData.streak} ngày liên tiếp</div>
              </div>
              <div className="book-slip">
                <small>Kho báu</small>
                <div className="journal-level-title d-flex align-items-center gap-1 flex-wrap"><Icon name="coin" size={22} /> {petData.coins} coins · <Icon name="star" size={22} /> {userData.availableXP ?? 0} XP dư</div>
              </div>
            </div>
            <MiniCalendar activeDays={userData.activeDays} />
          </div>
        </section>

        {/* Pet polaroid */}
        <section className="book-card journal-pet-card">
          <div className="book-card-head">
            <div className="book-card-title">Pet của tôi</div>
            <Link to="/pet" className="book-card-link">Chăm sóc →</Link>
          </div>
          <Link to="/pet" className="journal-pet">
            <div className="journal-pet-frame">
              <img src={petImg} alt={petName} width="180" height="180" fetchpriority="high" decoding="async" />
            </div>
            <div className="journal-pet-cap">
              <span>{petName} {evo?.emoji}</span>
              <small>{evo?.name || 'Starter'} · {MOOD_LABEL[mood] || mood}</small>
            </div>
          </Link>
          {activePet && (
            <div className="journal-needs">
              {Object.entries(NEED_META).map(([k, m]) => (
                <div key={k} className="journal-need">
                  <span><span className="d-inline-flex align-items-center gap-1"><Icon name={m.icon} size={14} /> {m.name}</span><span>{Math.round(activePet.needs?.[k] ?? 0)}%</span></span>
                  <div className={`book-bar ${m.tone}`}><i style={{ width: `${activePet.needs?.[k] ?? 0}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ═══════════ Row 2: Nhiệm vụ + Kỹ năng + Lộ trình ═══════════ */}
      <div className="journal-grid mb-3">
        {/* Nhiệm vụ */}
        <section className="book-card">
          <div className="book-card-head">
            <div className="book-card-title">Nhiệm vụ</div>
            <Link to="/pet" className="book-card-link">Xem tất cả →</Link>
          </div>
          {DAILY_QUESTS.map((q) => {
            const done = !!q.check(userData);
            return (
              <div key={q.id} className={`journal-task ${done ? 'done' : ''}`}>
                <div className="journal-task-ico">{done ? <Icon name="check" size={24} /> : q.title.slice(0, 2)}</div>
                <div className="journal-task-name">{q.title.slice(2).trim()}<br /><small className="text-muted" style={{ fontFamily: 'var(--font)', fontSize: '.72rem' }}>{q.desc}</small></div>
                <div className="journal-task-num d-flex align-items-center gap-1">+{q.reward} <Icon name="coin" size={16} /></div>
              </div>
            );
          })}
          {goals.map((g) => (
            <div key={g.name} className={`journal-task ${g.cur >= g.max ? 'done' : ''}`}>
              <div className="journal-task-ico"><Icon name={g.icon} size={24} /></div>
              <div className="journal-task-name">{g.name}</div>
              <div className="journal-task-num">{g.cur} / {g.max}</div>
              <div className={`book-bar ${g.tone || ''}`}><i style={{ width: `${Math.min(100, (g.cur / g.max) * 100)}%` }} /></div>
            </div>
          ))}
          {!allDailyDone && (
            <Link to={nextHref} className="btn btn-cowdi-primary btn-sm w-100 mt-2">Làm nhiệm vụ ngay →</Link>
          )}
        </section>

        {/* Kỹ năng */}
        <section className="book-card">
          <div className="book-card-head">
            <div className="book-card-title">Kỹ năng</div>
            <Link to="/progress" className="book-card-link">Chi tiết →</Link>
          </div>
          <div className="journal-skills">
            {Object.entries(SKILL_META).map(([key, meta]) => {
              const xp = userData.skillXP?.[key] || 0;
              const max = Math.max(1, ...Object.values(userData.skillXP || { a: 1 }));
              return (
                <div key={key} className="journal-skill">
                  <div className="journal-skill-ico"><Icon name={SKILL_ICON[key]} size={28} /></div>
                  <div className="journal-skill-name">{meta.name}</div>
                  <div className="journal-skill-val">{xp} XP</div>
                  <div className="book-bar"><i style={{ width: `${Math.round((xp / max) * 100)}%`, background: meta.color }} /></div>
                </div>
              );
            })}
          </div>
          <div className="book-slip mt-3 d-flex align-items-center gap-2">
            <Icon name="target" size={30} />
            <div className="flex-grow-1">
              <div className="journal-level-title">Đã làm {userData.quizzesCompleted || 0} quiz · {userData.perfectQuizzes || 0} perfect</div>
              <small className="text-muted">Thuộc {userData.wordsLearned || 0} từ vựng</small>
            </div>
          </div>
        </section>

        {/* Lộ trình — chỉ hiện unit đang học để tránh rối mắt */}
        <section className="book-card">
          <div className="book-card-head">
            <div className="book-card-title">Lộ trình</div>
            <Link to="/learning-path" className="book-card-link">Xem bản đồ →</Link>
          </div>
          {(() => {
            const u = pathInfo.currentUnit;
            const uIdx = UNITS.findIndex((x) => x.id === u.id);
            const uNodes = pathInfo.nodes.filter((n) => n.unit.id === u.id);
            const uDone = uNodes.filter((n) => n.status === 'done').length;
            return (
              <Link to="/learning-path" className="journal-unit-now text-decoration-none" style={{ '--unit-color': u.color }}>
                <div className="journal-unit-now-ico"><Icon name="road" size={30} /></div>
                <div className="flex-grow-1">
                  <small className="text-muted">Unit {uIdx + 1} · {uDone}/{uNodes.length} bước</small>
                  <div className="journal-level-title">{u.title}</div>
                  <small className="text-muted">{u.subtitle}</small>
                  <div className="book-bar mt-1"><i style={{ width: `${uNodes.length ? (uDone / uNodes.length) * 100 : 0}%`, background: u.color }} /></div>
                </div>
              </Link>
            );
          })()}
          <div className="book-slip mt-2 d-flex justify-content-between align-items-center">
            <span className="journal-level-title">Toàn lộ trình</span>
            <span className="journal-task-num">{pathInfo.done} / {pathInfo.total} · {pathInfo.pct}%</span>
          </div>
          <Link to={nextHref} className="btn btn-cowdi-primary btn-sm w-100 mt-2 d-inline-flex align-items-center justify-content-center gap-2"><Icon name={nextIcon} size={18} /> {nextLabel}</Link>
        </section>
      </div>

      <div className="journal-grid mb-3">
        <section className="book-card span-3">
          <div className="book-card-head">
            <div className="book-card-title">Bộ sưu tập</div>
            <Link to="/collection" className="book-card-link">Xem tất cả →</Link>
          </div>
          <div className="journal-pets">
            {slots.map((entry, i) => {
              if (!entry) {
                return (
                  <Link key={`empty-${i}`} to="/collection" className="journal-pet-av locked">
                    <div className="journal-pet-av-ring"><Icon name="egg" size={30} /></div>
                    <span>Chưa mở</span>
                  </Link>
                );
              }
              const [id, pet] = entry;
              const sp = PET_REGISTRY[pet.speciesId];
              const ev = sp ? getPetEvolution(pet.speciesId, pet.totalXpEarned) : null;
              return (
                <Link key={id} to="/collection" className={`journal-pet-av ${id === petData.activePetId ? 'active' : ''}`}>
                  <div className="journal-pet-av-ring">
                    {ev?.image ? <img src={ev.image} alt="" /> : (sp?.emoji || '🐾')}
                  </div>
                  <span>{pet.customName || sp?.name}</span>
                </Link>
              );
            })}
          </div>
          <button type="button" className="btn btn-cowdi-primary btn-sm mt-3 d-inline-flex align-items-center gap-2" onClick={() => setInviteOpen(true)}>
            Mời bạn học cùng <Icon name="gift" size={18} />
          </button>
        </section>
      </div>

      {/* ═══════════ Row 3: Ghi chú ═══════════ */}
      <section className="book-card">
        <div className="book-card-head">
          <div className="book-card-title">Ghi chú</div>
        </div>
        <div className="journal-notes">
          <Link to={nextHref} className="journal-note">
            <b>Tiếp tục học</b>
            {nextIsCheckpoint ? nextLabel : `${nextLesson.icon} ${nextLesson.title}`}
            <div className="small mt-1" style={{ fontFamily: 'var(--font)', fontSize: '.75rem', opacity: .8 }}>
              Cấp độ: {nextLesson.level}
            </div>
            <span className="n-ico"><Icon name="book" size={28} /></span>
          </Link>
          <div className="journal-note mint">
            <b>Hôm nay</b>
            <ul>
              <li>{today.lessons || 0} bài học · {today.quizzes || 0} quiz</li>
              <li>{today.words || 0} từ mới · {today.reviews || 0} lượt ôn</li>
              <li>+{today.xp || userData.dailyXP || 0} XP</li>
            </ul>
            <span className="n-ico"><Icon name="pencil" size={28} /></span>
          </div>
          <Link to="/duel" className="journal-note rose">
            <b>Thử thách</b>
            Thách đấu bạn bè trong Đấu trường để {petName} thêm mạnh mẽ!
            <span className="n-ico">⚔️</span>
          </Link>
        </div>
      </section>

      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

/* ── Mini month calendar with active-day marks ── */
function MiniCalendar({ activeDays = [] }) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Monday-first
  const active = new Set(activeDays);
  const monthCount = activeDays.filter((s) => {
    const d = new Date(s);
    return d.getMonth() === m && d.getFullYear() === y;
  }).length;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="book-slip journal-cal">
      <div className="journal-cal-head">
        <span>Tháng {m + 1}, {y}</span>
        <span className="text-muted" style={{ fontSize: '.8rem' }}>{monthCount} ngày học</span>
      </div>
      <div className="journal-cal-grid">
        {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const key = new Date(y, m, d).toDateString();
          const isToday = d === now.getDate();
          return (
            <div key={d} className={`day ${active.has(key) ? 'on' : ''} ${isToday ? 'today' : ''}`}>{d}</div>
          );
        })}
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
