import { useMemo, useState } from 'react';
import { useUser } from '../../hooks/useUser';

/**
 * StudyJournalCard — Nhật ký học tập theo ngày.
 * Hiển thị thống kê hôm nay + 7 ngày gần đây (mini bar chart).
 * Tự đọc từ userData.dailyJournal.
 */

const TOKENS = {
  primary: '#FF6B9D',
  primaryDark: '#E0527E',
  cardShadow: '0 2px 12px rgba(255, 107, 157, 0.08)',
};

const EMPTY = { lessons: 0, quizzes: 0, perfectQuizzes: 0, words: 0, reviews: 0, xp: 0 };

function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayLabel(d) {
  const wd = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${wd[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

export default function StudyJournalCard() {
  const { userData } = useUser();
  const [expanded, setExpanded] = useState(false);

  const journal = userData.dailyJournal || {};
  const today = dayKey(new Date());
  const todayEntry = journal[today] || EMPTY;

  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      out.push({
        date: d,
        key,
        label: dayLabel(d),
        isToday: i === 0,
        ...EMPTY,
        ...(journal[key] || {}),
      });
    }
    return out;
  }, [journal]);

  // Tổng tuần
  const weekTotal = useMemo(() => {
    return last7.reduce(
      (acc, e) => ({
        lessons: acc.lessons + (e.lessons || 0),
        quizzes: acc.quizzes + (e.quizzes || 0),
        words:   acc.words   + (e.words   || 0),
        reviews: acc.reviews + (e.reviews || 0),
        xp:      acc.xp      + (e.xp      || 0),
      }),
      { lessons: 0, quizzes: 0, words: 0, reviews: 0, xp: 0 }
    );
  }, [last7]);

  // Cao nhất để chuẩn hoá chiều cao bar
  const maxXP = Math.max(...last7.map((e) => e.xp || 0), 1);

  // Lịch sử đầy đủ (mở rộng)
  const fullHistory = useMemo(() => {
    return Object.entries(journal)
      .map(([k, v]) => ({ key: k, ...EMPTY, ...v }))
      .sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [journal]);

  const hasAnyData = fullHistory.length > 0;

  return (
    <div
      className="card mb-4"
      style={{ borderRadius: 16, boxShadow: TOKENS.cardShadow, border: 'none' }}
    >
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div style={{ fontSize: '1.8rem' }} className="me-2">📖</div>
          <div className="flex-grow-1">
            <h5 className="fw-bold mb-0">Nhật ký học tập</h5>
            <small className="text-muted">Theo dõi mỗi ngày bạn đã làm gì</small>
          </div>
        </div>

        {/* Hôm nay */}
        <div
          className="p-3 rounded-3 mb-3"
          style={{
            background: 'linear-gradient(135deg, #fff5f8 0%, #ffe4ec 100%)',
            border: `1px solid ${TOKENS.primary}33`,
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <strong style={{ color: TOKENS.primaryDark }}>🌞 Hôm nay</strong>
            <small className="text-muted">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}</small>
          </div>
          <div className="row g-2 text-center">
            <JournalStat icon="📚" value={todayEntry.lessons} label="Bài" />
            <JournalStat icon="🃏" value={todayEntry.words} label="Từ mới" />
            <JournalStat icon="🔁" value={todayEntry.reviews} label="Lượt ôn" />
            <JournalStat icon="✅" value={todayEntry.quizzes} label="Quiz" />
            <JournalStat icon="⭐" value={todayEntry.xp} label="XP" highlight />
          </div>
          {!todayEntry.lessons && !todayEntry.words && !todayEntry.reviews && !todayEntry.quizzes && (
            <div className="text-center small text-muted mt-2">
              Hôm nay chưa có hoạt động — bắt đầu một phiên ôn để mở khoá nhật ký!
            </div>
          )}
        </div>

        {/* Tuần này — bar chart */}
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="small">📅 7 ngày gần nhất</strong>
            <small className="text-muted">
              Tổng: <strong>{weekTotal.xp} XP</strong> · {weekTotal.words} từ · {weekTotal.lessons} bài
            </small>
          </div>
          <div
            className="d-flex align-items-end gap-1"
            style={{ height: 80, padding: '4px 0' }}
            role="img"
            aria-label="Biểu đồ XP 7 ngày gần nhất"
          >
            {last7.map((e) => {
              const h = e.xp ? Math.max(8, (e.xp / maxXP) * 70) : 4;
              const isActive = e.xp > 0 || e.lessons > 0 || e.words > 0 || e.reviews > 0;
              return (
                <div
                  key={e.key}
                  className="flex-grow-1 d-flex flex-column align-items-center"
                  title={`${e.label}: ${e.xp} XP, ${e.lessons} bài, ${e.words} từ, ${e.reviews} ôn`}
                >
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: '6px 6px 2px 2px',
                      background: isActive
                        ? (e.isToday
                            ? `linear-gradient(180deg, ${TOKENS.primary} 0%, ${TOKENS.primaryDark} 100%)`
                            : 'linear-gradient(180deg, #ffb1cb 0%, #ff8fb5 100%)')
                        : '#f0f0f0',
                      transition: 'height 0.3s',
                    }}
                  />
                  <div
                    className="mt-1"
                    style={{
                      fontSize: 10,
                      color: e.isToday ? TOKENS.primaryDark : '#888',
                      fontWeight: e.isToday ? 700 : 500,
                    }}
                  >
                    {e.label.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toggle chi tiết */}
        {hasAnyData && (
          <div className="text-center">
            <button
              className="btn btn-link btn-sm p-0"
              onClick={() => setExpanded(!expanded)}
              style={{ color: TOKENS.primaryDark, textDecoration: 'none' }}
            >
              {expanded
                ? '▲ Thu gọn'
                : `▼ Xem nhật ký đầy đủ (${fullHistory.length} ngày)`}
            </button>
          </div>
        )}

        {expanded && hasAnyData && (
          <div className="mt-3" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table className="table table-sm align-middle mb-0">
              <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                <tr className="small text-muted">
                  <th>Ngày</th>
                  <th className="text-end">Bài</th>
                  <th className="text-end">Từ</th>
                  <th className="text-end">Ôn</th>
                  <th className="text-end">Quiz</th>
                  <th className="text-end">XP</th>
                </tr>
              </thead>
              <tbody>
                {fullHistory.map((e) => {
                  const d = new Date(e.key + 'T00:00:00');
                  const isToday = e.key === today;
                  return (
                    <tr key={e.key} style={isToday ? { background: '#fff5f8' } : undefined}>
                      <td>
                        <strong>{d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</strong>
                        <small className="text-muted ms-1">
                          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]}
                        </small>
                        {isToday && <span className="badge bg-cowdi-primary ms-1">hôm nay</span>}
                      </td>
                      <td className="text-end">{e.lessons || '-'}</td>
                      <td className="text-end">{e.words || '-'}</td>
                      <td className="text-end">{e.reviews || '-'}</td>
                      <td className="text-end">
                        {e.quizzes || '-'}
                        {e.perfectQuizzes > 0 && (
                          <span className="text-warning ms-1" title="Quiz hoàn hảo">
                            ⭐{e.perfectQuizzes}
                          </span>
                        )}
                      </td>
                      <td className="text-end fw-semibold" style={{ color: TOKENS.primaryDark }}>
                        {e.xp || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function JournalStat({ icon, value, label, highlight }) {
  return (
    <div className="col">
      <div
        className="p-2 rounded-3"
        style={{
          background: highlight ? '#fff' : 'rgba(255,255,255,0.6)',
          border: highlight ? `1px solid ${TOKENS.primary}` : '1px solid transparent',
        }}
      >
        <div style={{ fontSize: '1.2rem' }}>{icon}</div>
        <div
          className="fw-bold"
          style={{ fontSize: '1.1rem', color: highlight ? TOKENS.primaryDark : '#333' }}
        >
          {value || 0}
        </div>
        <small className="text-muted" style={{ fontSize: 11 }}>{label}</small>
      </div>
    </div>
  );
}
