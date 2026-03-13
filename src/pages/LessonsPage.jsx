import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LESSONS } from '../data/lessons';
import { useUser } from '../hooks/useUser';

const FILTER_LABELS = {
  all:          '📋 Tất cả',
  beginner:     '🌱 Cơ bản',
  intermediate: '🌿 Trung cấp',
  advanced:     '🌳 Nâng cao',
};

const LEVEL_BADGE = {
  beginner:     'badge-level-beginner',
  intermediate: 'badge-level-intermediate',
  advanced:     'badge-level-advanced',
};

export default function LessonsPage() {
  const { userData } = useUser();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? LESSONS : LESSONS.filter((l) => l.level === filter);

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <i className="fas fa-book text-cowdi me-2"></i>Danh sách bài học
        </h2>
        <p className="text-muted">Chọn bài học để bắt đầu!</p>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
        {Object.keys(FILTER_LABELS).map((f) => (
          <button
            key={f}
            className={`btn btn-sm rounded-pill ${filter === f ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="row g-3">
        {filtered.map((lesson) => {
          const completed = userData.completedLessons.includes(lesson.id);
          return (
            <div className="col-md-6 col-lg-4" key={lesson.id}>
              <Link to={`/lessons/${lesson.id}`} className="text-decoration-none">
                <div className={`card h-100 shadow-sm card-hover ${completed ? 'border-success' : ''}`}>
                  <div className={`card-header-level ${lesson.level}`}></div>
                  <div className="card-body">
                    <div className="fs-2 mb-2">{lesson.icon}</div>
                    <h5 className="card-title fw-bold text-dark">{lesson.title}</h5>
                    <p className="card-text text-muted small">{lesson.description}</p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className={`badge ${LEVEL_BADGE[lesson.level]}`}>
                        {FILTER_LABELS[lesson.level]}
                      </span>
                      <span className="text-muted small">{lesson.vocabulary.length} từ</span>
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

