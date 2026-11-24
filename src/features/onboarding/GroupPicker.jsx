// ════════════════════════════════════════════════════════════════
// GroupPicker — Màn chọn / đổi nhóm người học (SDD-LEARNING-GROUPS-v2.0 §5.1)
// 3 thẻ nhóm: Mới học · Trung bình · Luyện thi (+ 4 kỳ thi) + nút kiểm tra 5 phút
// ════════════════════════════════════════════════════════════════
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LEARNER_GROUPS, ALL_LESSONS } from '../../data/lessons';
import { ALL_PATHS, suggestLegacyGroup } from '../../data/path';
import { useUser } from '../../hooks/useUser';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';

const FIRST_LESSON_EXAMPLE = {
  beginner: 'Ví dụ bài đầu: Xin chào (6 thẻ hình + nghe & nhắc lại)',
  intermediate: 'Ví dụ bài đầu: Chào hỏi cơ bản (từ vựng, ngữ pháp, đọc hiểu)',
  exam: 'Ví dụ bài đầu: Nhập môn luyện thi & Phát âm chuẩn',
};

function countLessonsForGroup(group) {
  const ids = new Set();
  for (const pid of group.paths) {
    const p = ALL_PATHS.find((x) => x.id === pid);
    if (!p) continue;
    for (const u of p.units) {
      for (const lid of u.lessons || []) ids.add(lid);
    }
  }
  return ids.size;
}

export default function GroupPicker({ onDone, compact = false }) {
  const navigate = useNavigate();
  const { userData, setLearningGroup } = useUser();
  const suggestion = useMemo(() => suggestLegacyGroup(userData), [userData]);
  const [pickingExam, setPickingExam] = useState(false);

  const examPaths = useMemo(
    () => ALL_PATHS.filter((p) => ['ielts', 'toeic', 'b1', 'b2'].includes(p.id)),
    []
  );

  const handleChooseGroup = (group) => {
    if (group.id === 'exam') {
      setPickingExam(true);
      return;
    }
    setLearningGroup(group.id, group.defaultPath);
    onDone?.(group.id, group.defaultPath);
  };

  const handleChooseExam = (pathId) => {
    setLearningGroup('exam', pathId);
    onDone?.('exam', pathId);
  };

  return (
    <div className={`fade-in ${compact ? '' : 'py-3'}`} style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="text-center mb-4">
        <div className="mb-2"><Icon name="road" size={44} /></div>
        <h2 className="fw-bold mb-1">
          {pickingExam ? 'Chọn kỳ thi mục tiêu của bạn' : 'Chọn nhóm học phù hợp với bạn'}
        </h2>
        <p className="text-muted mb-0">
          {pickingExam
            ? 'Bạn có thể chuyển đổi giữa các kỳ thi bất cứ lúc nào mà không mất tiến độ.'
            : 'Mỗi nhóm có lộ trình và nhịp học riêng. Đổi nhóm bất cứ lúc nào, không mất tiến độ.'}
        </p>
      </div>

      {!pickingExam ? (
        <>
          <div className="row g-3">
            {LEARNER_GROUPS.map((g) => {
              const count = countLessonsForGroup(g);
              const isSuggested = suggestion?.groupId === g.id;
              const isCurrent = userData.learnerGroup === g.id;
              return (
                <div className="col-12 col-md-4" key={g.id}>
                  <button
                    type="button"
                    className="card h-100 w-100 text-start shadow-sm p-3 border-2"
                    style={{
                      borderColor: isSuggested || isCurrent ? g.color : '#e9ecef',
                      borderRadius: 16,
                      cursor: 'pointer',
                      background: '#fff',
                    }}
                    onClick={() => handleChooseGroup(g)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                      <span
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: 48, height: 48, background: `${g.color}18`, color: g.color }}
                      >
                        <Icon name={g.icon} size={28} />
                      </span>
                      <div className="d-flex flex-column align-items-end gap-1">
                        {isSuggested && (
                          <span className="badge text-white" style={{ background: g.color }}>
                            Gợi ý cho bạn
                          </span>
                        )}
                        {isCurrent && (
                          <span className="badge bg-light text-dark border">Đang học</span>
                        )}
                      </div>
                    </div>
                    <h4 className="fw-bold mb-1" style={{ color: g.color }}>{g.title}</h4>
                    <p className="text-muted small mb-2">{g.subtitle}</p>
                    <div className="small text-secondary mb-3">{FIRST_LESSON_EXAMPLE[g.id]}</div>
                    <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top w-100">
                      <span className="badge bg-light text-dark">{count} bài học</span>
                      <span className="fw-bold small" style={{ color: g.color }}>
                        Chọn nhóm →
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              className="btn btn-outline-primary btn-lg px-4"
              onClick={() => navigate('/placement')}
            >
              🧭 Chưa chắc? Làm bài kiểm tra 5 phút
            </button>
            {onDone && userData.learnerGroup && (
              <div className="mt-2">
                <button type="button" className="btn btn-link text-muted btn-sm" onClick={() => onDone()}>
                  Đóng
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="row g-3">
            {examPaths.map((p) => {
              const lessonCount = new Set(p.units.flatMap((u) => u.lessons || [])).size;
              const isSuggested = suggestion?.pathId === p.id;
              return (
                <div className="col-12 col-sm-6" key={p.id}>
                  <button
                    type="button"
                    className="card h-100 w-100 text-start shadow-sm p-3 border-2"
                    style={{
                      borderColor: isSuggested ? p.color : '#e9ecef',
                      borderRadius: 16,
                      cursor: 'pointer',
                      background: '#fff',
                    }}
                    onClick={() => handleChooseExam(p.id)}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ fontSize: '2rem' }}><Emoji e={p.icon} size={36} /></span>
                      {isSuggested && (
                        <span className="badge text-white" style={{ background: p.color }}>
                          Gợi ý cho bạn
                        </span>
                      )}
                    </div>
                    <h5 className="fw-bold mb-1" style={{ color: p.color }}>{p.title}</h5>
                    <div className="small text-muted mb-2">{p.targetLevel} · {lessonCount} bài</div>
                    <p className="small text-secondary mb-0">{p.description}</p>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setPickingExam(false)}>
              ← Quay lại chọn 3 nhóm
            </button>
          </div>
        </>
      )}
    </div>
  );
}
