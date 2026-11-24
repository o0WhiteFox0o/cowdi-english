import { useState, useMemo, useRef, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { usePet } from '../hooks/usePet';
import { LESSONS, LEVELS, UNITS } from '../data/lessons';
import { getPathById, getPathProgress } from '../data/path';
import { PET_REGISTRY, getEvolutionInfo, getPetMood } from '../data/pets';
import { PetAvatar, bondOf, topSkillOf } from '../pet-rig/PetAvatar';
import InviteSheet from '../features/invite/InviteSheet';
import Icon from '../components/Icon';
import Emoji from '../components/Emoji';

function calcDaysAway(lastDateStr) {
  if (!lastDateStr) return 0;
  const t = new Date(lastDateStr).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const NEED_META = {
  energy: { icon: 'bolt', name: 'Năng lượng' },
  happiness: { icon: 'smile', name: 'Vui vẻ' },
  health: { icon: 'heart', name: 'Sức khỏe' },
  knowledge: { icon: 'book', name: 'Tri thức' },
};
const MOOD_LABEL = {
  happy: 'Hào hứng ✨',
  normal: 'Sẵn sàng 🎒',
  sad: 'Cần động lực 💪',
  sick: 'Cần chăm sóc 💊',
};

function getUserLevel(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  return current;
}

export default function HomePage() {
  useSEO(SEO_CONFIGS['/']);
  const { userData } = useUser();
  const { user, loginWithGoogle } = useAuth();
  const { petData, getActivePetWithDecay } = usePet();
  const [inviteOpen, setInviteOpen] = useState(false);

  const level = getUserLevel(userData.totalXP);
  const nextLevel = LEVELS.find((l) => l.xpRequired > userData.totalXP);

  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getEvolutionInfo(activePet.speciesId, activePet.evolution) : null;
  const petName = activePet?.customName || species?.name || 'Cowdi';
  const petImg = evo?.image || '/assets/images/logo/MiniLogoCowdi.svg';
  const mood = activePet ? getPetMood(activePet.needs) : 'happy';

  const heroPetRef = useRef(null);
  const cardPetRef = useRef(null);
  const appOpenSentRef = useRef(false);

  useEffect(() => {
    if (appOpenSentRef.current || !activePet?.speciesId) return;
    appOpenSentRef.current = true;
    const daysAway = calcDaysAway(userData.lastActiveDate || activePet.needsUpdatedAt);
    heroPetRef.current?.emit('app_open', { daysAway });
    cardPetRef.current?.emit('app_open', { daysAway });
  }, [activePet?.speciesId, activePet?.needsUpdatedAt, userData.lastActiveDate]);

  const completed = userData.completedLessons || [];
  const pathInfo = getPathProgress(getPathById('general'), userData);
  const currentNode = pathInfo.nodes.find((n) => n.status === 'current');
  const nextLesson = (currentNode?.type === 'lesson' && LESSONS.find((l) => l.id === currentNode.lessonId))
    || LESSONS.find((l) => !completed.includes(l.id)) || LESSONS[0];
  const nextIsCheckpoint = currentNode?.type === 'checkpoint';
  const nextHref = nextIsCheckpoint ? '/learning-path' : `/lessons/${nextLesson.id}`;
  const nextLabel = nextIsCheckpoint ? currentNode.unit.checkpoint.title : nextLesson.title;
  const nextIcon = nextIsCheckpoint ? 'trophy' : 'play';

  // Greeting by time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        title: 'Chào buổi sáng',
        subtitle: 'Bắt đầu ngày mới thật hứng khởi cùng Cowdi!',
      };
    }
    if (hour < 18) {
      return {
        title: 'Chào buổi chiều',
        subtitle: 'Dành chút thời gian ôn tập để nhớ từ vựng lâu hơn nhé!',
      };
    }
    return {
      title: 'Chào buổi tối',
      subtitle: 'Hoàn thành nốt mục tiêu hôm nay để giữ chuỗi Streak nhé!',
    };
  }, []);

  // Weekly activity (7 days: Monday to Sunday of current week)
  const currentWeekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    const activeSet = new Set(userData.activeDays || []);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = d.toDateString();
      const isToday = key === now.toDateString();
      const isActive = activeSet.has(key);

      days.push({
        label: DOW[i],
        date: d.getDate(),
        isActive,
        isToday,
      });
    }
    return days;
  }, [userData.activeDays]);

  const weekActiveCount = currentWeekDays.filter((d) => d.isActive).length;

  // Curated 4 daily goals
  const dailyTasks = useMemo(() => {
    return [
      {
        id: 'lesson',
        title: 'Hoàn thành 1 bài học',
        reward: '+30 🥛',
        done: !!userData.dailyTasks?.lessonDone,
        icon: 'book',
      },
      {
        id: 'vocab',
        title: 'Ôn tập từ vựng',
        reward: '+30 🥛',
        done: !!userData.dailyTasks?.vocabDone,
        icon: 'cards',
      },
      {
        id: 'quiz',
        title: 'Thực hiện bài Quiz',
        reward: '+30 🥛',
        done: (userData.quizzesCompleted || 0) > 0,
        icon: 'target',
      },
      {
        id: 'streak',
        title: 'Giữ vững chuỗi Streak',
        reward: '+15 🥛',
        done: (userData.streak || 0) > 0,
        icon: 'fire',
      },
    ];
  }, [userData.dailyTasks, userData.quizzesCompleted, userData.streak]);

  const completedGoalsCount = dailyTasks.filter((t) => t.done).length;

  const displayName = user?.display_name || petData.nickname || 'Bạn học Cowdi';

  return (
    <div className="dash-v2 fade-in">
      {/* ═══════════ A. Header: User Quick Info Strip ═══════════ */}
      <section className="dash-user-strip" aria-label="Thông tin người học">
        <div className="dash-user-profile">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={displayName} className="dash-user-avatar" referrerPolicy="no-referrer" />
          ) : (
            <div className="dash-user-avatar-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="dash-user-name">{displayName}</div>
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
              {level.title} · Lv.{level.level}
            </small>
          </div>
        </div>

        <div className="dash-user-stats">
          <span className="dash-stat-pill" title="Chuỗi ngày học liên tiếp">
            <Icon name="fire" size={18} /> {userData.streak || 0} ngày
          </span>
          <span className="dash-stat-pill leaf" title="Điểm kinh nghiệm">
            <Icon name="star" size={18} /> {userData.totalXP || 0} XP
          </span>
          <Link to="/account#wallet" className="dash-stat-pill text-decoration-none" title="Ví Sữa">
            <span className="me-1">🥛</span> {(userData.wallet?.milk || userData.availableXP || 0).toLocaleString('vi-VN')} Sữa
          </Link>
          <Link to="/account#wallet" className="dash-stat-pill text-decoration-none" title="Ví Gem">
            <span className="me-1">💎</span> {(userData.wallet?.gem || 0).toLocaleString('vi-VN')} Gem
          </Link>
          <button
            type="button"
            className="btn btn-outline-cowdi btn-sm d-inline-flex align-items-center gap-1 rounded-pill px-3"
            onClick={() => setInviteOpen(true)}
            title="Mời bạn cùng học nhận quà"
          >
            <Icon name="gift" size={16} /> Mời bạn
          </button>
        </div>
      </section>

      {/* ═══════════ B. Hero: Welcome & Motivation ═══════════ */}
      <section className="dash-hero" aria-label="Chào mừng">
        <div className="dash-hero-text">
          <h2>{greeting.title}, {displayName}! ✨</h2>
          <p className="dash-hero-quote">{greeting.subtitle}</p>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Link to="/learning-path" className="btn btn-cowdi-primary btn-sm d-inline-flex align-items-center gap-2">
              <Icon name="road" size={18} /> Lộ trình học
            </Link>
            <Link to="/practice" className="btn btn-outline-cowdi btn-sm d-inline-flex align-items-center gap-2">
              <Icon name="pencil" size={18} /> Phòng luyện tập
            </Link>
            {!user && (
              <button type="button" className="btn btn-link text-decoration-none btn-sm p-0 text-muted ms-1" onClick={loginWithGoogle}>
                <i className="fab fa-google me-1" /> Đăng nhập để lưu tiến trình
              </button>
            )}
          </div>
        </div>

        <div className="dash-hero-mascot-box">
          <PetAvatar
            ref={heroPetRef}
            petId={activePet?.speciesId}
            stage={(activePet?.evolution || 0) + 1}
            group={species?.group}
            bond={bondOf(activePet?.skills)}
            topSkill={topSkillOf(activePet?.skills)}
            mode="home"
            fallbackSrc={petImg}
            alt={petName}
            className="dash-hero-mascot-img"
          />
          <span className="dash-hero-mood-tag">
            <Emoji e={evo?.emoji || species?.emoji || '🐮'} size={14} /> {petName} {MOOD_LABEL[mood] || 'đang vui'}
          </span>
        </div>
      </section>

      {/* ═══════════ C. Continue Learning (Primary CTA) ═══════════ */}
      <section className="dash-continue-card" aria-label="Bài học tiếp theo">
        <div>
          <span className="dash-continue-badge">
            <Icon name="sparkles" size={14} /> Bài học tiếp theo
          </span>
          <h3 className="dash-continue-title">{nextLabel}</h3>
          <div className="dash-continue-meta">
            <span className="dash-continue-meta-item">
              <Icon name="road" size={16} />
              {pathInfo.currentUnit ? `Unit: ${pathInfo.currentUnit.title}` : 'Khởi động'}
            </span>
            <span className="dash-continue-meta-item">
              <Icon name="book" size={16} />
              {nextLesson.vocabulary?.length || 0} từ vựng mới
            </span>
            <span className="dash-continue-meta-item">
              <Icon name="trophy" size={16} />
              {nextLesson.level || 'Cơ bản'}
            </span>
          </div>
        </div>

        <div className="dash-continue-action">
          <Link
            to={nextHref}
            className="btn btn-cowdi-primary btn-lg d-inline-flex align-items-center gap-2 px-4 shadow-sm"
          >
            <Icon name={nextIcon} size={20} />
            Tiếp tục học ngay →
          </Link>
          <Link to="/learning-path" className="dash-card-link text-decoration-none">
            Xem toàn bộ bản đồ lộ trình
          </Link>
        </div>
      </section>

      {/* ═══════════ D + E + F: Main Content 2-Column Grid ═══════════ */}
      <div className="dash-main-grid">
        {/* Left Column: Daily Goals & Weekly Progress */}
        <div className="dash-column">
          {/* D. Daily Goals */}
          <section className="dash-card" aria-label="Mục tiêu hôm nay">
            <div className="dash-card-header">
              <h4 className="dash-card-title">
                <Icon name="target" size={20} /> Mục tiêu hôm nay
              </h4>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                Đạt {completedGoalsCount}/{dailyTasks.length} mục tiêu
              </span>
            </div>

            {/* Task list */}
            <div className="dash-task-list">
              {dailyTasks.map((t) => (
                <div key={t.id} className={`dash-task-item ${t.done ? 'done' : ''}`}>
                  <div className="dash-task-left">
                    <div className="dash-task-check">
                      {t.done ? <Icon name="check" size={14} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--paper-line)' }} />}
                    </div>
                    <span className="dash-task-name">{t.title}</span>
                  </div>
                  <span className="dash-task-reward">{t.reward}</span>
                </div>
              ))}
            </div>
          </section>

          {/* E. Weekly Progress */}
          <section className="dash-card" aria-label="Tiến độ tuần">
            <div className="dash-card-header">
              <h4 className="dash-card-title">
                <Icon name="calendar" size={20} /> Tiến độ học tuần này
              </h4>
              <Link to="/progress" className="dash-card-link">
                Xem chi tiết →
              </Link>
            </div>

            <div className="dash-week-grid">
              {currentWeekDays.map((d, i) => (
                <div key={i} className={`dash-week-day ${d.isActive ? 'active' : ''} ${d.isToday ? 'today' : ''}`}>
                  <span className="day-label">{d.label}</span>
                  <span className="day-num">{d.date}</span>
                  <span className="day-dot" />
                </div>
              ))}
            </div>

            <div className="dash-week-footer">
              <span>
                Đã học <strong>{weekActiveCount}/7 ngày</strong> tuần này
              </span>
              <span>
                Streak: <strong>{userData.streak || 0} ngày liên tục</strong> 🔥
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: Cowdi Pet Companion */}
        <div className="dash-column">
          <section className="dash-card dash-pet-card" aria-label="Bạn đồng hành Cowdi">
            <div className="dash-pet-avatar-wrap">
              <PetAvatar
                ref={cardPetRef}
                petId={activePet?.speciesId}
                stage={(activePet?.evolution || 0) + 1}
                group={species?.group}
                bond={bondOf(activePet?.skills)}
                topSkill={topSkillOf(activePet?.skills)}
                mode="home"
                fallbackSrc={petImg}
                alt={petName}
              />
            </div>
            <h4 className="dash-pet-name">{petName}</h4>
            <div className="dash-pet-stage">
              {evo?.name || 'Bò con'} · {species?.name || 'Cowdi Starter'}
            </div>

            {/* Pet Needs bars */}
            {activePet && (
              <div className="dash-pet-needs-grid">
                {Object.entries(NEED_META).map(([k, m]) => {
                  const val = Math.round(activePet.needs?.[k] ?? 85);
                  return (
                    <div key={k} className="dash-pet-need-item">
                      <div className="dash-pet-need-header">
                        <span><Icon name={m.icon} size={13} /> {m.name}</span>
                        <span>{val}%</span>
                      </div>
                      <div className="dash-pet-need-bar">
                        <i style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link to="/pet" className="btn btn-outline-cowdi btn-sm w-100">
              Chăm sóc & Luyện thú cưng →
            </Link>
          </section>
        </div>
      </div>

      {/* ═══════════ G. Recommended Learning ═══════════ */}
      <section aria-label="Gợi ý học tập">
        <h4 className="dash-card-title mb-3">
          <Icon name="sparkles" size={20} /> Gợi ý học tập cho bạn
        </h4>
        <div className="dash-recs-grid">
          <Link to="/practice" className="dash-rec-item">
            <div className="dash-rec-icon" style={{ background: 'var(--leaf-pale)', color: 'var(--leaf-dark)' }}>
              <Icon name="pencil" size={22} />
            </div>
            <div>
              <div className="dash-rec-title">Phòng Luyện tập</div>
              <div className="dash-rec-desc">Ôn từ vựng, ngữ pháp và nghe chép chính tả</div>
            </div>
          </Link>

          <Link to="/vocabulary" className="dash-rec-item">
            <div className="dash-rec-icon" style={{ background: '#FFF8E6', color: '#D48A1E' }}>
              <Icon name="map" size={22} />
            </div>
            <div>
              <div className="dash-rec-title">Bản đồ Từ vựng</div>
              <div className="dash-rec-desc">Khám phá từ vựng theo chủ đề kèm phát âm bản xứ</div>
            </div>
          </Link>

          <Link to="/duel" className="dash-rec-item">
            <div className="dash-rec-icon" style={{ background: '#FDECEE', color: '#EA5A5A' }}>
              <Icon name="swords" size={22} />
            </div>
            <div>
              <div className="dash-rec-title">Đấu trường Thách đấu</div>
              <div className="dash-rec-desc">Đấu trí 1v1 cùng bạn bè, rèn phản xạ tiếng Anh</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Invite Modal Sheet */}
      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
