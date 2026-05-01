import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { usePush } from '../hooks/usePush';
import { useSchedule } from '../hooks/useSchedule';
import { LEVELS, ACHIEVEMENTS, LESSONS } from '../data/lessons';
import { PET_REGISTRY, getPetEvolution } from '../data/pets';
import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const { user, loginWithGoogle, logout } = useAuth();
  const { userData } = useUser();
  const { petData, getActivePetWithDecay, setNickname } = usePet();
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;
  const [editingNick, setEditingNick] = useState(false);
  const [nickInput, setNickInput] = useState('');

  // Auto-fill nickname from Google display_name if not set
  useEffect(() => {
    if (user && !petData.nickname && user.display_name) {
      setNickname(user.display_name);
    }
  }, [user?.id]);

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

  const wordStats = useMemo(() => {
    const allWords = LESSONS.flatMap((l) => l.vocabulary);
    const learned = Object.values(userData.wordStatus).filter((s) => s === 'learned').length;
    const learning = Object.values(userData.wordStatus).filter((s) => s === 'learning').length;
    return { total: allWords.length, learned, learning };
  }, [userData.wordStatus]);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => userData.achievements.includes(a.id)),
    [userData.achievements]
  );

  const joinDate = user?.iat ? new Date(user.iat * 1000).toLocaleDateString('vi-VN') : null;
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  // Đợi 1 tick để auth state ổn định
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Nếu chưa ready, hiển thị loading
  if (!ready) {
    return (
      <div className="fade-in">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-cowdi-primary mb-3" role="status"></div>
            <p className="text-secondary">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Chưa đăng nhập ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="fade-in">
        <div className="text-center py-5">
          <div style={{ fontSize: '5rem' }} className="mb-3">🔒</div>
          <h2 className="fw-bold mb-3">Đăng nhập để quản lý tài khoản</h2>
          <p className="text-secondary mb-4">
            Đăng nhập bằng Google để lưu tiến trình học tập, đồng bộ trên nhiều thiết bị và truy cập tất cả tính năng.
          </p>
          <button className="btn btn-cowdi-primary btn-lg" onClick={loginWithGoogle}>
            <i className="fab fa-google me-2"></i>Đăng nhập bằng Google
          </button>
          <div className="row g-3 mt-5 justify-content-center" style={{ maxWidth: 600, margin: '0 auto' }}>
            {[
              { icon: '☁️', title: 'Đồng bộ đám mây', desc: 'Tiến trình được lưu trữ an toàn' },
              { icon: '📱', title: 'Nhiều thiết bị', desc: 'Học mọi lúc mọi nơi' },
              { icon: '🏆', title: 'Bảng xếp hạng', desc: 'Cạnh tranh với bạn bè' },
            ].map((f, i) => (
              <div className="col-12 col-sm-4" key={i}>
                <div className="card shadow-sm h-100 text-center">
                  <div className="card-body">
                    <div className="fs-1 mb-2">{f.icon}</div>
                    <div className="fw-bold">{f.title}</div>
                    <small className="text-muted">{f.desc}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Đã đăng nhập ─────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <i className="fas fa-user-circle text-cowdi me-2"></i>Tài khoản của tôi
        </h2>
      </div>

      {/* Profile Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body text-center py-4">
          <div className="position-relative d-inline-block mb-3">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                width="90"
                height="90"
                className="rounded-circle border border-3 border-cowdi shadow"
                alt={user.display_name}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="rounded-circle bg-cowdi-primary d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 90, height: 90, fontSize: '2rem' }}
              >
                {user.display_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <span
              className="position-absolute bottom-0 end-0 translate-middle-x badge bg-cowdi-primary rounded-pill"
              style={{ fontSize: '0.7rem' }}
            >
              Lv.{level.level}
            </span>
          </div>
          <h4 className="fw-bold mb-1">{user.display_name}</h4>
          <p className="text-muted small mb-2">
            <i className="fas fa-envelope me-1"></i>{user.email}
          </p>
          <span className="badge bg-cowdi-gradient text-white px-3 py-2">{level.title}</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="row g-3 mb-4">
        {[
          { icon: '⭐', value: userData.totalXP, label: 'Tổng XP', color: 'warning' },
          { icon: '🔥', value: userData.streak, label: 'Streak', color: 'danger' },
          { icon: '📚', value: userData.lessonsCompleted, label: 'Bài đã học', color: 'primary' },
          { icon: '✅', value: userData.quizzesCompleted, label: 'Quiz hoàn thành', color: 'success' },
          { icon: '💯', value: userData.perfectQuizzes, label: 'Quiz hoàn hảo', color: 'info' },
          { icon: '🃏', value: wordStats.learned, label: 'Từ đã thuộc', color: 'secondary' },
          { icon: '🪙', value: petData.coins, label: 'Coins', color: 'warning' },
          { icon: '🐾', value: Object.keys(petData.collection).length, label: 'Pet sở hữu', color: 'primary' },
        ].map((s, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div className="card shadow-sm h-100 text-center card-hover">
              <div className="card-body py-3">
                <div className="fs-3">{s.icon}</div>
                <div className={`fs-4 fw-bold text-${s.color}`}>{s.value}</div>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Level Progress */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3"><i className="fas fa-trophy text-warning me-2"></i>Cấp độ hiện tại</h5>
          <div className="d-flex align-items-center gap-3">
            <div className="level-badge-lg">Lv.{level.level}</div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-bold">{level.title}</span>
                {nextLevel && <small className="text-muted">Tiếp theo: {nextLevel.title}</small>}
              </div>
              <div className="progress" style={{ height: '14px' }}>
                <div
                  className="progress-bar progress-bar-cowdi"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <small className="text-muted mt-1 d-block">
                {userData.totalXP} / {nextLevel ? nextLevel.xpRequired : level.xpRequired} XP
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Active Pet */}
      {activePet && species && evo && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3"><i className="fas fa-paw text-cowdi me-2"></i>Pet đang hoạt động</h5>
            <div className="d-flex align-items-center gap-3">
              {evo.image
                ? <img src={evo.image} alt={evo.name} width="64" height="64" style={{ objectFit: 'contain' }} />
                : <div style={{ fontSize: '3rem' }}>{evo.emoji}</div>}
              <div>
                <div className="fw-bold fs-5">{activePet.customName || species.name}</div>
                <small className="text-muted">{evo.name} • {species.name}</small>
                <div className="d-flex gap-2 mt-1 flex-wrap">
                  {Object.entries(activePet.needs || {}).map(([key, val]) => {
                    const icons = { energy: '⚡', happiness: '😊', health: '❤️', knowledge: '📖' };
                    const colors = { energy: 'warning', happiness: 'info', health: 'danger', knowledge: 'primary' };
                    return (
                      <span key={key} className={`badge bg-${colors[key]} bg-opacity-25 text-${colors[key]}`}>
                        {icons[key]} {val}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <i className="fas fa-medal text-warning me-2"></i>
            Thành tựu ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </h5>
          {unlockedAchievements.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {unlockedAchievements.map((a) => (
                <span key={a.id} className="badge bg-light text-dark border px-3 py-2" title={a.description}>
                  {a.icon} {a.title}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-0">Chưa đạt thành tựu nào. Hãy tiếp tục học nhé!</p>
          )}
        </div>
      </div>

      {/* Active Days Calendar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <i className="fas fa-calendar-check text-success me-2"></i>
            Lịch học tập (28 ngày gần nhất)
          </h5>
          <div className="streak-calendar">
            {Array.from({ length: 28 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (27 - i));
              const active = userData.activeDays.includes(d.toDateString());
              const isToday = i === 27;
              return (
                <div
                  key={i}
                  className={`calendar-day ${active ? 'active' : ''} ${isToday ? 'today' : ''}`}
                  title={d.toLocaleDateString('vi-VN')}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <i className="fas fa-tasks text-primary me-2"></i>Nhiệm vụ hàng ngày
          </h5>
          <div className="d-flex gap-3 flex-wrap">
            <div className={`d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${userData.dailyTasks?.lessonDone ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'}`}>
              {userData.dailyTasks?.lessonDone ? '✅' : '⬜'} Hoàn thành 1 bài học
            </div>
            <div className={`d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${userData.dailyTasks?.vocabDone ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'}`}>
              {userData.dailyTasks?.vocabDone ? '✅' : '⬜'} Ôn tập từ vựng
            </div>
          </div>
        </div>
      </div>

      {/* Display Name / Nickname */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3"><i className="fas fa-id-card text-cowdi me-2"></i>Tên hiển thị</h5>
          <p className="text-muted small mb-3">
            Tên này sẽ hiển thị trên bảng xếp hạng. Nếu bạn không đặt tên, tên tài khoản Google sẽ được sử dụng.
          </p>
          {editingNick ? (
            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: 250 }}
                value={nickInput}
                onChange={(e) => setNickInput(e.target.value)}
                maxLength={20}
                placeholder={user.display_name || 'Nhập tên hiển thị...'}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && (() => {
                  const name = nickInput.trim() || user.display_name || '';
                  setNickname(name);
                  setEditingNick(false);
                })()}
              />
              <button className="btn btn-cowdi-primary" onClick={() => {
                const name = nickInput.trim() || user.display_name || '';
                setNickname(name);
                setEditingNick(false);
              }}>Lưu</button>
              <button className="btn btn-outline-secondary" onClick={() => setEditingNick(false)}>Huỷ</button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-5">{petData.nickname || user.display_name || '(Ẩn danh)'}</span>
              {!petData.nickname && user.display_name && (
                <span className="badge bg-secondary bg-opacity-25 text-secondary">Tên Google</span>
              )}
              <button className="btn btn-sm btn-outline-cowdi ms-auto" onClick={() => {
                setNickInput(petData.nickname || user.display_name || '');
                setEditingNick(true);
              }}>
                <i className="fas fa-edit me-1"></i>Đổi tên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Push Notification Settings */}
      <PushSettingsCard petName={petData.nickname || species?.name || 'Pet'} petIcon={evo?.image} />

      {/* Study Schedule */}
      <ScheduleSettingsCard petName={petData.nickname || species?.name || 'Pet'} />

      {/* Account Actions */}
      <div className="card shadow-sm mb-4 border-danger border-opacity-25">
        <div className="card-body">
          <h5 className="fw-bold mb-3"><i className="fas fa-cog me-2"></i>Cài đặt tài khoản</h5>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-outline-secondary" onClick={logout}>
              <i className="fas fa-sign-out-alt me-2"></i>Đăng xuất
            </button>
          </div>
          <hr />
          <small className="text-muted">
            Đăng nhập bằng: <strong>{user.email}</strong>
          </small>
        </div>
      </div>
    </div>
  );
}

// ── Push Notification Card ─────────────────────────────────────────────────
function PushSettingsCard({ petName, petIcon }) {
  const { isSupported, permission, isSubscribed, loading, error, subscribe, unsubscribe, sendTest } = usePush();
  const [testSent, setTestSent] = useState(false);

  const isIOSStandalone =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.matchMedia('(display-mode: standalone)').matches;

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTest = async () => {
    await sendTest();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          {petIcon && (
            <img
              src={petIcon}
              alt={petName}
              style={{ width: 48, height: 48, objectFit: 'contain' }}
              className="me-3"
            />
          )}
          <div className="flex-grow-1">
            <h5 className="fw-bold mb-0">
              <i className="fas fa-bell me-2 text-cowdi-primary"></i>Thông báo từ {petName}
            </h5>
            <small className="text-muted">
              Nhận nhắc nhở học tập, thông báo duel, sự kiện đặc biệt
            </small>
          </div>
        </div>

        {!isSupported ? (
          <div className="alert alert-warning mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Trình duyệt này không hỗ trợ thông báo. Hãy dùng Chrome, Edge hoặc Safari.
          </div>
        ) : isIOSStandalone ? (
          <div className="alert alert-info mb-0">
            <i className="fas fa-info-circle me-2"></i>
            Trên iPhone/iPad, bạn cần <strong>"Thêm vào Màn hình chính"</strong> trước rồi mở app từ icon đó để bật thông báo.
          </div>
        ) : permission === 'denied' ? (
          <div className="alert alert-danger mb-0">
            <i className="fas fa-ban me-2"></i>
            Bạn đã chặn thông báo. Hãy mở cài đặt trình duyệt và bật quyền cho cowdi.net.
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--bs-light, #f8f9fa)' }}>
              <div>
                <div className="fw-semibold">
                  {isSubscribed ? '🔔 Đang bật' : '🔕 Đang tắt'}
                </div>
                <small className="text-muted">
                  {isSubscribed
                    ? `${petName} sẽ nhắc bạn quay lại học mỗi ngày`
                    : 'Bật để không bỏ lỡ chuỗi học và lời nhắn từ pet'}
                </small>
              </div>
              <div className="form-check form-switch m-0" style={{ fontSize: '1.5rem' }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={isSubscribed}
                  onChange={handleToggle}
                  disabled={loading}
                  style={{ cursor: loading ? 'wait' : 'pointer' }}
                />
              </div>
            </div>

            {isSubscribed && (
              <div className="mt-3 d-flex gap-2 align-items-center">
                <button
                  className="btn btn-sm btn-outline-cowdi"
                  onClick={handleTest}
                  disabled={loading}
                >
                  <i className="fas fa-paper-plane me-1"></i>Gửi thử
                </button>
                {testSent && (
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>Đã gửi! Kiểm tra thông báo...
                  </small>
                )}
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-3 mb-0 py-2">
                <small><i className="fas fa-times-circle me-2"></i>{error}</small>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Study Schedule Card ────────────────────────────────────────────────────
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function ScheduleSettingsCard({ petName }) {
  const { schedule, loading, saving, error, save } = useSchedule();
  const { isSubscribed } = usePush();
  const [draft, setDraft] = useState(schedule);
  const [savedAt, setSavedAt] = useState(null);

  // Sync draft khi schedule load xong từ server
  useEffect(() => {
    setDraft(schedule);
  }, [schedule.enabled, schedule.timeLocal, schedule.daysOfWeek?.join(','), schedule.message]);

  const toggleDay = (d) => {
    const set = new Set(draft.daysOfWeek);
    if (set.has(d)) set.delete(d); else set.add(d);
    setDraft({ ...draft, daysOfWeek: [...set].sort() });
  };

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) {
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    }
  };

  const presetWeekdays = () => setDraft({ ...draft, daysOfWeek: [1, 2, 3, 4, 5] });
  const presetDaily    = () => setDraft({ ...draft, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
  const presetWeekend  = () => setDraft({ ...draft, daysOfWeek: [0, 6] });

  const tz = draft.timezone ||
    (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) ||
    'Asia/Ho_Chi_Minh';

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className="flex-grow-1">
            <h5 className="fw-bold mb-0">
              <i className="fas fa-calendar-alt me-2 text-cowdi-primary"></i>
              Lịch học của bạn
            </h5>
            <small className="text-muted">
              Đặt giờ học cố định để {petName} tự nhắc bạn vào mỗi ngày bạn chọn
            </small>
          </div>
        </div>

        {!isSubscribed && (
          <div className="alert alert-warning py-2 small mb-3">
            <i className="fas fa-bell-slash me-2"></i>
            Bật <strong>Thông báo từ {petName}</strong> ở khung phía trên để nhận lịch nhắc.
          </div>
        )}

        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-cowdi-primary"></div>
          </div>
        ) : (
          <>
            {/* Toggle bật/tắt */}
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3"
                 style={{ background: 'var(--bs-light, #f8f9fa)' }}>
              <div>
                <div className="fw-semibold">
                  {draft.enabled ? '⏰ Đang bật lịch nhắc' : '💤 Đang tắt'}
                </div>
                <small className="text-muted">
                  {draft.enabled
                    ? `Sẽ nhắc lúc ${draft.timeLocal} (${tz})`
                    : 'Bật để Cowdi tự nhắc bạn học mỗi ngày'}
                </small>
              </div>
              <div className="form-check form-switch m-0" style={{ fontSize: '1.5rem' }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={!!draft.enabled}
                  onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                />
              </div>
            </div>

            {/* Giờ */}
            <div className="mb-3">
              <label className="form-label fw-semibold small mb-1">⏱ Giờ nhắc</label>
              <input
                type="time"
                className="form-control"
                style={{ maxWidth: 180 }}
                value={draft.timeLocal}
                onChange={(e) => setDraft({ ...draft, timeLocal: e.target.value })}
              />
            </div>

            {/* Ngày trong tuần */}
            <div className="mb-3">
              <label className="form-label fw-semibold small mb-1">📅 Các ngày trong tuần</label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {DAY_LABELS.map((label, i) => {
                  const active = draft.daysOfWeek?.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`btn btn-sm ${active ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                      style={{ minWidth: 48 }}
                      onClick={() => toggleDay(i)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="d-flex flex-wrap gap-1">
                <button type="button" className="btn btn-sm btn-link p-0 me-2" onClick={presetWeekdays}>
                  T2-T6
                </button>
                <button type="button" className="btn btn-sm btn-link p-0 me-2" onClick={presetDaily}>
                  Mỗi ngày
                </button>
                <button type="button" className="btn btn-sm btn-link p-0" onClick={presetWeekend}>
                  Cuối tuần
                </button>
              </div>
            </div>

            {/* Lời nhắc tuỳ chỉnh */}
            <div className="mb-3">
              <label className="form-label fw-semibold small mb-1">💬 Lời nhắc (tuỳ chọn)</label>
              <input
                type="text"
                className="form-control"
                maxLength={200}
                placeholder={`Ví dụ: "Đi học thôi, ${petName} đợi rồi!"`}
                value={draft.message || ''}
                onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              />
              <small className="text-muted">Để trống thì Cowdi sẽ chọn câu nhắc ngẫu nhiên dễ thương.</small>
            </div>

            {/* Save */}
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-cowdi-primary"
                onClick={handleSave}
                disabled={saving || !draft.daysOfWeek?.length}
              >
                {saving ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</>
                ) : (
                  <><i className="fas fa-save me-2"></i>Lưu lịch học</>
                )}
              </button>
              {savedAt && (
                <small className="text-success">
                  <i className="fas fa-check me-1"></i>Đã lưu lúc {new Date(savedAt).toLocaleTimeString('vi-VN')}
                </small>
              )}
              {!draft.daysOfWeek?.length && (
                <small className="text-muted">Hãy chọn ít nhất 1 ngày.</small>
              )}
            </div>

            {error && (
              <div className="alert alert-danger mt-3 mb-0 py-2">
                <small><i className="fas fa-times-circle me-2"></i>{error}</small>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
