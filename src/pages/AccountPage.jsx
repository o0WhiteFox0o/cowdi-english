import { useAuth } from '../hooks/useAuth';
import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { usePush } from '../hooks/usePush';
import { useSchedule } from '../hooks/useSchedule';
import { LEVELS, ACHIEVEMENTS, getGroup } from '../data/lessons';
import GroupPicker from '../features/onboarding/GroupPicker';
import {
  PET_REGISTRY,
  calculatePowerScore,
  PET_ACHIEVEMENTS,
} from '../data/pets';
import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Emoji from '../components/Emoji';
import { useToast } from '../components/Toast';

/**
 * ExpandableAchievementCard:
 * - Collapsed state (default): shows icon, title, badge (Đã đạt / Chưa đạt), short desc, chevron.
 * - Expanded state (on click): shows condition, current progress / target, progress bar, reward, status.
 * - Single-card accordion behavior: only 1 card open at a time.
 */
function ExpandableAchievementCard({ ach, isExpanded, onToggle }) {
  return (
    <div
      className={`acc-achieve-card ${ach.isUnlocked ? 'unlocked' : 'locked'} ${isExpanded ? 'expanded' : 'collapsed'}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`${ach.title} - ${ach.isUnlocked ? 'Đã đạt' : 'Chưa đạt'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* ── Hàng 1: Icon • Badge trạng thái • Nút mở rộng/thu gọn ── */}
      <div className="acc-achieve-row-top">
        <div className="acc-achieve-emoji" aria-hidden="true">
          <Emoji e={ach.icon} size={26} />
        </div>
        <div className="acc-achieve-top-right">
          {ach.isUnlocked ? (
            <span className="badge bg-success bg-opacity-20 text-success rounded-pill px-2 py-1 acc-achieve-badge">
              ✓ Đã đạt
            </span>
          ) : (
            <span className="badge bg-secondary bg-opacity-15 text-muted rounded-pill px-2 py-1 acc-achieve-badge">
              <Icon name="lock" size={10} /> Chưa đạt
            </span>
          )}
          <span
            className="acc-achieve-chevron"
            aria-hidden="true"
            title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {/* ── Hàng 2: Tên thành tựu (Chiều cao vùng tiêu đề thống nhất, tối đa 2 dòng) ── */}
      <div className="acc-achieve-title-row">
        <h6 className="acc-achieve-title" title={ach.title}>
          {ach.title}
        </h6>
      </div>

      {/* ── Hàng 3: Mô tả thành tựu (Chiều cao vùng mô tả thống nhất, tối đa 2 dòng) ── */}
      <div className="acc-achieve-desc-row">
        <p className="acc-achieve-desc" title={ach.desc}>
          {ach.desc}
        </p>
      </div>

      {/* ── Trạng thái mở rộng (Expanded Details) ── */}
      {isExpanded && (
        <div className="acc-achieve-details">
          {/* Condition Box */}
          <div className="acc-achieve-cond">
            <strong>Điều kiện:</strong> {ach.condition}
          </div>

          {/* Progress Row */}
          <div className="acc-achieve-progress-row">
            <span>Tiến độ hiện tại:</span>
            <b>{ach.progressText}</b>
          </div>
          <div className="acc-achieve-progress-track">
            <div
              className="acc-achieve-progress-fill"
              style={{ width: `${ach.progressPct}%` }}
            />
          </div>

          {/* Footer: Reward & Status */}
          <div className="acc-achieve-footer-row">
            <span className="acc-achieve-reward-tag" title="Phần thưởng khi hoàn thành">
              <Emoji e={ach.rewardIcon || '🥛'} size={12} /> +{ach.reward} {ach.rewardUnit || 'Sữa'}
            </span>
            <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
              {ach.isUnlocked ? 'Đã nhận thưởng' : 'Chưa mở khóa'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  useSEO(SEO_CONFIGS['/account']);
  const { user, loginWithGoogle, logout, authFetch } = useAuth();
  const { userData, refreshWallet } = useUser();
  const { petData, setNickname } = usePet();
  const navigate = useNavigate();
  const showToast = useToast();

  // Tab state: 'pet_achievements' | 'learning_achievements' | 'settings'
  const [activeTab, setActiveTab] = useState('pet_achievements');
  const [editingNick, setEditingNick] = useState(false);
  const [nickInput, setNickInput] = useState('');
  const [achieveFilter, setAchieveFilter] = useState('all');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [ready, setReady] = useState(false);
  const [walletActionLoading, setWalletActionLoading] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);

  const currentGroup = userData.learnerGroup ? getGroup(userData.learnerGroup) : null;
  const wallet = userData.wallet || { milk: userData.availableXP || 0, gem: 0, stone: 0, stone_shard: 0 };

  useEffect(() => {
    if (window.location.hash === '#wallet') {
      setTimeout(() => {
        const el = document.getElementById('wallet');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, []);

  async function handleExchangeStone() {
    setWalletActionLoading(true);
    try {
      const res = await authFetch('/api/wallet/exchange-stone', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (refreshWallet) await refreshWallet();
        showToast('Đổi thành công 1 Đá nguyên tố! 🪨', 'success');
      } else {
        showToast(data.error || 'Đổi đá thất bại.', 'danger');
      }
    } catch {
      showToast('Lỗi kết nối khi đổi đá.', 'danger');
    } finally {
      setWalletActionLoading(false);
    }
  }

  async function handleCombineShards() {
    setWalletActionLoading(true);
    try {
      const res = await authFetch('/api/wallet/combine-shards', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (refreshWallet) await refreshWallet();
        showToast('Ghép thành công 1 Đá nguyên tố! 🪨', 'success');
      } else {
        showToast(data.error || 'Ghép mảnh thất bại.', 'danger');
      }
    } catch {
      showToast('Lỗi kết nối khi ghép mảnh.', 'danger');
    } finally {
      setWalletActionLoading(false);
    }
  }

  // Expandable achievement state: stores the ID of the single expanded achievement, or null if none
  const [expandedAchId, setExpandedAchId] = useState(null);

  const toggleExpandAch = (id) => {
    setExpandedAchId((prev) => (prev === id ? null : id));
  };

  // Auto-fill nickname from Google display_name if not set
  useEffect(() => {
    if (user && !petData.nickname && user.display_name) {
      setNickname(user.display_name);
    }
  }, [user?.id]);

  // Loading tick
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Level calculation
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
    ? Math.min(100, Math.max(0, ((userData.totalXP - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100))
    : 100;

  // Pet collection statistics for Pet Achievements
  const totalSpecies = Object.keys(PET_REGISTRY).length;
  const ownedCount = Object.keys(petData.collection || {}).length;
  const maxEvo = Object.values(petData.collection || {}).reduce((max, p) => Math.max(max, p.evolution || 0), 0);
  const highestPower = Object.values(petData.collection || {}).reduce((max, pet) => {
    const sp = PET_REGISTRY[pet.speciesId];
    return Math.max(max, sp ? calculatePowerScore(pet, sp) : 0);
  }, 0);

  // ── 1. Detailed Pet Achievements (Thành tựu thú cưng) ─────────────────────
  const petAchievementsDetailed = useMemo(() => {
    return PET_ACHIEVEMENTS.map((ach) => {
      const isUnlocked = (petData.petAchievements || []).includes(ach.id);
      let condition = '';
      let currentVal = 0;
      let targetVal = 1;
      let progressText = '';

      switch (ach.id) {
        case 'first_pet':
          condition = 'Nhận nuôi ít nhất 1 bạn thú cưng';
          currentVal = Math.min(1, ownedCount);
          targetVal = 1;
          progressText = `${currentVal} / 1 pet`;
          break;
        case 'pet_collector_5':
          condition = 'Sở hữu 5 thú cưng trong bộ sưu tập';
          currentVal = Math.min(5, ownedCount);
          targetVal = 5;
          progressText = `${currentVal} / 5 pet`;
          break;
        case 'pet_collector_10':
          condition = 'Sở hữu 10 thú cưng trong bộ sưu tập';
          currentVal = Math.min(10, ownedCount);
          targetVal = 10;
          progressText = `${currentVal} / 10 pet`;
          break;
        case 'pet_collector_all':
          condition = `Sở hữu tất cả ${totalSpecies} loài thú cưng Cowdi`;
          currentVal = Math.min(totalSpecies, ownedCount);
          targetVal = totalSpecies;
          progressText = `${currentVal} / ${totalSpecies} pet`;
          break;
        case 'pet_evolution_3':
          condition = 'Tiến hóa 1 thú cưng lên giai đoạn 3 (Super)';
          currentVal = Math.min(3, maxEvo);
          targetVal = 3;
          progressText = `Giai đoạn ${currentVal} / 3`;
          break;
        case 'pet_evolution_4':
          condition = 'Tiến hóa 1 thú cưng lên giai đoạn cuối (Legendary)';
          currentVal = Math.min(4, maxEvo);
          targetVal = 4;
          progressText = `Giai đoạn ${currentVal} / 4`;
          break;
        case 'pet_power_100':
          condition = 'Nuôi thú cưng đạt từ 100 điểm Power Score trở lên';
          currentVal = Math.min(100, highestPower);
          targetVal = 100;
          progressText = `${currentVal} / 100 pts`;
          break;
        case 'pet_coins_500':
        case 'pet_milk_1500':
          condition = 'Tích lũy tổng cộng 1 500 Sữa từ học tập và nhiệm vụ';
          currentVal = Math.min(1500, userData.totalXP || 0);
          targetVal = 1500;
          progressText = `${currentVal} / 1 500 Sữa`;
          break;
        default:
          condition = ach.desc;
          currentVal = isUnlocked ? 1 : 0;
          targetVal = 1;
          progressText = isUnlocked ? '1 / 1' : '0 / 1';
      }

      if (isUnlocked) {
        currentVal = targetVal;
      }
      const progressPct = isUnlocked ? 100 : Math.round((currentVal / targetVal) * 100);

      return {
        ...ach,
        condition,
        currentVal,
        targetVal,
        progressText,
        progressPct,
        reward: 90, // 90 Sữa per achievement (D12)
        rewardUnit: 'Sữa',
        rewardIcon: '🥛',
        isUnlocked,
      };
    });
  }, [petData.collection, petData.petAchievements, userData.totalXP, ownedCount, maxEvo, highestPower, totalSpecies]);

  const unlockedPetCount = petAchievementsDetailed.filter((a) => a.isUnlocked).length;
  const totalPetAchievements = petAchievementsDetailed.length;
  const petAchPct = totalPetAchievements > 0 ? Math.round((unlockedPetCount / totalPetAchievements) * 100) : 0;

  // ── 2. Learning & Quiz Achievements (Thành tựu học tập) ────────────────────
  const learningAchievementsDetailed = useMemo(() => {
    return (ACHIEVEMENTS || []).map((a) => {
      let cat = 'learning';
      if (a.id.includes('quiz')) cat = 'quiz';
      else if (a.id.includes('streak') || a.id.includes('xp')) cat = 'streak';

      const isUnlocked = (userData.achievements || []).includes(a.id);
      let condition = a.desc || '';
      let currentVal = 0;
      let targetVal = 1;
      let progressText = '';
      let reward = 20;
      let rewardUnit = 'XP';
      let rewardIcon = '⭐';

      switch (a.id) {
        case 'first_lesson':
          condition = 'Hoàn thành ít nhất 1 bài học';
          targetVal = 1;
          currentVal = Math.min(targetVal, userData.lessonsCompleted || 0);
          progressText = `${currentVal} / 1 bài học`;
          reward = 20;
          rewardUnit = 'XP';
          rewardIcon = '⭐';
          break;
        case 'five_lessons':
          condition = 'Hoàn thành 5 bài học';
          targetVal = 5;
          currentVal = Math.min(targetVal, userData.lessonsCompleted || 0);
          progressText = `${currentVal} / 5 bài học`;
          reward = 50;
          rewardUnit = 'XP';
          rewardIcon = '⭐';
          break;
        case 'first_quiz':
          condition = 'Hoàn thành ít nhất 1 bài quiz';
          targetVal = 1;
          currentVal = Math.min(targetVal, userData.quizzesCompleted || 0);
          progressText = `${currentVal} / 1 quiz`;
          reward = 20;
          rewardUnit = 'XP';
          rewardIcon = '⭐';
          break;
        case 'perfect_quiz':
          condition = 'Đạt điểm tuyệt đối trong 1 bài quiz';
          targetVal = 1;
          currentVal = Math.min(targetVal, userData.perfectQuizzes || 0);
          progressText = `${currentVal} / 1 quiz`;
          reward = 30;
          rewardUnit = 'XP';
          rewardIcon = '⭐';
          break;
        case 'word_master_10':
          condition = 'Học thuộc 10 từ vựng';
          targetVal = 10;
          currentVal = Math.min(targetVal, userData.wordsLearned || 0);
          progressText = `${currentVal} / 10 từ`;
          reward = 90;
          rewardUnit = 'Sữa';
          rewardIcon = '🥛';
          break;
        case 'word_master_50':
          condition = 'Học thuộc 50 từ vựng';
          targetVal = 50;
          currentVal = Math.min(targetVal, userData.wordsLearned || 0);
          progressText = `${currentVal} / 50 từ`;
          reward = 240;
          rewardUnit = 'Sữa';
          rewardIcon = '🥛';
          break;
        case 'streak_3':
          condition = 'Duy trì chuỗi học 3 ngày liên tiếp';
          targetVal = 3;
          currentVal = Math.min(targetVal, userData.streak || 0);
          progressText = `${currentVal} / 3 ngày`;
          reward = 90;
          rewardUnit = 'Sữa';
          rewardIcon = '🥛';
          break;
        case 'streak_7':
          condition = 'Duy trì chuỗi học 7 ngày liên tiếp';
          targetVal = 7;
          currentVal = Math.min(targetVal, userData.streak || 0);
          progressText = `${currentVal} / 7 ngày`;
          reward = 210;
          rewardUnit = 'Sữa';
          rewardIcon = '🥛';
          break;
        case 'xp_100':
          condition = 'Đạt 100 XP trong hành trình học tập';
          targetVal = 100;
          currentVal = Math.min(targetVal, userData.totalXP || 0);
          progressText = `${currentVal} / 100 XP`;
          reward = 60;
          rewardUnit = 'Sữa';
          rewardIcon = '🥛';
          break;
        case 'xp_500':
          condition = 'Đạt 500 XP trong hành trình học tập';
          targetVal = 500;
          currentVal = Math.min(targetVal, userData.totalXP || 0);
          progressText = `${currentVal} / 500 XP`;
          reward = 150;
          rewardUnit = 'Sữa';
          rewardIcon = '🥛';
          break;
        default:
          condition = a.desc || '';
          currentVal = isUnlocked ? 1 : 0;
          targetVal = 1;
          progressText = isUnlocked ? '1 / 1' : '0 / 1';
          reward = 20;
          rewardUnit = 'XP';
          rewardIcon = '⭐';
      }

      if (isUnlocked) {
        currentVal = targetVal;
      }
      const progressPct = isUnlocked ? 100 : Math.round((currentVal / targetVal) * 100);

      return {
        id: a.id,
        title: a.title,
        desc: a.desc || a.description,
        icon: a.icon,
        category: cat,
        condition,
        currentVal,
        targetVal,
        progressText,
        progressPct,
        reward,
        rewardUnit,
        rewardIcon,
        isUnlocked,
      };
    });
  }, [userData]);

  const filteredLearningAchievements = useMemo(() => {
    if (achieveFilter === 'all') return learningAchievementsDetailed;
    return learningAchievementsDetailed.filter((a) => a.category === achieveFilter);
  }, [learningAchievementsDetailed, achieveFilter]);

  const unlockedLearningCount = learningAchievementsDetailed.filter((a) => a.isUnlocked).length;
  const totalLearningAchievements = learningAchievementsDetailed.length;
  const learningAchPct = totalLearningAchievements > 0 ? Math.round((unlockedLearningCount / totalLearningAchievements) * 100) : 0;

  // Handle nickname save
  const handleSaveNick = () => {
    const name = nickInput.trim() || user?.display_name || '';
    if (name) setNickname(name);
    setEditingNick(false);
  };

  if (!ready) {
    return (
      <div className="fade-in">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-success mb-3" role="status"></div>
            <p className="text-secondary font-hand">Đang mở trang tài khoản Cowdi...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Chưa đăng nhập ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="fade-in acc-v2">
        <div className="acc-hero text-center py-5">
          <div className="mb-3 emoji-big">
            <Icon name="lock" size={80} />
          </div>
          <h2 className="fw-bold mb-2">Đăng nhập để vào Sổ tay Cowdi</h2>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: 520, fontSize: '0.95rem' }}>
            Đăng nhập bằng tài khoản Google để lưu trữ tiến trình học tập an toàn, nuôi pet Cowdi và đồng bộ dữ liệu trên mọi thiết bị.
          </p>
          <button className="btn btn-cowdi-primary btn-lg px-4 shadow-sm" onClick={loginWithGoogle}>
            <i className="fab fa-google me-2"></i>Đăng nhập bằng Google
          </button>

          <div className="row g-3 mt-4 justify-content-center" style={{ maxWidth: 640, margin: '0 auto' }}>
            {[
              { icon: '☁️', title: 'Đồng bộ đám mây', desc: 'Tiến trình lưu trữ an toàn' },
              { icon: '🐾', title: 'Nuôi Pet & Sưu tập', desc: 'Mở khoá pet và tiến hoá' },
              { icon: '🏆', title: 'Bảng vàng thành tích', desc: 'Tích luỹ XP & Danh hiệu' },
            ].map((f, i) => (
              <div className="col-12 col-sm-4" key={i}>
                <div className="card shadow-sm h-100 text-center border-0" style={{ background: 'var(--paper-3)', borderRadius: 16 }}>
                  <div className="card-body p-3">
                    <div className="fs-1 mb-2 emoji-big"><Emoji e={f.icon} size={36} /></div>
                    <div className="fw-bold fs-6">{f.title}</div>
                    <small className="text-muted" style={{ fontSize: '0.78rem' }}>{f.desc}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentGroup = userData.learnerGroup ? getGroup(userData.learnerGroup) : null;
  // ── Đã đăng nhập ─────────────────────────────────────────────────────────
  return (
    <div className="fade-in acc-v2">
      {showGroupPicker && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.45)', zIndex: 1080, overflowY: 'auto' }}
        >
          <div className="card shadow p-3 p-md-4 w-100" style={{ maxWidth: 880, maxHeight: '92vh', overflowY: 'auto', borderRadius: 18 }}>
            <GroupPicker compact onDone={() => setShowGroupPicker(false)} />
          </div>
        </div>
      )}
      {/* ── Page Header ── */}
      <div className="acc-header">
        <div className="acc-header-left">
          <div className="acc-header-badge">
            <Icon name="user" size={14} /> Sổ tay cá nhân
          </div>
          <div>
            <h2 className="acc-header-title">Hồ sơ & Tài khoản</h2>
            <p className="acc-header-sub">Quản lý hồ sơ, thành tựu thú cưng và cài đặt tài khoản</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {currentGroup && (
            <span className="badge rounded-pill px-3 py-2 text-white" style={{ background: currentGroup.color }}>
              Nhóm: {currentGroup.title}
            </span>
          )}
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setShowGroupPicker(true)}>
            Đổi nhóm học
          </button>
        </div>
      </div>

      {/* ── Profile Hero Section ── */}
      <div className="acc-hero">
        <div className="acc-hero-top">
          {/* Avatar with Level Badge */}
          <div className="acc-avatar-wrap">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={petData.nickname || user.display_name}
                className="acc-avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="acc-avatar-fallback">
                {(petData.nickname || user.display_name)?.charAt(0)?.toUpperCase() || 'C'}
              </div>
            )}
            <span className="acc-avatar-lvl">Lv.{level.level}</span>
          </div>

          {/* User Details */}
          <div className="acc-user-info">
            <div className="acc-user-name-row">
              <h3 className="acc-user-name">{petData.nickname || user.display_name}</h3>
              <span className="acc-user-title-badge">{level.title}</span>
              {!editingNick && (
                <button
                  type="button"
                  className="acc-edit-btn"
                  onClick={() => {
                    setNickInput(petData.nickname || user.display_name || '');
                    setEditingNick(true);
                  }}
                  title="Đổi tên hiển thị"
                >
                  <Icon name="pencil" size={12} /> Đổi tên
                </button>
              )}
            </div>

            {/* Inline Rename Form */}
            {editingNick && (
              <div className="acc-rename-form">
                <input
                  type="text"
                  className="acc-rename-input"
                  value={nickInput}
                  onChange={(e) => setNickInput(e.target.value)}
                  maxLength={20}
                  placeholder="Nhập tên hiển thị..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNick();
                    if (e.key === 'Escape') setEditingNick(false);
                  }}
                />
                <button type="button" className="btn btn-sm btn-cowdi-primary px-3" onClick={handleSaveNick}>
                  Lưu
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-2"
                  onClick={() => setEditingNick(false)}
                >
                  Huỷ
                </button>
              </div>
            )}

            <div className="acc-user-email">
              <Icon name="mail" size={14} /> {user.email}
              {petData.nickname && petData.nickname !== user.display_name && (
                <span className="ms-2 text-muted" style={{ fontSize: '0.75rem' }}>
                  (Google: {user.display_name})
                </span>
              )}
            </div>

            {/* XP Progress Bar */}
            <div className="acc-xp-box">
              <div className="acc-xp-header">
                <span className="acc-xp-title">
                  Tiến độ cấp độ: {level.title} (Lv.{level.level})
                </span>
                <span className="acc-xp-val">
                  {userData.totalXP} / {nextLevel ? nextLevel.xpRequired : level.xpRequired} XP
                </span>
              </div>
              <div className="acc-xp-track">
                <div className="acc-xp-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stat Pills */}
        <div className="acc-stats-strip">
          <div className="acc-stat-pill">
            <span className="acc-stat-icon"><Emoji e="🔥" size={20} /></span>
            <span className="acc-stat-num">{userData.streak || 0}</span>
            <span className="acc-stat-label">Chuỗi học</span>
          </div>
          <div className="acc-stat-pill">
            <span className="acc-stat-icon"><Emoji e="⭐" size={20} /></span>
            <span className="acc-stat-num">{userData.totalXP || 0}</span>
            <span className="acc-stat-label">Tổng XP</span>
          </div>
          <div className="acc-stat-pill">
            <span className="acc-stat-icon"><Emoji e="💎" size={20} /></span>
            <span className="acc-stat-num">{wallet.gem || 0}</span>
            <span className="acc-stat-label">GEM</span>
          </div>
          <div className="acc-stat-pill">
            <span className="acc-stat-icon"><Emoji e="🐾" size={20} /></span>
            <span className="acc-stat-num">{ownedCount}/{totalSpecies}</span>
            <span className="acc-stat-label">Thú cưng</span>
          </div>
          <div className="acc-stat-pill">
            <span className="acc-stat-icon"><Emoji e="🏆" size={20} /></span>
            <span className="acc-stat-num">{unlockedPetCount + unlockedLearningCount}/{totalPetAchievements + totalLearningAchievements}</span>
            <span className="acc-stat-label">Thành tựu</span>
          </div>
        </div>

        {/* Ví tài nguyên Kinh tế v2 (Sữa, Gem, Đá, Mảnh đá) */}
        <div id="wallet" className="card shadow-sm border-0 rounded-4 p-3 mt-3 bg-white">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5"><Emoji e="🎒" size={24} /></span>
              <h6 className="fw-bold mb-0">Ví tài nguyên (Kinh tế v2)</h6>
            </div>
            <span className="small text-muted">Dùng cho tiến hoá & chiến đấu</span>
          </div>

          <div className="row g-2 text-center mb-3">
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3 border bg-light">
                <div className="fs-4"><Emoji e="🥛" size={28} /></div>
                <div className="small text-muted fw-semibold">Sữa Cowdi</div>
                <div className="fs-5 fw-bold text-primary">{wallet.milk}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3 border bg-light">
                <div className="fs-4"><Emoji e="💎" size={28} /></div>
                <div className="small text-muted fw-semibold">Gem</div>
                <div className="fs-5 fw-bold text-info">{wallet.gem}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3 border bg-light">
                <div className="fs-4"><Emoji e="🪨" size={28} /></div>
                <div className="small text-muted fw-semibold">Đá nguyên tố</div>
                <div className="fs-5 fw-bold text-success">{wallet.stone}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3 border bg-light">
                <div className="fs-4"><Emoji e="✨" size={28} /></div>
                <div className="small text-muted fw-semibold">Mảnh đá</div>
                <div className="fs-5 fw-bold text-warning">{wallet.stone_shard}</div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap justify-content-end">
            <button
              type="button"
              className="btn btn-sm btn-outline-info fw-semibold"
              disabled={walletActionLoading || wallet.gem < 15}
              onClick={handleExchangeStone}
              title="Đổi 15 Gem lấy 1 Đá nguyên tố (tối đa 1 lần/tuần)"
            >
              🔄 Đổi đá (15 💎 → 1 🪨)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-warning fw-semibold"
              disabled={walletActionLoading || wallet.stone_shard < 10}
              onClick={handleCombineShards}
              title="Ghép 10 mảnh đá thành 1 Đá nguyên tố"
            >
              ✨ Ghép mảnh (10 mảnh → 1 🪨)
            </button>
          </div>
          <div className="small text-muted mt-2 text-center" style={{ fontSize: '0.8rem' }}>
            🥛 Sữa dùng để tiến hoá · 💎 Gem dùng để tiến hoá, đổi đá, quay gacha (sắp có)
          </div>
        </div>
      </div>

      {/* ── 3 Main Tabs Navigation (Thành tựu thú cưng • Thành tựu học tập • Cài đặt) ── */}
      <div className="acc-tabs-wrapper">
        <div className="acc-tabs-header-bar">
          <div className="acc-tabs-header-title">
            <Icon name="redbook" size={16} />
            <span>DANH MỤC SỔ TAY</span>
            <span className="acc-tabs-badge-count">3 mục</span>
          </div>
          <div className="acc-tabs-header-hint">
            <span>✨ Bấm vào tab để chuyển đổi nội dung</span>
          </div>
        </div>

        <div className="acc-tabs-bar" role="tablist" aria-label="Chuyển đổi danh mục hồ sơ">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pet_achievements'}
            className={`acc-tab-btn ${activeTab === 'pet_achievements' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pet_achievements');
              setExpandedAchId(null);
            }}
          >
            <span className="acc-tab-icon-wrap acc-icon-pet">
              <Icon name="star" size={18} />
            </span>
            <span className="acc-tab-text">Thành tựu thú cưng</span>
            <span className="acc-tab-pill-badge">{unlockedPetCount}/{totalPetAchievements}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'learning_achievements'}
            className={`acc-tab-btn ${activeTab === 'learning_achievements' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('learning_achievements');
              setExpandedAchId(null);
            }}
          >
            <span className="acc-tab-icon-wrap acc-icon-study">
              <Icon name="trophy" size={18} />
            </span>
            <span className="acc-tab-text">Thành tựu học tập</span>
            <span className="acc-tab-pill-badge">{unlockedLearningCount}/{totalLearningAchievements}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'settings'}
            className={`acc-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              setExpandedAchId(null);
            }}
          >
            <span className="acc-tab-icon-wrap acc-icon-settings">
              <Icon name="wrench" size={18} />
            </span>
            <span className="acc-tab-text">Cài đặt & Lịch học</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: THÀNH TỰU THÚ CƯNG (PET ACHIEVEMENTS) ── */}
      {activeTab === 'pet_achievements' && (
        <div className="fade-in">
          {/* Pet Achievements Summary Bar & Quick Nav */}
          <div className="acc-achieve-bar">
            <div className="acc-achieve-progress-info">
              <span className="acc-achieve-icon-big"><Emoji e="🐾" size={36} /></span>
              <div className="acc-achieve-progress-wrap">
                <div className="fw-bold fs-6 mb-1 text-ink">
                  Đã đạt {unlockedPetCount} / {totalPetAchievements} thành tựu thú cưng ({petAchPct}%)
                </div>
                <div className="progress" style={{ height: 8, borderRadius: 10, background: 'var(--paper-3)', minWidth: 200 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${petAchPct}%`, borderRadius: 10 }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Links: Cowdi Dex & My Pet */}
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-outline-cowdi d-inline-flex align-items-center gap-1"
                onClick={() => navigate('/pet')}
              >
                <Icon name="paw" size={14} /> Chăm sóc Pet của tôi
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                onClick={() => navigate('/collection')}
              >
                <Icon name="lens" size={14} /> Tra cứu Cowdi Dex
              </button>
            </div>
          </div>

          {/* Pet Achievements Grid (8 Core Achievements) */}
          <div className="acc-achieve-grid">
            {petAchievementsDetailed.map((ach) => (
              <ExpandableAchievementCard
                key={ach.id}
                ach={ach}
                isExpanded={expandedAchId === ach.id}
                onToggle={() => toggleExpandAch(ach.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: THÀNH TỰU HỌC TẬP (LEARNING ACHIEVEMENTS) ── */}
      {activeTab === 'learning_achievements' && (
        <div className="fade-in">
          {/* Learning Achievements Summary Bar */}
          <div className="acc-achieve-bar">
            <div className="acc-achieve-progress-info">
              <span className="acc-achieve-icon-big"><Emoji e="🏆" size={36} /></span>
              <div className="acc-achieve-progress-wrap">
                <div className="fw-bold fs-6 mb-1 text-ink">
                  Đã đạt {unlockedLearningCount} / {totalLearningAchievements} thành tựu học tập ({learningAchPct}%)
                </div>
                <div className="progress" style={{ height: 8, borderRadius: 10, background: 'var(--paper-3)', minWidth: 200 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${learningAchPct}%`, borderRadius: 10 }}
                  />
                </div>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="acc-filter-chips">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'learning', label: 'Bài học & Từ vựng' },
                { id: 'quiz', label: 'Bài Quiz' },
                { id: 'streak', label: 'Chuỗi học & XP' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`acc-filter-chip ${achieveFilter === f.id ? 'active' : ''}`}
                  onClick={() => {
                    setAchieveFilter(f.id);
                    setExpandedAchId(null);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Achievements Grid */}
          <div className="acc-achieve-grid">
            {filteredLearningAchievements.map((ach) => (
              <ExpandableAchievementCard
                key={ach.id}
                ach={ach}
                isExpanded={expandedAchId === ach.id}
                onToggle={() => toggleExpandAch(ach.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: CÀI ĐẶT & LỊCH HỌC (SETTINGS) ── */}
      {activeTab === 'settings' && (
        <div className="fade-in">
          {/* 1. Account Info Section */}
          <div className="acc-settings-card">
            <div className="acc-settings-card-head">
              <div className="acc-settings-icon">
                <Icon name="user" size={20} />
              </div>
              <div>
                <h5 className="acc-settings-title">Thông tin tài khoản</h5>
                <p className="acc-settings-sub">Chi tiết tài khoản liên kết Google của bạn</p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="p-3 rounded-3" style={{ background: 'var(--paper-3)', border: '1px solid var(--paper-line)' }}>
                  <small className="text-muted d-block mb-1">Tên tài khoản Google</small>
                  <div className="fw-bold text-ink">{user.display_name}</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="p-3 rounded-3" style={{ background: 'var(--paper-3)', border: '1px solid var(--paper-line)' }}>
                  <small className="text-muted d-block mb-1">Địa chỉ Email</small>
                  <div className="fw-bold text-ink">{user.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Web Push Notifications */}
          <PushSettingsCard petName={petData.nickname || 'Cowdi'} />

          {/* 3. Study Schedule */}
          <ScheduleSettingsCard petName={petData.nickname || 'Cowdi'} />

          {/* 4. Security & Logout */}
          <div className="acc-settings-card border-danger border-opacity-25">
            <div className="acc-settings-card-head">
              <div className="acc-settings-icon" style={{ background: 'rgba(234, 90, 90, 0.15)', color: 'var(--red)' }}>
                <Icon name="lock" size={20} />
              </div>
              <div>
                <h5 className="acc-settings-title text-danger">Bảo mật & Đăng xuất</h5>
                <p className="acc-settings-sub">Quản lý phiên đăng nhập tài khoản</p>
              </div>
            </div>

            {showLogoutConfirm ? (
              <div className="p-3 rounded-3 bg-light border border-danger border-opacity-50">
                <p className="mb-3 text-ink fw-semibold">
                  Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
                </p>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-danger btn-sm px-3" onClick={logout}>
                    <i className="fas fa-sign-out-alt me-1"></i> Xác nhận đăng xuất
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Huỷ
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <span className="small text-muted">
                  Đang đăng nhập an toàn với <strong>{user.email}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <i className="fas fa-sign-out-alt"></i> Đăng xuất tài khoản
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Push Notification Component ─────────────────────────────────────────────
function PushSettingsCard({ petName }) {
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
    <div className="acc-settings-card">
      <div className="acc-settings-card-head">
        <div className="acc-settings-icon">
          <Icon name="bell" size={20} />
        </div>
        <div className="flex-grow-1">
          <h5 className="acc-settings-title">Thông báo nhắc nhở từ {petName}</h5>
          <p className="acc-settings-sub">Nhận thông báo nhắc học, sự kiện thú vị và duy trì chuỗi học mỗi ngày</p>
        </div>
      </div>

      {!isSupported ? (
        <div className="alert alert-warning mb-0 py-2 small">
          <Icon name="warning" size={14} /> Trình duyệt này không hỗ trợ Push Notifications. Khuyên dùng Chrome, Edge hoặc Safari.
        </div>
      ) : isIOSStandalone ? (
        <div className="alert alert-info mb-0 py-2 small">
          <Icon name="info" size={14} /> Trên iOS, bạn vui lòng chọn <strong>"Thêm vào Màn hình chính"</strong> để nhận thông báo.
        </div>
      ) : permission === 'denied' ? (
        <div className="alert alert-danger mb-0 py-2 small">
          <i className="fas fa-ban me-1"></i> Quyền thông báo đang bị chặn. Vui lòng mở cài đặt trình duyệt để cho phép.
        </div>
      ) : (
        <>
          <div
            className="d-flex align-items-center justify-content-between p-3 rounded-3"
            style={{ background: 'var(--paper-3)', border: '1px solid var(--paper-line)' }}
          >
            <div>
              <div className="fw-semibold text-ink">
                {isSubscribed ? (
                  <span className="text-success"><Icon name="bell" size={15} /> Đang bật thông báo</span>
                ) : (
                  <span className="text-muted"><Icon name="bellOff" size={15} /> Đang tắt thông báo</span>
                )}
              </div>
              <small className="text-muted">
                {isSubscribed
                  ? `${petName} sẽ nhắc bạn ôn bài và giữ streak mỗi ngày`
                  : 'Bật thông báo để không bỏ lỡ streak và quà tặng'}
              </small>
            </div>
            <div className="form-check form-switch m-0" style={{ fontSize: '1.4rem' }}>
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
            <div className="mt-3 d-flex gap-2 align-items-center flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-outline-cowdi"
                onClick={handleTest}
                disabled={loading}
              >
                <i className="fas fa-paper-plane me-1"></i> Gửi thử thông báo
              </button>
              {testSent && (
                <small className="text-success fw-semibold">
                  <i className="fas fa-check me-1"></i> Đã gửi thông báo thử nghiệm!
                </small>
              )}
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-3 mb-0 py-2 small">
              <i className="fas fa-times-circle me-1"></i> {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Study Schedule Component ────────────────────────────────────────────────
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function ScheduleSettingsCard({ petName }) {
  const { schedule, loading, saving, error, save } = useSchedule();
  const { isSubscribed } = usePush();
  const [draft, setDraft] = useState(schedule);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    setDraft(schedule);
  }, [schedule.enabled, schedule.timeLocal, schedule.daysOfWeek?.join(','), schedule.message]);

  const toggleDay = (d) => {
    const set = new Set(draft.daysOfWeek);
    if (set.has(d)) set.delete(d);
    else set.add(d);
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
  const presetDaily = () => setDraft({ ...draft, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
  const presetWeekend = () => setDraft({ ...draft, daysOfWeek: [0, 6] });

  const tz =
    draft.timezone ||
    (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) ||
    'Asia/Ho_Chi_Minh';

  return (
    <div className="acc-settings-card">
      <div className="acc-settings-card-head">
        <div className="acc-settings-icon">
          <Icon name="calendar" size={20} />
        </div>
        <div>
          <h5 className="acc-settings-title">Lịch học tập cá nhân</h5>
          <p className="acc-settings-sub">Thiết lập khung giờ và các ngày trong tuần để {petName} nhắc bạn học đúng giờ</p>
        </div>
      </div>

      {!isSubscribed && (
        <div className="alert alert-warning py-2 small mb-3">
          <Icon name="bell" size={14} /> Bạn cần bật <strong>Thông báo nhắc nhở</strong> ở khung phía trên để nhận được lời nhắc học.
        </div>
      )}

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-success"></div>
        </div>
      ) : (
        <>
          {/* Toggle Switch */}
          <div
            className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3"
            style={{ background: 'var(--paper-3)', border: '1px solid var(--paper-line)' }}
          >
            <div>
              <div className="fw-semibold text-ink">
                {draft.enabled ? (
                  <span className="text-success"><Icon name="clock" size={15} /> Đang bật lịch nhắc học</span>
                ) : (
                  <span className="text-muted"><Icon name="sleep" size={15} /> Đang tắt lịch nhắc</span>
                )}
              </div>
              <small className="text-muted">
                {draft.enabled
                  ? `Sẽ nhắc lúc ${draft.timeLocal} (${tz})`
                  : 'Bật để thú cưng tự động nhắc nhở bạn mỗi ngày'}
              </small>
            </div>
            <div className="form-check form-switch m-0" style={{ fontSize: '1.4rem' }}>
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={!!draft.enabled}
                onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
              />
            </div>
          </div>

          {/* Time Picker */}
          <div className="mb-3">
            <label className="form-label fw-semibold small mb-1 text-ink">
              <Icon name="timer" size={14} /> Giờ nhắc học
            </label>
            <input
              type="time"
              className="form-control"
              style={{ maxWidth: 180, borderRadius: 10 }}
              value={draft.timeLocal || '20:00'}
              onChange={(e) => setDraft({ ...draft, timeLocal: e.target.value })}
            />
          </div>

          {/* Day of Week Selector */}
          <div className="mb-3">
            <label className="form-label fw-semibold small mb-1 text-ink">
              <Icon name="calendar" size={14} /> Các ngày nhắc trong tuần
            </label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {DAY_LABELS.map((label, i) => {
                const active = draft.daysOfWeek?.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`btn btn-sm ${active ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                    style={{ minWidth: 46, borderRadius: 10, fontWeight: 700 }}
                    onClick={() => toggleDay(i)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={presetWeekdays}>
                T2 - T6
              </button>
              <span className="text-muted">•</span>
              <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={presetDaily}>
                Mỗi ngày
              </button>
              <span className="text-muted">•</span>
              <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={presetWeekend}>
                Cuối tuần
              </button>
            </div>
          </div>

          {/* Custom Reminder Message */}
          <div className="mb-3">
            <label className="form-label fw-semibold small mb-1 text-ink">
              <Icon name="chat" size={14} /> Lời nhắn nhắc nhở (tùy chọn)
            </label>
            <input
              type="text"
              className="form-control"
              style={{ borderRadius: 10 }}
              maxLength={200}
              placeholder={`Ví dụ: "Đến giờ học tiếng Anh cùng ${petName} rồi!"`}
              value={draft.message || ''}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
            />
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
              Nếu để trống, Cowdi sẽ gửi lời nhắn ngẫu nhiên vui vẻ.
            </small>
          </div>

          {/* Save Action */}
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-cowdi-primary px-3"
              onClick={handleSave}
              disabled={saving || !draft.daysOfWeek?.length}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span> Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i> Lưu lịch học
                </>
              )}
            </button>
            {savedAt && (
              <small className="text-success fw-semibold">
                <i className="fas fa-check me-1"></i> Đã lưu lịch học thành công!
              </small>
            )}
            {!draft.daysOfWeek?.length && (
              <small className="text-muted">Vui lòng chọn ít nhất 1 ngày.</small>
            )}
          </div>

          {error && (
            <div className="alert alert-danger mt-3 mb-0 py-2 small">
              <i className="fas fa-times-circle me-1"></i> {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}
