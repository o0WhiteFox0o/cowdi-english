import { useState, useMemo, useEffect, useRef } from 'react';
import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { ALL_LESSONS, STANDARDS } from '../data/lessons';
import { getLessonAccess, getNextPathLesson } from '../data/path';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';
import Emoji from '../components/Emoji';

// ── Level & Skill Configurations ────────────────────────────────────────────
const LEVEL_CONFIG = {
  starter:              { label: 'Mới học', icon: 'sprout', color: '#7DBE4B' },
  beginner:             { label: 'Cơ bản', icon: 'sprout', color: '#4CAF50' },
  elementary:           { label: 'Sơ cấp', icon: 'sprout', color: '#8BC34A' },
  intermediate:         { label: 'Trung cấp', icon: 'leaf', color: '#FF9800' },
  'upper-intermediate': { label: 'Trung cao', icon: 'leaf', color: '#FF5722' },
  advanced:             { label: 'Nâng cao', icon: 'tree', color: '#F44336' },
};

const SKILL_CONFIG = {
  listening:  { label: 'Listening',  icon: 'headphones', color: '#4EA8E8' },
  speaking:   { label: 'Speaking',   icon: 'mic',        color: '#FF9800' },
  reading:    { label: 'Reading',    icon: 'book',       color: '#7DBE4B' },
  writing:    { label: 'Writing',    icon: 'pencil',     color: '#9C27B0' },
  grammar:    { label: 'Grammar',    icon: 'puzzle',     color: '#E91E63' },
  vocabulary: { label: 'Từ vựng',    icon: 'cards',      color: '#00BCD4' },
};

function getPrimarySkill(l) {
  const text = (l.id + ' ' + l.title + ' ' + (l.description || '')).toLowerCase();
  if (text.includes('listening') || text.includes('nghe') || l.icon === '🎧') return 'listening';
  if (text.includes('speaking') || text.includes('nói') || text.includes('pronunciation') || text.includes('phát âm') || text.includes('stress') || l.icon === '🗣️') return 'speaking';
  if (text.includes('reading') || text.includes('đọc')) return 'reading';
  if (text.includes('writing') || text.includes('viết') || text.includes('task1') || text.includes('task2') || text.includes('essay')) return 'writing';
  if (text.includes('grammar') || text.includes('ngữ pháp') || text.includes('tenses') || text.includes('conditionals') || text.includes('passive') || text.includes('articles') || text.includes('pronouns') || text.includes('prepositions')) return 'grammar';
  return 'vocabulary';
}

// ── Master Category Definitions (Dynamic lesson filters) ────────────────────
const MASTER_CATEGORIES = [
  {
    id: 'starter',
    groupId: 'beginner',
    title: 'Mới học (Starter)',
    icon: '🌱',
    target: 'Pre-A1 – A1',
    color: '#7DBE4B',
    desc: 'Bài học định dạng hình ảnh & âm thanh cho người bắt đầu từ con số 0',
    filter: (l) => l.track === 'starter' || l.format === 'picture',
  },
  {
    id: 'general',
    groupId: 'intermediate',
    title: 'Chủ đề tổng hợp',
    icon: '🌳',
    target: 'A2 – B1 (Trung bình)',
    color: '#4EA8E8',
    desc: 'Từ vựng thông dụng, phát âm chuẩn và giao tiếp đời sống hàng ngày',
    filter: (l) => (l.track || 'general') === 'general',
  },
  {
    id: 'ielts',
    groupId: 'exam',
    title: 'Luyện thi IELTS',
    icon: '🎓',
    target: 'Band 3.0 – 7.5+',
    color: '#FF9800',
    desc: 'IELTS Foundation, Academic Vocab, Writing Task 1-2, Speaking, Listening & Reading',
    filter: (l) => l.track === 'ielts',
  },
  {
    id: 'toeic',
    groupId: 'exam',
    title: 'Luyện thi TOEIC',
    icon: '💼',
    target: 'Điểm 10 – 990',
    color: '#EA5A5A',
    desc: 'Từ vựng công sở, hợp đồng, đàm phán, email và các phần thi Part 1–7',
    filter: (l) => l.track === 'toeic',
  },
  {
    id: 'vstep',
    groupId: 'exam',
    title: 'Luyện thi VSTEP',
    icon: '🇻🇳',
    target: 'Bậc 3 – Bậc 5 (B1–C1)',
    color: '#E040FB',
    desc: 'Khung năng lực ngoại ngữ 6 bậc dùng cho Việt Nam (Bậc 3 - B1, Bậc 4 - B2, Bậc 5 - C1)',
    filter: (l) => !!l.standards?.vstep,
  },
  {
    id: 'cambridge',
    groupId: 'exam',
    title: 'Chứng chỉ Cambridge',
    icon: '🇬🇧',
    target: 'B1 Preliminary & B2 First',
    color: '#2196F3',
    desc: 'Luyện thi chứng chỉ Cambridge Preliminary (PET/B1) và Cambridge First (FCE/B2)',
    filter: (l) => l.track === 'b1' || l.track === 'b2',
  },
  {
    id: 'advanced',
    groupId: 'intermediate',
    title: 'Tiếng Anh Nâng cao C1–C2',
    icon: '🏆',
    target: 'C1 – C2 (Cao cấp)',
    color: '#9C27B0',
    desc: 'Collocations nâng cao, thành ngữ chuyên sâu, kỹ năng thuyết trình và viết học thuật',
    filter: (l) => l.track === 'advanced',
  },
];

const ITEMS_PER_PAGE = 12;

export default function LessonsPage() {
  useSEO(SEO_CONFIGS['/lessons']);
  const { user } = useAuth();
  const { categoryId } = useParams();
  const { userData } = useUser();

  // Nếu không phải admin, ẩn/chặn truy cập Thư viện bài học
  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  // If categoryId exists in URL, render Category Detail View
  if (categoryId) {
    const currentCategory = MASTER_CATEGORIES.find((c) => c.id === categoryId);
    return <CategoryDetailView category={currentCategory} categoryId={categoryId} userData={userData} />;
  }

  // Otherwise, render Category Overview View
  return <CategoryOverviewView userData={userData} />;
}

// ============================================================================
// 1. CATEGORY OVERVIEW VIEW (TRANG CHÍNH: CATEGORY CATALOG)
// ============================================================================
function CategoryOverviewView({ userData }) {
  const navigate = useNavigate();
  const [groupFilter, setGroupFilter] = useState(userData.learnerGroup || 'all');

  // Compute stats for each category (lọc theo nhóm người học — SDD §5.5)
  const categoriesWithStats = useMemo(() => {
    const base = groupFilter === 'all'
      ? MASTER_CATEGORIES
      : MASTER_CATEGORIES.filter((c) => c.groupId === groupFilter);
    return base.map((cat) => {
      const lessons = ALL_LESSONS.filter(cat.filter);
      const total = lessons.length;
      const completed = lessons.filter((l) => userData.completedLessons?.includes(l.id)).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...cat,
        total,
        completed,
        pct,
      };
    });
  }, [userData.completedLessons, groupFilter]);

  // Overall completed count
  const totalCompleted = useMemo(
    () => ALL_LESSONS.filter((l) => userData.completedLessons?.includes(l.id)).length,
    [userData.completedLessons]
  );

  // In-progress or next lesson on path
  const nextLessonInfo = useMemo(() => {
    try {
      const next = getNextPathLesson(userData);
      if (next && next.type === 'lesson') {
        const found = ALL_LESSONS.find((l) => l.id === next.lessonId);
        if (found) return { ...found, unitTitle: next.unit?.title };
      }
    } catch {
      // fallback
    }
    return null;
  }, [userData]);

  return (
    <div className="fade-in lib-page">
      {/* ── Header ── */}
      <div className="lib-header">
        <div className="lib-header-left">
          <div className="lib-header-icon-box">
            <Icon name="books" size={28} />
          </div>
          <div>
            <div className="lib-header-badge">
              <Icon name="sparkles" size={12} /> Cowdi Learning Catalog 2.0
            </div>
            <h2 className="lib-header-title">Thư viện bài học</h2>
            <p className="lib-header-sub">
              Khám phá các chương trình học theo mục tiêu: Giao tiếp đời sống, Luyện thi chứng chỉ quốc tế và Tiếng Anh nâng cao.
            </p>
          </div>
        </div>

        <div className="lib-header-stats">
          <div className="lib-header-stat-chip">
            <Emoji e="📚" size={16} />
            <span>{ALL_LESSONS.length} bài học</span>
          </div>
          <div className="lib-header-stat-chip" style={{ color: 'var(--leaf-dark)' }}>
            <Icon name="check" size={15} />
            <span>{totalCompleted} đã hoàn thành</span>
          </div>
          <div className="lib-header-stat-chip">
            <Emoji e="🗂️" size={16} />
            <span>{MASTER_CATEGORIES.length} danh mục</span>
          </div>
        </div>
      </div>

      {/* ── Continue Learning Highlight Box ── */}
      {nextLessonInfo && (
        <div className="lib-continue-section">
          <div className="lib-continue-title-bar">
            <h4 className="lib-continue-title">
              <Icon name="fire" size={18} /> Tiếp tục bài học hôm nay
            </h4>
            <Link to="/learning-path" className="small text-muted text-decoration-none">
              Xem Lộ trình học →
            </Link>
          </div>

          <div className="lib-continue-grid">
            <Link to={`/lessons/${nextLessonInfo.id}`} className="lib-continue-card">
              <div className="lib-continue-card-icon">
                <Emoji e={nextLessonInfo.icon} size={28} />
              </div>
              <div className="lib-continue-card-info">
                <span className="badge bg-success bg-opacity-20 text-success mb-1" style={{ fontSize: '0.68rem' }}>
                  Tiếp tục lộ trình
                </span>
                <div className="lib-continue-card-name">{nextLessonInfo.title}</div>
                <div className="lib-continue-card-meta">
                  {nextLessonInfo.unitTitle || 'Lộ trình chính'} • {nextLessonInfo.vocabulary?.length || 0} từ vựng
                </div>
              </div>
              <div className="lib-continue-card-cta">
                Học ngay <Icon name="arrowRight" size={14} />
              </div>
            </Link>

            {/* Recommended lesson */}
            {(() => {
              const rec = ALL_LESSONS.find(
                (l) => l.id !== nextLessonInfo.id && !userData.completedLessons?.includes(l.id) && !getLessonAccess(l.id, userData).locked
              );
              if (!rec) return null;
              return (
                <Link to={`/lessons/${rec.id}`} className="lib-continue-card">
                  <div className="lib-continue-card-icon">
                    <Emoji e={rec.icon} size={28} />
                  </div>
                  <div className="lib-continue-card-info">
                    <span className="badge bg-warning bg-opacity-25 text-warning mb-1" style={{ fontSize: '0.68rem' }}>
                      Gợi ý cho bạn
                    </span>
                    <div className="lib-continue-card-name">{rec.title}</div>
                    <div className="lib-continue-card-meta">
                      {rec.level ? LEVEL_CONFIG[rec.level]?.label : 'Phù hợp'} • {rec.vocabulary?.length || 0} từ vựng
                    </div>
                  </div>
                  <div className="lib-continue-card-cta">
                    Bắt đầu <Icon name="arrowRight" size={14} />
                  </div>
                </Link>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Category Cards Grid (No long lesson list!) ── */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h4 className="fw-bold mb-0 text-ink" style={{ fontSize: '1.2rem' }}>
          <Icon name="books" size={20} /> Chọn chương trình học tập
        </h4>
        <div className="d-flex gap-1 flex-wrap">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'beginner', label: '🌱 Mới học' },
            { id: 'intermediate', label: '🌳 Trung bình' },
            { id: 'exam', label: '🏅 Luyện thi' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              className={`btn btn-sm ${groupFilter === g.id ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
              onClick={() => setGroupFilter(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lib-cat-grid">
        {categoriesWithStats.map((cat) => (
          <div
            key={cat.id}
            className="lib-cat-card"
            onClick={() => navigate(`/lessons/category/${cat.id}`)}
            style={{ cursor: 'pointer' }}
          >
            {/* Top row: Icon + Level Badge */}
            <div className="lib-cat-card-top">
              <div className="lib-cat-icon-box">
                <Emoji e={cat.icon} size={28} />
              </div>
              <span
                className="lib-cat-level-badge"
                style={{ background: cat.color + '18', color: cat.color, borderColor: cat.color + '40' }}
              >
                {cat.target}
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="lib-cat-title">{cat.title}</h3>
            <p className="lib-cat-desc">{cat.desc}</p>

            {/* Progress & Stats */}
            <div className="lib-cat-stats-row">
              <span>
                Tổng số: <b>{cat.total} bài học</b>
              </span>
              <span>
                Đã học: <b>{cat.completed}/{cat.total}</b> ({cat.pct}%)
              </span>
            </div>

            <div className="lib-cat-progress-track">
              <div
                className="lib-cat-progress-bar"
                style={{
                  width: `${cat.pct}%`,
                  background: `linear-gradient(90deg, ${cat.color}, #7DBE4B)`,
                }}
              />
            </div>

            {/* Click CTA */}
            <div className="lib-cat-footer">
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                {cat.completed === cat.total && cat.total > 0 ? '✓ Đã hoàn thành toàn bộ' : `${cat.total - cat.completed} bài chưa học`}
              </span>
              <span className="lib-cat-cta">
                Khám phá bài học <Icon name="arrowRight" size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 2. CATEGORY DETAIL VIEW (TRANG CHI TIẾT DANH MỤC: BỘ LỌC & DANH SÁCH BÀI)
// ============================================================================
function CategoryDetailView({ category, categoryId, userData }) {
  const navigate = useNavigate();
  const listTopRef = useRef(null);

  // Fallback if invalid category
  if (!category) {
    return (
      <div className="fade-in lib-page text-center py-5">
        <div className="emoji-big mb-3" style={{ fontSize: '3rem' }}>❓</div>
        <h3 className="fw-bold text-ink">Không tìm thấy danh mục bài học</h3>
        <p className="text-muted mb-4">Danh mục "{categoryId}" không tồn tại hoặc đã được di chuyển.</p>
        <button type="button" className="btn btn-cowdi-primary px-4" onClick={() => navigate('/lessons')}>
          ← Quay lại Thư viện bài học
        </button>
      </div>
    );
  }

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'not_started' | 'in_progress' | 'completed' | 'locked'
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'title-asc' | 'level-asc' | 'vocab-desc'
  const [page, setPage] = useState(1);
  const [selectedLockedLesson, setSelectedLockedLesson] = useState(null);

  // All lessons belonging to this category
  const categoryLessons = useMemo(() => {
    return ALL_LESSONS.filter(category.filter);
  }, [category]);

  // Overall category progress
  const categoryStats = useMemo(() => {
    const total = categoryLessons.length;
    const completed = categoryLessons.filter((l) => userData.completedLessons?.includes(l.id)).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
  }, [categoryLessons, userData.completedLessons]);

  // Active next path lesson
  const nextPathLesson = useMemo(() => {
    try {
      const next = getNextPathLesson(userData);
      return next?.type === 'lesson' ? next.lessonId : null;
    } catch {
      return null;
    }
  }, [userData]);

  // Determine individual lesson status
  const getLessonStatus = (lesson) => {
    if (userData.completedLessons?.includes(lesson.id)) return 'completed';
    const access = getLessonAccess(lesson.id, userData);
    if (access.locked) return 'locked';
    const isNext = nextPathLesson === lesson.id;
    const hasWordActivity = (lesson.vocabulary || []).some((v) => userData.wordStatus?.[v.word]);
    if (isNext || hasWordActivity) return 'in_progress';
    return 'not_started';
  };

  // Dynamically collect skills that actually exist in this category
  const availableSkills = useMemo(() => {
    const skillCounts = {};
    categoryLessons.forEach((l) => {
      const s = getPrimarySkill(l);
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    });
    return Object.entries(skillCounts).map(([key, count]) => ({
      key,
      count,
      ...SKILL_CONFIG[key],
    }));
  }, [categoryLessons]);

  // Dynamically collect levels/bands that actually exist in this category
  const availableLevels = useMemo(() => {
    const levelsMap = new Map();
    categoryLessons.forEach((l) => {
      if (category.id === 'ielts' && l.ieltsBand) {
        levelsMap.set(l.ieltsBand, `Band ${l.ieltsBand}`);
      } else if (category.id === 'toeic' && l.toeicBand) {
        levelsMap.set(l.toeicBand, `TOEIC ${l.toeicBand}`);
      } else if (category.id === 'vstep' && l.standards?.vstep) {
        levelsMap.set(l.standards.vstep, `VSTEP ${l.standards.vstep}`);
      } else if (l.level) {
        const meta = LEVEL_CONFIG[l.level];
        levelsMap.set(l.level, meta?.label || l.level);
      }
    });
    return Array.from(levelsMap.entries()).map(([value, label]) => ({ value, label }));
  }, [categoryLessons, category.id]);

  // Status counts in this category
  const statusCounts = useMemo(() => {
    const counts = { all: categoryLessons.length, not_started: 0, in_progress: 0, completed: 0, locked: 0 };
    categoryLessons.forEach((l) => {
      const st = getLessonStatus(l);
      if (counts[st] !== undefined) counts[st]++;
    });
    return counts;
  }, [categoryLessons, userData]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedSkill, selectedStatus, selectedLevel, sortBy]);

  // Combined Filtering
  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return categoryLessons.filter((l) => {
      // 1. Search (Title, Description, ID, Vocab words & meanings)
      if (q) {
        const matchTitle = (l.title || '').toLowerCase().includes(q);
        const matchDesc = (l.description || '').toLowerCase().includes(q);
        const matchId = (l.id || '').toLowerCase().includes(q);
        const matchVocab = (l.vocabulary || []).some(
          (v) => (v.word || '').toLowerCase().includes(q) || (v.meaning || '').toLowerCase().includes(q)
        );
        if (!matchTitle && !matchDesc && !matchId && !matchVocab) return false;
      }

      // 2. Skill Filter
      if (selectedSkill !== 'all') {
        const pSkill = getPrimarySkill(l);
        if (pSkill !== selectedSkill) return false;
      }

      // 3. Status Filter (Strict distinction)
      if (selectedStatus !== 'all') {
        const st = getLessonStatus(l);
        if (st !== selectedStatus) return false;
      }

      // 4. Level Filter
      if (selectedLevel !== 'all') {
        if (category.id === 'ielts' && l.ieltsBand !== selectedLevel) return false;
        else if (category.id === 'toeic' && l.toeicBand !== selectedLevel) return false;
        else if (category.id === 'vstep' && l.standards?.vstep !== selectedLevel) return false;
        else if (category.id !== 'ielts' && category.id !== 'toeic' && category.id !== 'vstep' && l.level !== selectedLevel) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title, 'vi');
      if (sortBy === 'level-asc') {
        const order = { beginner: 1, elementary: 2, intermediate: 3, 'upper-intermediate': 4, advanced: 5 };
        return (order[a.level] || 3) - (order[b.level] || 3);
      }
      if (sortBy === 'vocab-desc') {
        return (b.vocabulary?.length || 0) - (a.vocabulary?.length || 0);
      }
      return 0; // Default curriculum sequence
    });
  }, [categoryLessons, searchQuery, selectedSkill, selectedStatus, selectedLevel, sortBy, userData, nextPathLesson]);

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / ITEMS_PER_PAGE) || 1;
  const paginatedLessons = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredLessons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLessons, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSkill !== 'all' ||
    selectedStatus !== 'all' ||
    selectedLevel !== 'all' ||
    sortBy !== 'default';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSkill('all');
    setSelectedStatus('all');
    setSelectedLevel('all');
    setSortBy('default');
    setPage(1);
  };

  return (
    <div className="fade-in lib-page">
      {/* ── Breadcrumbs & Back Navigation ── */}
      <div className="lib-breadcrumb">
        <Link to="/lessons">
          <Icon name="books" size={14} /> Thư viện bài học
        </Link>
        <span>/</span>
        <span className="lib-breadcrumb-cur">{category.title}</span>
      </div>

      <Link to="/lessons" className="lib-back-btn">
        <Icon name="arrowLeft" size={14} /> Quay lại danh mục thư viện
      </Link>

      {/* ── Category Detail Banner ── */}
      <div className="lib-detail-banner">
        <div className="lib-detail-banner-left">
          <div
            className="lib-detail-banner-icon"
            style={{ background: category.color + '18', color: category.color }}
          >
            <Emoji e={category.icon} size={36} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h3 className="lib-detail-banner-title mb-0">{category.title}</h3>
              <span
                className="badge rounded-pill"
                style={{ background: category.color + '20', color: category.color, border: `1px solid ${category.color}40` }}
              >
                {category.target}
              </span>
            </div>
            <p className="lib-detail-banner-desc">{category.desc}</p>
          </div>
        </div>

        <div className="lib-detail-banner-stats">
          <div className="text-muted small mb-1">Tiến độ danh mục</div>
          <div>
            <b>{categoryStats.completed} / {categoryStats.total}</b> bài hoàn thành ({categoryStats.pct}%)
          </div>
          <div className="progress mt-2" style={{ height: 8, borderRadius: 10 }}>
            <div
              className="progress-bar"
              style={{
                width: `${categoryStats.pct}%`,
                background: `linear-gradient(90deg, ${category.color}, #7DBE4B)`,
                borderRadius: 10,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Panel (Scoped to Category) ── */}
      <div className="lib-filter-hub" ref={listTopRef}>
        {/* Search Bar within Category */}
        <div className="lib-search-row">
          <div className="lib-search-box">
            <span className="lib-search-icon">
              <Icon name="search" size={18} />
            </span>
            <input
              type="text"
              className="lib-search-input"
              placeholder={`Tìm kiếm trong ${category.title} theo tên, từ vựng, chủ đề...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="lib-search-clear"
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Group 1: Filter by Skill */}
        {availableSkills.length > 0 && (
          <div className="lib-filter-group-row">
            <div className="lib-filter-group-label">
              <Icon name="target" size={13} /> Kỹ năng ({availableSkills.length})
            </div>
            <div className="lib-chip-group">
              <button
                type="button"
                className={`lib-chip-btn ${selectedSkill === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSkill('all')}
              >
                <span>Tất cả kỹ năng</span>
                <span className="lib-chip-count">{categoryLessons.length}</span>
              </button>
              {availableSkills.map((sk) => (
                <button
                  key={sk.key}
                  type="button"
                  className={`lib-chip-btn ${selectedSkill === sk.key ? 'active' : ''}`}
                  onClick={() => setSelectedSkill(sk.key)}
                >
                  <Icon name={sk.icon} size={13} />
                  <span>{sk.label}</span>
                  <span className="lib-chip-count">{sk.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Group 2: Filter by Status */}
        <div className="lib-filter-group-row">
          <div className="lib-filter-group-label">
            <Icon name="check" size={13} /> Trạng thái học tập
          </div>
          <div className="lib-chip-group">
            <button
              type="button"
              className={`lib-chip-btn ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              <span>Tất cả</span>
              <span className="lib-chip-count">{statusCounts.all}</span>
            </button>
            <button
              type="button"
              className={`lib-chip-btn ${selectedStatus === 'not_started' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('not_started')}
            >
              <span>🟢 Chưa bắt đầu</span>
              <span className="lib-chip-count">{statusCounts.not_started}</span>
            </button>
            <button
              type="button"
              className={`lib-chip-btn ${selectedStatus === 'in_progress' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('in_progress')}
            >
              <span>⏳ Đang học</span>
              <span className="lib-chip-count">{statusCounts.in_progress}</span>
            </button>
            <button
              type="button"
              className={`lib-chip-btn ${selectedStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('completed')}
            >
              <span>✅ Đã hoàn thành</span>
              <span className="lib-chip-count">{statusCounts.completed}</span>
            </button>
            <button
              type="button"
              className={`lib-chip-btn ${selectedStatus === 'locked' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('locked')}
            >
              <span>🔒 Đã khóa</span>
              <span className="lib-chip-count">{statusCounts.locked}</span>
            </button>
          </div>
        </div>

        {/* Secondary: Level & Sort Bar */}
        <div className="lib-secondary-filters">
          {/* Level Filter (if category has multiple levels/bands) */}
          {availableLevels.length > 1 && (
            <select
              className="lib-select-filter"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">📊 Trình độ: Tất cả</option>
              {availableLevels.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          )}

          {/* Sort Selector */}
          <select
            className="lib-select-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">↕ Sắp xếp: Mặc định</option>
            <option value="title-asc">Tên bài học (A → Z)</option>
            <option value="level-asc">Trình độ (Tăng dần)</option>
            <option value="vocab-desc">Nhiều từ vựng nhất</option>
          </select>

          {/* Reset button */}
          {hasActiveFilters && (
            <button type="button" className="lib-reset-btn" onClick={resetFilters}>
              <Icon name="x" size={13} /> Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ── Results Info Bar ── */}
      <div className="lib-toolbar">
        <div className="lib-results-count">
          Hiển thị <b>{filteredLessons.length}</b> bài học trong danh mục <b>{category.title}</b>
          {hasActiveFilters && <span className="text-muted ms-2">(Đang lọc kết quả)</span>}
        </div>
        <div className="small text-muted">
          Trang {page} / {totalPages}
        </div>
      </div>

      {/* ── Empty State ── */}
      {filteredLessons.length === 0 && (
        <div className="lib-empty">
          <div className="lib-empty-icon">🔍</div>
          <h4 className="lib-empty-title">Không tìm thấy bài học phù hợp</h4>
          <p className="lib-empty-desc">
            Không có bài học nào trong danh mục "{category.title}" thỏa mãn tất cả các điều kiện lọc đang chọn.
          </p>
          <button type="button" className="btn btn-cowdi-primary px-4" onClick={resetFilters}>
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* ── Paginated Lesson Cards Grid ── */}
      {filteredLessons.length > 0 && (
        <>
          <div className="lib-grid">
            {paginatedLessons.map((lesson) => {
              const status = getLessonStatus(lesson);
              return (
                <LessonCardItem
                  key={lesson.id}
                  lesson={lesson}
                  status={status}
                  userData={userData}
                  onLockClick={(l) => setSelectedLockedLesson(l)}
                />
              );
            })}
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="lib-pagination">
              <button
                type="button"
                className="lib-page-btn"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                « Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <span key={p} className="d-inline-flex align-items-center">
                      {showEllipsis && <span className="px-1 text-muted">...</span>}
                      <button
                        type="button"
                        className={`lib-page-btn ${page === p ? 'active' : ''}`}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}

              <button
                type="button"
                className="lib-page-btn"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Sau »
              </button>
            </div>
          )}
        </>
      )}

      {/* ── MODAL: LOCKED LESSON EXPLANATION ── */}
      {selectedLockedLesson && (
        <div className="lib-modal-overlay" onClick={() => setSelectedLockedLesson(null)}>
          <div className="lib-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-3">
              <div className="emoji-big mb-2" style={{ fontSize: '3rem' }}>
                <Icon name="lock" size={48} />
              </div>
              <h4 className="fw-bold mb-1 text-ink">{selectedLockedLesson.title}</h4>
              <p className="text-muted small">
                Bài học này hiện đang bị khóa theo lộ trình tuyến tính.
              </p>
            </div>

            <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--paper-3)', border: '1px solid var(--paper-line)' }}>
              <div className="fw-semibold text-ink small mb-1">
                <Icon name="info" size={14} /> Điều kiện mở khóa:
              </div>
              <div className="text-muted small">
                {(() => {
                  const access = getLessonAccess(selectedLockedLesson.id, userData);
                  if (access.blocker?.lessonId) {
                    const blkLesson = ALL_LESSONS.find((l) => l.id === access.blocker.lessonId);
                    return `Cần hoàn thành bài học "${blkLesson?.title || access.blocker.lessonId}" trong ${access.unit?.title || 'Lộ trình học'} để mở khóa bài này.`;
                  }
                  return 'Hãy hoàn thành các bài học trước đó trên Lộ trình để mở khóa bài học này.';
                })()}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-cowdi-primary w-100 py-2"
                onClick={() => {
                  setSelectedLockedLesson(null);
                  navigate('/learning-path');
                }}
              >
                Đi tới Lộ trình học
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary w-50 py-2"
                onClick={() => setSelectedLockedLesson(null)}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. COURSE CARD COMPONENT (CARD BÀI HỌC VỚI 4 TRẠNG THÁI RÕ RÀNG)
// ============================================================================
function LessonCardItem({ lesson, status, userData, onLockClick }) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  const skillKey = getPrimarySkill(lesson);
  const skill = SKILL_CONFIG[skillKey];
  const levelMeta = LEVEL_CONFIG[lesson.level] || LEVEL_CONFIG.beginner;

  const handleClick = (e) => {
    if (isLocked) {
      e.preventDefault();
      onLockClick(lesson);
    }
  };

  return (
    <Link
      to={isLocked ? '#' : `/lessons/${lesson.id}`}
      onClick={handleClick}
      className={`lib-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
    >
      {/* Top colorful level strip */}
      <div className="lib-card-top-strip" style={{ background: levelMeta.color }} />

      <div className="lib-card-body">
        {/* Top Header Row */}
        <div className="lib-card-header-row">
          <div className="lib-card-icon">
            {isLocked ? <Icon name="lock" size={24} /> : <Emoji e={lesson.icon} size={26} />}
          </div>

          <div className="lib-card-tags">
            {/* Band / Level tag */}
            {lesson.ieltsBand && (
              <span className="lib-card-tag bg-warning bg-opacity-20 text-warning">
                Band {lesson.ieltsBand}
              </span>
            )}
            {lesson.toeicBand && (
              <span className="lib-card-tag bg-danger bg-opacity-15 text-danger">
                {lesson.toeicBand} pts
              </span>
            )}
            {lesson.standards?.vstep && !lesson.ieltsBand && !lesson.toeicBand && (
              <span className="lib-card-tag bg-primary bg-opacity-15 text-primary">
                {lesson.standards.vstep}
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="lib-card-title">{lesson.title}</div>
        <div className="lib-card-desc">{lesson.description}</div>

        {/* Meta Row: Skill, Level, Vocab */}
        <div className="lib-card-meta-row">
          {skill && (
            <span className="lib-card-chip" style={{ color: skill.color }}>
              <Icon name={skill.icon} size={12} /> {skill.label}
            </span>
          )}
          <span className="lib-card-chip">
            <Icon name={levelMeta.icon} size={12} /> {levelMeta.label}
          </span>
          <span className="lib-card-chip text-muted ms-auto">
            {lesson.vocabulary?.length || 0} từ
          </span>
        </div>
      </div>

      {/* Card Footer Status (Strict 4-status differentiation) */}
      {isCompleted ? (
        <div className="lib-card-footer completed">
          <span><Icon name="check" size={13} /> Đã hoàn thành</span>
          <span className="lib-card-cta-btn btn-outline-success">Ôn tập lại</span>
        </div>
      ) : isInProgress ? (
        <div className="lib-card-footer" style={{ background: 'rgba(255, 193, 7, 0.15)', color: '#D97706' }}>
          <span><Icon name="clock" size={13} /> Đang học dở</span>
          <span className="lib-card-cta-btn btn-warning text-dark">Học tiếp →</span>
        </div>
      ) : isLocked ? (
        <div className="lib-card-footer locked">
          <span><Icon name="lock" size={13} /> Chưa mở khóa</span>
          <span className="lib-card-cta-btn text-muted">Xem điều kiện</span>
        </div>
      ) : (
        <div className="lib-card-footer">
          <span className="text-success">🟢 Chưa bắt đầu</span>
          <span className="lib-card-cta-btn btn-cowdi-primary text-white">Bắt đầu học →</span>
        </div>
      )}
    </Link>
  );
}
