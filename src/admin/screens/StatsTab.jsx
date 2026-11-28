import { useState, useEffect, useCallback } from 'react';
import { SLOT_META } from '../../data/config/screens';
import { SCREEN_CATALOG } from '../../features/lesson/screens/catalog';

const CATALOG_BY_CODE = Object.fromEntries(SCREEN_CATALOG.map((c) => [c.code, c]));

function fmtPct(val) {
  if (val == null || Number.isNaN(val)) return '—';
  return `${Math.round(val * 100)}%`;
}

function fmtSec(val) {
  if (!Number.isFinite(val) || val <= 0) return '—';
  return `${Math.round(val)}s`;
}

/**
 * Tab 8: Thống kê màn học ẩn danh (GEMINI-SCREEN-SYSTEM-PHASE4 §1.3).
 * - Lọc 7 / 30 ngày & nhóm học.
 * - Cờ cảnh báo khi >= 30 lượt: hoàn thành < 80%, đúng lần đầu < 50% hoặc > 97%, thời gian TB > 120s.
 * - Dưới 30 lượt: hiện "chưa đủ dữ liệu", không tô cảnh báo.
 * - So sánh trung bình màn Thân thiện vs Tập trung theo từng vị trí (slot).
 */
export default function StatsTab({ authFetch, onNotify }) {
  const [days, setDays] = useState(7);
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ byCode: [], comparison: [], minPlays: 30 });

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('days', String(days));
      if (group) params.set('group', group);
      const res = await authFetch(`/api/admin/screen-stats?${params.toString()}`);
      if (!res.ok) {
        onNotify?.('Không tải được thống kê màn học.', 'danger');
        return;
      }
      const data = await res.json();
      setStats({
        byCode: data.byCode || [],
        comparison: data.comparison || [],
        minPlays: data.minPlays || 30,
      });
    } catch {
      onNotify?.('Lỗi kết nối khi tải thống kê màn học.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [authFetch, days, group, onNotify]);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div className="d-flex flex-column gap-3">
      {/* Bộ lọc 7/30 ngày + nhóm học */}
      <div className="card shadow-sm">
        <div className="card-body py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="btn-group btn-group-sm" role="group" aria-label="Khoảng thời gian">
              <button
                type="button"
                className={`btn ${days === 7 ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setDays(7)}
              >
                7 ngày
              </button>
              <button
                type="button"
                className={`btn ${days === 30 ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setDays(30)}
              >
                30 ngày
              </button>
            </div>

            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              aria-label="Lọc theo nhóm học"
            >
              <option value="">Tất cả nhóm học</option>
              <option value="beginner">Mới học (beginner)</option>
              <option value="intermediate">Trung bình (intermediate)</option>
              <option value="exam">Luyện thi (exam)</option>
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">
              Ẩn danh (không lưu người dùng) · Ngưỡng cảnh báo: ≥ {stats.minPlays} lượt
            </span>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={loadStats} disabled={loading}>
              ↻ Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết từng mã màn */}
      <div className="card shadow-sm">
        <div className="card-header bg-white fw-bold py-2 d-flex justify-content-between align-items-center">
          <span>📊 Chỉ số theo mã màn ({days} ngày qua)</span>
          <span className="small text-muted fw-normal">
            Cờ: hoàn thành &lt; 80% · đúng lần đầu &lt; 50% / &gt; 97% · TB &gt; 120s
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã</th>
                <th>Tên màn</th>
                <th>Mức</th>
                <th>Vị trí</th>
                <th className="text-end">Lượt chơi</th>
                <th className="text-end">% Hoàn thành</th>
                <th className="text-end">% Đúng lần đầu</th>
                <th className="text-end">TG trung bình</th>
                <th>Đánh giá / Cảnh báo</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">Đang tải thống kê…</td>
                </tr>
              )}
              {!loading && stats.byCode.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    Chưa có lượt chơi nào trong {days} ngày gần đây (chế độ sandbox không ghi thống kê).
                  </td>
                </tr>
              )}
              {!loading && stats.byCode.map((row) => {
                const cat = CATALOG_BY_CODE[row.code];
                const slotInfo = SLOT_META[row.slot] || { label: row.slot };
                const hasWarn = row.enoughData && row.flags.length > 0;
                return (
                  <tr key={row.code} className={hasWarn ? 'table-warning' : ''}>
                    <td className="fw-bold">{row.code}</td>
                    <td>{cat?.name || row.code}</td>
                    <td>
                      <span className={`badge ${row.level === 'friendly' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`}>
                        {row.level === 'friendly' ? 'Thân thiện' : 'Tập trung'}
                      </span>
                    </td>
                    <td>{slotInfo.label}</td>
                    <td className="text-end fw-semibold">{row.starts}</td>
                    <td className="text-end">{fmtPct(row.completionRate)}</td>
                    <td className="text-end">{fmtPct(row.firstTryRate)}</td>
                    <td className="text-end">{fmtSec(row.avgSec)}</td>
                    <td>
                      {!row.enoughData ? (
                        <span className="text-muted small fst-italic">chưa đủ dữ liệu</span>
                      ) : row.flags.length === 0 ? (
                        <span className="badge bg-success-subtle text-success">Ổn định</span>
                      ) : (
                        <div className="d-flex flex-wrap gap-1">
                          {row.flags.map((f) => (
                            <span key={f.id} className="badge bg-danger-subtle text-danger border border-danger-subtle">
                              ⚠ {f.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* So sánh Thân thiện vs Tập trung theo từng slot */}
      <div className="card shadow-sm">
        <div className="card-header bg-white fw-bold py-2">
          ⚖️ So sánh Thân thiện vs Tập trung theo vị trí (slot)
        </div>
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Vị trí</th>
                <th className="text-end">Thân thiện · Lượt</th>
                <th className="text-end">Thân thiện · Hoàn thành</th>
                <th className="text-end">Thân thiện · Đúng L1</th>
                <th className="text-end">Tập trung · Lượt</th>
                <th className="text-end">Tập trung · Hoàn thành</th>
                <th className="text-end">Tập trung · Đúng L1</th>
              </tr>
            </thead>
            <tbody>
              {stats.comparison.map((row) => {
                const slotInfo = SLOT_META[row.slot] || { label: row.slot };
                return (
                  <tr key={row.slot}>
                    <td className="fw-semibold">{slotInfo.label}</td>
                    <td className="text-end">{row.friendly.starts}</td>
                    <td className="text-end">
                      {row.friendly.starts > 0 ? fmtPct(row.friendly.completionRate) : '—'}
                    </td>
                    <td className="text-end">
                      {row.friendly.starts > 0 ? fmtPct(row.friendly.firstTryRate) : '—'}
                    </td>
                    <td className="text-end">{row.focus.starts}</td>
                    <td className="text-end">
                      {row.focus.starts > 0 ? fmtPct(row.focus.completionRate) : '—'}
                    </td>
                    <td className="text-end">
                      {row.focus.starts > 0 ? fmtPct(row.focus.firstTryRate) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
