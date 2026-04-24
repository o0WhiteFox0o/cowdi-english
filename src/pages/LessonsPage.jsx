import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ALL_LESSONS, TRACKS, STANDARDS } from '../data/lessons';
import { useUser } from '../hooks/useUser';

const LEVEL_BADGE = {
  beginner:     'badge-level-beginner',
  intermediate: 'badge-level-intermediate',
  advanced:     'badge-level-advanced',
};

const LEVEL_LABEL = {
  beginner:     '🌱 Cơ bản',
  intermediate: '🌿 Trung cấp',
  advanced:     '🌳 Nâng cao',
};

const TRACK_COLORS = {
  general: 'bg-info-subtle text-info',
  ielts:   'bg-warning-subtle text-warning',
  b1:      'bg-success-subtle text-success',
  b2:      'bg-primary-subtle text-primary',
  toeic:   'bg-danger-subtle text-danger',
};

export default function LessonsPage() {
  const { userData } = useUser();
  const [track, setTrack] = useState('all');
  const [standardId, setStandardId] = useState('all'); // 'all' | 'cefr' | 'ielts' | 'toeic' | 'vstep'
  const [band, setBand] = useState('all');

  const trackMap = useMemo(
    () => Object.fromEntries(TRACKS.map((t) => [t.id, t])),
    []
  );
  const standardMap = useMemo(
    () => Object.fromEntries(STANDARDS.map((s) => [s.id, s])),
    []
  );
  const bandMap = useMemo(() => {
    const m = {};
    for (const s of STANDARDS) {
      for (const b of s.bands) m[`${s.id}:${b.id}`] = b;
    }
    return m;
  }, []);

  const filtered = useMemo(() => {
    return ALL_LESSONS.filter((l) => {
      if (track !== 'all' && l.track !== track) return false;
      if (standardId !== 'all') {
        const lessonBand = l.standards?.[standardId];
        if (!lessonBand) return false;
        if (band !== 'all' && lessonBand !== band) return false;
      }
      return true;
    });
  }, [track, standardId, band]);

  const trackCounts = useMemo(() => {
    const c = { all: ALL_LESSONS.length };
    for (const t of TRACKS) {
      c[t.id] = ALL_LESSONS.filter((l) => l.track === t.id).length;
    }
    return c;
  }, []);

  // Đếm bài theo từng band của chuẩn đang chọn (áp dụng sẵn filter track)
  const bandCounts = useMemo(() => {
    if (standardId === 'all') return {};
    const pool = track === 'all' ? ALL_LESSONS : ALL_LESSONS.filter((l) => l.track === track);
    const c = { all: pool.filter((l) => l.standards?.[standardId]).length };
    for (const b of standardMap[standardId].bands) {
      c[b.id] = pool.filter((l) => l.standards?.[standardId] === b.id).length;
    }
    return c;
  }, [standardId, track, standardMap]);

  const currentStandard = standardId !== 'all' ? standardMap[standardId] : null;

  const onStandardChange = (id) => {
    setStandardId(id);
    setBand('all'); // reset band khi đổi chuẩn
  };

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <i className="fas fa-book text-cowdi me-2"></i>Danh sách bài học
        </h2>
        <p className="text-muted">
          Lọc bài học theo chương trình (IELTS, Cambridge, TOEIC…) hoặc theo chuẩn trình độ (CEFR, IELTS, TOEIC, VSTEP).
        </p>
      </div>

      {/* Track tabs */}
      <div className="mb-2 small text-muted text-center">Chương trình</div>
      <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
        <button
          className={`btn btn-sm rounded-pill ${track === 'all' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
          onClick={() => setTrack('all')}
        >
          🌐 Tất cả <span className="badge bg-light text-dark ms-1">{trackCounts.all}</span>
        </button>
        {TRACKS.map((t) => (
          <button
            key={t.id}
            className={`btn btn-sm rounded-pill ${track === t.id ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setTrack(t.id)}
          >
            {t.icon} {t.label}{' '}
            <span className="badge bg-light text-dark ms-1">{trackCounts[t.id] || 0}</span>
          </button>
        ))}
      </div>

      {/* Standard selector */}
      <div className="mb-2 small text-muted text-center">Chuẩn trình độ</div>
      <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
        <button
          className={`btn btn-sm rounded-pill ${standardId === 'all' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
          onClick={() => onStandardChange('all')}
        >
          ✨ Không lọc
        </button>
        {STANDARDS.map((s) => (
          <button
            key={s.id}
            className={`btn btn-sm rounded-pill ${standardId === s.id ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => onStandardChange(s.id)}
            title={s.description}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Band selector — chỉ hiện khi đã chọn chuẩn */}
      {currentStandard && (
        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
          <button
            className={`btn btn-sm rounded-pill ${band === 'all' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setBand('all')}
          >
            Tất cả bậc{' '}
            <span className="badge bg-light text-dark ms-1">{bandCounts.all || 0}</span>
          </button>
          {currentStandard.bands.map((b) => {
            const n = bandCounts[b.id] || 0;
            const active = band === b.id;
            return (
              <button
                key={b.id}
                className={`btn btn-sm rounded-pill ${active ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                onClick={() => setBand(b.id)}
                disabled={n === 0}
                style={active ? { borderColor: b.color } : undefined}
              >
                <span
                  className="d-inline-block rounded-circle me-1"
                  style={{ width: 8, height: 8, background: b.color, verticalAlign: 'middle' }}
                />
                {b.label} <span className="badge bg-light text-dark ms-1">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="alert alert-info text-center">
          Không có bài học phù hợp với bộ lọc. Hãy thử chọn khác!
        </div>
      )}

      <div className="row g-3">
        {filtered.map((lesson) => {
          const completed = userData.completedLessons.includes(lesson.id);
          const meta = trackMap[lesson.track];
          // Các chuẩn mà bài học thuộc về (để hiển thị badge nhỏ)
          const stdBadges = Object.entries(lesson.standards || {})
            .filter(([, v]) => v)
            .map(([sid, b]) => ({
              sid,
              band: bandMap[`${sid}:${b}`],
              std: standardMap[sid],
            }));

          return (
            <div className="col-md-6 col-lg-4" key={lesson.id}>
              <Link to={`/lessons/${lesson.id}`} className="text-decoration-none">
                <div className={`card h-100 shadow-sm card-hover ${completed ? 'border-success' : ''}`}>
                  <div className={`card-header-level ${lesson.level}`}></div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="fs-2">{lesson.icon}</div>
                      {meta && (
                        <span className={`badge rounded-pill ${TRACK_COLORS[lesson.track] || 'bg-secondary-subtle text-secondary'}`}>
                          {meta.icon} {meta.label}
                        </span>
                      )}
                    </div>
                    <h5 className="card-title fw-bold text-dark">{lesson.title}</h5>
                    <p className="card-text text-muted small">{lesson.description}</p>

                    {stdBadges.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {stdBadges.map(({ sid, band: b, std }) => b && (
                          <span
                            key={sid}
                            className="badge rounded-pill"
                            style={{ background: b.color + '22', color: b.color, border: `1px solid ${b.color}55` }}
                            title={std?.label}
                          >
                            {std?.icon} {b.id}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className={`badge ${LEVEL_BADGE[lesson.level] || ''}`}>
                        {LEVEL_LABEL[lesson.level] || lesson.level}
                      </span>
                      <span className="text-muted small">{lesson.vocabulary?.length || 0} từ</span>
                    </div>
                  </div>
                  {completed && (
                    <div className="card-footer bg-success bg-opacity-10 text-success small fw-bold">
                      ✅ Đã hoàn thành
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
