import { useState, useEffect, useCallback, useMemo } from 'react';
import { REGIONS } from '../../../shared/regions';

const ALL_CODES = ['OPEN', 'T-01', 'T-02', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08', 'F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06', 'F-07', 'F-08', 'F-09', 'F-10', 'F-11'];
const FILTER_REGIONS = ['BD', 'TG', 'VS', '*'];
const STATUS_BADGE = {
  draft:    'bg-warning-subtle text-dark border border-warning',
  approved: 'bg-success-subtle text-success border border-success',
  disabled: 'bg-secondary-subtle text-secondary border',
};

/**
 * Tab 7: Kho dẫn nhập (PHASE3 §4.4).
 * - Lọc theo mã màn × vùng × trạng thái
 * - Sửa trực tiếp nội dung & trạng thái từng câu
 * - Duyệt hàng loạt (draft → approved / disabled)
 * - Cảnh báo ô (mã × vùng) có < 4 câu approved
 */
export default function IntrosTab({ authFetch, onNotify }) {
  const [filterCode, setFilterCode] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editStatus, setEditStatus] = useState('draft');

  // Form thêm câu dẫn mới
  const [newCode, setNewCode] = useState('F-03');
  const [newRegion, setNewRegion] = useState('BD');
  const [newId, setNewId] = useState('');
  const [newText, setNewText] = useState('');

  const loadIntros = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCode) params.set('code', filterCode);
      if (filterRegion) params.set('region', filterRegion);
      if (filterStatus) params.set('status', filterStatus);
      const res = await authFetch(`/api/admin/screen-intros?${params.toString()}`);
      if (!res.ok) {
        onNotify?.('Không tải được kho dẫn nhập.', 'danger');
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
      setCounts(data.counts || []);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [authFetch, filterCode, filterRegion, filterStatus, onNotify]);

  useEffect(() => { loadIntros(); }, [loadIntros]);

  // Tính cảnh báo các ô (mã × vùng BD/TG/VS) có < 4 câu approved
  const underApprovedCells = useMemo(() => {
    const map = new Map();
    for (const c of counts) {
      map.set(`${c.screenCode}:${c.region}`, c.approved);
    }
    const warns = [];
    for (const code of ALL_CODES) {
      for (const reg of ['BD', 'TG', 'VS']) {
        const cnt = map.get(`${code}:${reg}`) || 0;
        if (cnt < 4) warns.push({ code, region: reg, approved: cnt });
      }
    }
    return warns;
  }, [counts]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length && items.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleBatchStatus = async (status) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const res = await authFetch('/api/admin/screen-intros/batch-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      onNotify?.(err.error || 'Lỗi duyệt hàng loạt.', 'danger');
      return;
    }
    onNotify?.(`Đã chuyển ${ids.length} câu dẫn sang '${status}'.`, 'success');
    loadIntros();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.textVi);
    setEditStatus(item.status);
  };

  const saveEdit = async (id) => {
    const res = await authFetch(`/api/admin/screen-intros/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ textVi: editText, status: editStatus }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      onNotify?.(err.error || 'Lỗi lưu câu dẫn.', 'danger');
      return;
    }
    setEditingId(null);
    onNotify?.(`Đã lưu ${id}`, 'success');
    loadIntros();
  };

  const handleQuickApprove = async (item) => {
    const nextStatus = item.status === 'approved' ? 'draft' : 'approved';
    const res = await authFetch(`/api/admin/screen-intros/${encodeURIComponent(item.id)}`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) {
      onNotify?.('Lỗi đổi trạng thái câu dẫn.', 'danger');
      return;
    }
    loadIntros();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const idClean = newId.trim() || `DN-${newCode.replace('-', '')}-${newRegion}-${String(Date.now()).slice(-2)}`;
    const res = await authFetch('/api/admin/screen-intros', {
      method: 'POST',
      body: JSON.stringify({
        id: idClean,
        screenCode: newCode,
        region: newRegion,
        textVi: newText.trim(),
        status: 'draft',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      onNotify?.(err.error || 'Không thêm được câu dẫn.', 'danger');
      return;
    }
    setNewId('');
    setNewText('');
    onNotify?.(`Đã thêm câu dẫn ${idClean}`, 'success');
    loadIntros();
  };

  const countWords = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="d-flex flex-column gap-3">
      {/* Cảnh báo ô (mã × vùng) < 4 câu approved */}
      {underApprovedCells.length > 0 && (
        <div className="alert alert-warning py-2 px-3 mb-0 small">
          <strong>⚠️ Cảnh báo kho duyệt:</strong> Hiện còn <strong>{underApprovedCells.length}</strong> ô (mã × vùng BD/TG/VS) có dưới 4 câu <code>approved</code>.
          <div className="d-flex flex-wrap gap-1 mt-1">
            {underApprovedCells.slice(0, 18).map((c) => (
              <button
                key={`${c.code}:${c.region}`}
                type="button"
                className="badge rounded-pill text-bg-light border text-dark"
                onClick={() => { setFilterCode(c.code); setFilterRegion(c.region); setFilterStatus(''); }}
                title="Bấm để lọc ô này"
              >
                {c.code} · {c.region}: {c.approved}/4
              </button>
            ))}
            {underApprovedCells.length > 18 && (
              <span className="text-muted">… và {underApprovedCells.length - 18} ô khác</span>
            )}
          </div>
        </div>
      )}

      {/* Bộ lọc + Duyệt hàng loạt */}
      <div className="card shadow-sm">
        <div className="card-body py-2 px-3 d-flex align-items-end justify-content-between flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap align-items-end">
            <div>
              <label className="form-label small mb-1">Mã màn</label>
              <select className="form-select form-select-sm" value={filterCode} onChange={(e) => setFilterCode(e.target.value)}>
                <option value="">Tất cả ({ALL_CODES.length})</option>
                {ALL_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label small mb-1">Vùng</label>
              <select className="form-select form-select-sm" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
                <option value="">Tất cả vùng</option>
                {FILTER_REGIONS.map((r) => (
                  <option key={r} value={r}>{r === '*' ? '* (Mọi vùng)' : `${r} — ${REGIONS[r]?.nameVi || r}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label small mb-1">Trạng thái</label>
              <select className="form-select form-select-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="draft">draft (chờ duyệt)</option>
                <option value="approved">approved (đã duyệt)</option>
                <option value="disabled">disabled (tắt)</option>
              </select>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-success"
              disabled={selectedIds.size === 0}
              onClick={() => handleBatchStatus('approved')}
            >
              ✓ Duyệt đã chọn ({selectedIds.size})
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={selectedIds.size === 0}
              onClick={() => handleBatchStatus('disabled')}
            >
              Tắt đã chọn
            </button>
          </div>
        </div>
      </div>

      {/* Bảng câu dẫn */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedIds.size === items.length}
                    onChange={toggleSelectAll}
                    aria-label="Chọn tất cả"
                  />
                </th>
                <th style={{ width: 140 }}>ID</th>
                <th style={{ width: 90 }}>Mã · Vùng</th>
                <th>Câu dẫn tiếng Việt (≤ 25 chữ)</th>
                <th style={{ width: 110 }}>Trạng thái</th>
                <th style={{ width: 130 }}>Người sửa</th>
                <th style={{ width: 145 }} className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4 text-muted">Đang tải kho dẫn nhập…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4 text-muted">Chưa có câu dẫn khớp bộ lọc.</td></tr>
              ) : items.map((item) => {
                const isEditing = editingId === item.id;
                const wc = countWords(isEditing ? editText : item.textVi);
                return (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        aria-label={`Chọn ${item.id}`}
                      />
                    </td>
                    <td className="small font-monospace fw-semibold">{item.id}</td>
                    <td className="small">
                      <span className="badge text-bg-light border me-1">{item.screenCode}</span>
                      <span className="badge text-bg-info text-dark">{item.region}</span>
                    </td>
                    <td>
                      {isEditing ? (
                        <div>
                          <textarea
                            rows={2}
                            className="form-control form-control-sm"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            maxLength={160}
                          />
                          <small className={wc > 25 ? 'text-danger fw-bold' : 'text-muted'}>{wc}/25 chữ</small>
                        </div>
                      ) : (
                        <div>
                          <span>{item.textVi}</span>{' '}
                          <small className={wc > 25 ? 'text-danger fw-bold' : 'text-muted'}>({wc} chữ)</small>
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          className="form-select form-select-sm"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="draft">draft</option>
                          <option value="approved">approved</option>
                          <option value="disabled">disabled</option>
                        </select>
                      ) : (
                        <span className={`badge ${STATUS_BADGE[item.status] || 'bg-light text-dark'}`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="small text-muted">{item.updatedByName || 'seed'}</td>
                    <td className="text-end text-nowrap">
                      {isEditing ? (
                        <div className="btn-group btn-group-sm">
                          <button type="button" className="btn btn-primary" onClick={() => saveEdit(item.id)}>Lưu</button>
                          <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingId(null)}>Huỷ</button>
                        </div>
                      ) : (
                        <div className="btn-group btn-group-sm">
                          <button type="button" className="btn btn-outline-primary" onClick={() => startEdit(item)}>Sửa</button>
                          <button
                            type="button"
                            className={`btn ${item.status === 'approved' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleQuickApprove(item)}
                          >
                            {item.status === 'approved' ? 'Về nháp' : 'Duyệt'}
                          </button>
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

      {/* Thêm nhanh câu dẫn mới */}
      <form className="card shadow-sm" onSubmit={handleCreate}>
        <div className="card-body py-2 px-3">
          <div className="small fw-bold mb-2">➕ Thêm câu dẫn mới</div>
          <div className="row g-2 align-items-end">
            <div className="col-6 col-md-2">
              <label className="form-label small mb-1">Mã màn</label>
              <select className="form-select form-select-sm" value={newCode} onChange={(e) => setNewCode(e.target.value)}>
                {ALL_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small mb-1">Vùng</label>
              <select className="form-select form-select-sm" value={newRegion} onChange={(e) => setNewRegion(e.target.value)}>
                {FILTER_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small mb-1">ID (tuỳ chọn)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="DN-F03-BD-05"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small mb-1">Nội dung ({countWords(newText)}/25 chữ)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập câu dẫn gắn với vùng và việc của màn…"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-2">
              <button type="submit" className="btn btn-sm btn-cowdi-primary w-100">Thêm bản nháp</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
