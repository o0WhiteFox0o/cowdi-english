import { useState, useMemo, useRef, useEffect } from 'react';
import { FULL_SCREEN_DIRECTORY } from '../../features/lesson/screens/catalog';
import { SLOT_META } from '../../data/config/screens';

const STATUS_OPTIONS = [
  { value: 'on',      label: 'Bật (on)',             desc: 'sẽ hiện cho mọi người học' },
  { value: 'test',    label: 'Thử nghiệm (test)',    desc: 'sẽ chỉ hiện cho danh sách tài khoản thử' },
  { value: 'off',     label: 'Tắt (off)',            desc: 'sẽ ẩn khỏi mọi bài học' },
  { value: 'todo',    label: 'Chưa làm (todo)',      desc: 'đánh dấu chưa triển khai' },
  { value: 'retired', label: 'Ngừng dùng (retired)', desc: 'ngừng dùng vĩnh viễn nhưng giữ mã' },
];

const GROUP_LABELS = {
  beginner: 'Mới học',
  intermediate: 'Trung bình',
  exam: 'Luyện thi',
};

export default function CatalogTab({
  selectedLesson,
  allLessons,
  serverScreens = [],
  weights = {},
  supportedCodes = [],
  onUpdateStatus,
  onUpdateWeight,
  onPreviewCode,
}) {
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSlot, setFilterSlot] = useState('all');
  const [onlyMissing, setOnlyMissing] = useState(false);

  // Confirm modal state (native <dialog>, không dùng window.confirm)
  const [pendingChange, setPendingChange] = useState(null); // { code, name, nextStatus, note }
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);

  // Local draft cho trọng số 3 nhóm
  const [weightDrafts, setWeightDrafts] = useState(weights);
  const [savingGroup, setSavingGroup] = useState(null);

  useEffect(() => {
    setWeightDrafts(weights);
  }, [weights]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (pendingChange && !dlg.open) dlg.showModal();
    else if (!pendingChange && dlg.open) dlg.close();
  }, [pendingChange]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return undefined;
    const onNativeClose = () => {
      dlg.returnValue = '';
      setPendingChange(null);
    };
    dlg.addEventListener('close', onNativeClose);
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let downOut = false;
      const outside = (e) => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onDown = (e) => { downOut = outside(e); };
      const onUp = (e) => { if (downOut && outside(e)) dlg.close(); };
      dlg.addEventListener('pointerdown', onDown);
      dlg.addEventListener('pointerup', onUp);
      return () => {
        dlg.removeEventListener('close', onNativeClose);
        dlg.removeEventListener('pointerdown', onDown);
        dlg.removeEventListener('pointerup', onUp);
      };
    }
    return () => dlg.removeEventListener('close', onNativeClose);
  }, []);

  const serverMap = useMemo(() => {
    const m = {};
    for (const r of serverScreens) m[r.code] = r;
    return m;
  }, [serverScreens]);

  // Tính độ phủ toàn kho (x/N bài không phải picture)
  const globalCoverage = useMemo(() => {
    const map = {};
    for (const def of FULL_SCREEN_DIRECTORY) {
      let okCount = 0;
      for (const l of allLessons) {
        if (def.canRun(l).ok) okCount++;
      }
      map[def.code] = okCount;
    }
    return map;
  }, [allLessons]);

  const rows = useMemo(() => {
    return FULL_SCREEN_DIRECTORY.map((def) => {
      const srv = serverMap[def.code] || {};
      const check = selectedLesson ? def.canRun(selectedLesson) : { ok: true, missing: [] };
      const isSupported = supportedCodes.includes(def.code);
      return {
        ...def,
        status: srv.status || (def.locked ? 'retired' : isSupported ? 'on' : 'todo'),
        note: def.fixedNote || srv.note || '',
        updatedByName: srv.updatedByName || null,
        updatedAt: srv.updatedAt || null,
        check,
        coverage: globalCoverage[def.code] || 0,
        isSupported,
      };
    }).filter((r) => {
      if (filterLevel !== 'all' && r.level !== filterLevel) return false;
      if (filterSlot !== 'all' && (r.slot || 'none') !== filterSlot) return false;
      if (onlyMissing && r.check.ok) return false;
      return true;
    });
  }, [serverMap, selectedLesson, supportedCodes, globalCoverage, filterLevel, filterSlot, onlyMissing]);

  const handleConfirmStatus = async () => {
    if (!pendingChange) return;
    setSaving(true);
    try {
      await onUpdateStatus(pendingChange.code, pendingChange.nextStatus, pendingChange.note);
      dialogRef.current?.close();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWeight = async (groupId) => {
    const d = weightDrafts[groupId] || { friendly: 0.5, focus: 0.5 };
    setSavingGroup(groupId);
    try {
      await onUpdateWeight(groupId, Number(d.friendly), Number(d.focus));
    } finally {
      setSavingGroup(null);
    }
  };

  const statusDesc = (st) => STATUS_OPTIONS.find((o) => o.value === st)?.desc || st;

  return (
    <div className="d-flex flex-column gap-3">
      {/* Bộ lọc */}
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="all">Mọi mức (T + F)</option>
            <option value="focus">Tập trung (T)</option>
            <option value="friendly">Thân thiện (F)</option>
          </select>
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterSlot} onChange={(e) => setFilterSlot(e.target.value)}>
            <option value="all">Mọi vị trí</option>
            {Object.entries(SLOT_META).map(([k, m]) => (
              <option key={k} value={k}>{m.label} ({k})</option>
            ))}
          </select>
          <label className="form-check form-check-inline mb-0 small ms-1">
            <input type="checkbox" className="form-check-input" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
            <span className="form-check-label">Chỉ màn thiếu dữ liệu ở bài này</span>
          </label>
        </div>
        <span className="small text-muted">Hiển thị <strong>{rows.length}</strong> / 19 mã màn</span>
      </div>

      {/* Bảng 19 mã màn */}
      <div className="table-responsive bg-white rounded-3 border">
        <table className="table table-sm table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Mã</th>
              <th>Tên màn</th>
              <th>Mức</th>
              <th>Kỹ năng / Vị trí</th>
              <th>Bài này</th>
              <th>Dùng được</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const slotMeta = r.slot ? SLOT_META[r.slot] : null;
              return (
                <tr key={r.code}>
                  <td className="fw-bold font-monospace">{r.code}</td>
                  <td>
                    <div className="fw-semibold">{r.name}</div>
                    {r.phase && <small className="text-muted">Kế hoạch Đợt {r.phase}</small>}
                  </td>
                  <td>
                    <span className={`badge ${r.level === 'focus' ? 'bg-secondary-subtle text-dark' : 'bg-warning-subtle text-dark'}`}>
                      {r.level === 'focus' ? 'Tập trung' : 'Thân thiện'}
                    </span>
                  </td>
                  <td>
                    {slotMeta ? (
                      <span className="as-chip" style={{ background: slotMeta.color }}>{slotMeta.label}</span>
                    ) : (
                      <span className="badge bg-light text-muted border">—</span>
                    )}
                  </td>
                  <td>
                    {r.check.ok ? (
                      <span className="text-success fw-bold small">✓ Đủ dữ liệu</span>
                    ) : (
                      <span className="text-danger small" title={r.check.missing.join(', ')}>
                        ✗ {r.check.missing.join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="small fw-semibold">
                    {r.coverage}/{allLessons.length} bài
                  </td>
                  <td>
                    {r.locked ? (
                      <span className="as-status-badge as-status-retired">Mẹo pet</span>
                    ) : (
                      <select
                        className="form-select form-select-sm"
                        style={{ minWidth: 140 }}
                        value={r.status}
                        aria-label={`Trạng thái ${r.code}`}
                        onChange={(e) => setPendingChange({
                          code: r.code,
                          name: r.name,
                          prevStatus: r.status,
                          nextStatus: e.target.value,
                          note: r.note,
                        })}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={(opt.value === 'on' || opt.value === 'test') && !r.isSupported}
                          >
                            {opt.label}{(opt.value === 'on' || opt.value === 'test') && !r.isSupported ? ' (chưa có code)' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="small text-muted" style={{ maxWidth: 220 }}>
                    {r.note || '—'}
                    {r.updatedByName && (
                      <div style={{ fontSize: '0.7rem' }}>Sửa bởi: {r.updatedByName}</div>
                    )}
                  </td>
                  <td className="text-end">
                    {r.isSupported ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onPreviewCode(r.code)}
                      >
                        Xem
                      </button>
                    ) : (
                      <span className="small text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Trọng số theo nhóm học (STD §3.3) */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-2">Trọng số trộn theo nhóm học (lưu trên server, có ghi nhật ký)</h6>
          <div className="row g-3">
            {['beginner', 'intermediate', 'exam'].map((g) => {
              const cur = weightDrafts[g] || { friendly: 0.5, focus: 0.5 };
              return (
                <div className="col-12 col-md-4" key={g}>
                  <div className="p-3 rounded-3 border bg-light">
                    <div className="fw-bold mb-2">{GROUP_LABELS[g]} <small className="text-muted">({g})</small></div>
                    <div className="d-flex gap-2 align-items-center mb-2">
                      <label className="small mb-0" style={{ width: 85 }}>Thân thiện</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        className="form-control form-control-sm"
                        value={cur.friendly}
                        onChange={(e) => setWeightDrafts((prev) => ({
                          ...prev,
                          [g]: { ...cur, friendly: e.target.value },
                        }))}
                      />
                    </div>
                    <div className="d-flex gap-2 align-items-center mb-2">
                      <label className="small mb-0" style={{ width: 85 }}>Tập trung</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        className="form-control form-control-sm"
                        value={cur.focus}
                        onChange={(e) => setWeightDrafts((prev) => ({
                          ...prev,
                          [g]: { ...cur, focus: e.target.value },
                        }))}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-cowdi-primary w-100"
                      disabled={savingGroup === g}
                      onClick={() => handleSaveWeight(g)}
                    >
                      {savingGroup === g ? 'Đang lưu...' : 'Lưu trọng số'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Native <dialog> xác nhận đổi trạng thái màn */}
      <dialog ref={dialogRef} className="as-confirm-dialog" closedby="any" aria-labelledby="as-confirm-title">
        {pendingChange && (
          <>
            <h1 id="as-confirm-title" className="h5 fw-bold mb-2">
              Xác nhận đổi trạng thái {pendingChange.code}
            </h1>
            <p className="small mb-2">
              Đổi <strong>{pendingChange.code} ({pendingChange.name})</strong> từ{' '}
              <span className={`as-status-badge as-status-${pendingChange.prevStatus}`}>{pendingChange.prevStatus}</span> sang{' '}
              <span className={`as-status-badge as-status-${pendingChange.nextStatus}`}>{pendingChange.nextStatus}</span>?
            </p>
            <div className="alert alert-warning py-2 px-3 small mb-3">
              <strong>Hệ quả:</strong> {pendingChange.code} {statusDesc(pendingChange.nextStatus)}.
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold mb-1">Ghi chú (tuỳ chọn)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                maxLength={255}
                value={pendingChange.note || ''}
                onChange={(e) => setPendingChange((p) => ({ ...p, note: e.target.value }))}
                placeholder="Lý do đổi trạng thái..."
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => dialogRef.current?.close()}
                autoFocus
              >
                Huỷ
              </button>
              <button
                type="button"
                className="btn btn-cowdi-primary btn-sm"
                disabled={saving}
                onClick={handleConfirmStatus}
              >
                {saving ? 'Đang lưu...' : 'Xác nhận lưu'}
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
