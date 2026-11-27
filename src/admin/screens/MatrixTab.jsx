import { useState, useMemo } from 'react';
import { FULL_SCREEN_DIRECTORY, SCREEN_CATALOG, SLOTS } from '../../features/lesson/screens/catalog';
import { ALL_PATHS } from '../../data/path';
import { SLOT_META } from '../../data/config/screens';

export default function MatrixTab({ allLessons }) {
  const [pathFilter, setPathFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [showAll19, setShowAll19] = useState(false);
  const [onlyRed, setOnlyRed] = useState(false);

  const columns = useMemo(
    () => (showAll19 ? FULL_SCREEN_DIRECTORY.filter((s) => !s.locked) : SCREEN_CATALOG),
    [showAll19],
  );

  // Ánh xạ lessonId -> { pathId, unitId, unitTitle }
  const lessonMetaMap = useMemo(() => {
    const map = new Map();
    for (const p of ALL_PATHS) {
      for (const u of p.units || []) {
        for (const lid of u.lessonIds || []) {
          if (!map.has(lid)) {
            map.set(lid, { pathId: p.id, pathTitle: p.title, unitId: u.id, unitTitle: u.title });
          }
        }
      }
    }
    return map;
  }, []);

  const unitsForPath = useMemo(() => {
    if (pathFilter === 'all') return [];
    const p = ALL_PATHS.find((x) => x.id === pathFilter);
    return p?.units || [];
  }, [pathFilter]);

  const rows = useMemo(() => {
    const out = [];
    for (const l of allLessons) {
      const meta = lessonMetaMap.get(l.id);
      if (pathFilter !== 'all' && meta?.pathId !== pathFilter) continue;
      if (unitFilter !== 'all' && meta?.unitId !== unitFilter) continue;

      const checks = {};
      const slotCounts = Object.fromEntries(SLOTS.map((sl) => [sl, 0]));
      for (const col of columns) {
        const res = col.canRun(l);
        checks[col.code] = res;
        // Đếm số màn chạy được theo slot (chỉ tính màn đã có code trong SCREEN_CATALOG để khớp RPT-SCREEN-COVERAGE)
        if (res.ok && col.slot && SCREEN_CATALOG.some((s) => s.code === col.code)) {
          slotCounts[col.slot]++;
        }
      }
      const zeroSlots = SLOTS.filter((sl) => slotCounts[sl] === 0);
      if (onlyRed && zeroSlots.length === 0) continue;
      out.push({ lesson: l, meta, checks, slotCounts, zeroSlots });
    }
    return out;
  }, [allLessons, lessonMetaMap, pathFilter, unitFilter, columns, onlyRed]);

  const colTotals = useMemo(() => {
    const t = Object.fromEntries(columns.map((c) => [c.code, 0]));
    for (const r of rows) {
      for (const c of columns) {
        if (r.checks[c.code]?.ok) t[c.code]++;
      }
    }
    return t;
  }, [rows, columns]);

  const redCount = rows.filter((r) => r.zeroSlots.length > 0).length;

  const handleExportCsv = () => {
    const header = ['lesson_id', 'title', 'level', ...columns.map((c) => c.code), ...SLOTS.map((sl) => `slot_${sl}`), 'zero_slots'];
    const lines = [header.join(',')];
    for (const r of rows) {
      const cells = [
        r.lesson.id,
        `"${String(r.lesson.title || '').replace(/"/g, '""')}"`,
        r.lesson.level || '',
        ...columns.map((c) => (r.checks[c.code]?.ok ? 'OK' : `"MISSING: ${(r.checks[c.code]?.missing || []).join('; ')}"`)),
        ...SLOTS.map((sl) => r.slotCounts[sl]),
        `"${r.zeroSlots.join(', ')}"`,
      ];
      lines.push(cells.join(','));
    }
    const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cowdi-screen-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={pathFilter}
            onChange={(e) => { setPathFilter(e.target.value); setUnitFilter('all'); }}
          >
            <option value="all">Tất cả lộ trình ({allLessons.length} bài)</option>
            {ALL_PATHS.filter((p) => p.id !== 'beginner').map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          {unitsForPath.length > 0 && (
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', maxWidth: 240 }}
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            >
              <option value="all">Mọi Unit</option>
              {unitsForPath.map((u) => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
          )}

          <label className="form-check form-check-inline mb-0 small">
            <input type="checkbox" className="form-check-input" checked={onlyRed} onChange={(e) => setOnlyRed(e.target.checked)} />
            <span className="form-check-label text-danger fw-semibold">Chỉ bài thiếu slot ({redCount})</span>
          </label>

          <label className="form-check form-check-inline mb-0 small">
            <input type="checkbox" className="form-check-input" checked={showAll19} onChange={(e) => setShowAll19(e.target.checked)} />
            <span className="form-check-label">Hiện cả 11 màn F dự kiến</span>
          </label>
        </div>

        <button type="button" className="btn btn-sm btn-outline-success" onClick={handleExportCsv}>
          ⬇ Xuất CSV
        </button>
      </div>

      <div className="as-matrix-wrap">
        <table className="as-matrix-table">
          <thead>
            <tr>
              <th>Bài học ({rows.length})</th>
              {columns.map((c) => (
                <th key={c.code} title={`${c.name} (${c.slot})`}>{c.code}</th>
              ))}
              {SLOTS.map((sl) => (
                <th key={sl} style={{ color: SLOT_META[sl]?.color }}>{SLOT_META[sl]?.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isDanger = r.zeroSlots.length > 0;
              return (
                <tr key={r.lesson.id} className={isDanger ? 'as-matrix-row-danger' : 'as-matrix-row-ok'}>
                  <td>
                    <div className="fw-semibold">{r.lesson.id}</div>
                    <small className="text-muted">{r.lesson.title}</small>
                  </td>
                  {columns.map((c) => {
                    const res = r.checks[c.code];
                    return (
                      <td
                        key={c.code}
                        title={res.ok ? 'Đủ dữ liệu' : `Thiếu: ${res.missing.join(', ')}`}
                        className={res.ok ? 'text-success fw-bold' : 'text-danger'}
                      >
                        {res.ok ? '✓' : '✗'}
                      </td>
                    );
                  })}
                  {SLOTS.map((sl) => (
                    <td key={sl} className={r.slotCounts[sl] === 0 ? 'text-danger fw-bold' : 'text-muted'}>
                      {r.slotCounts[sl]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="as-matrix-foot">
            <tr>
              <td>Tổng chạy được ({rows.length} bài)</td>
              {columns.map((c) => (
                <td key={c.code}>{colTotals[c.code]}</td>
              ))}
              {SLOTS.map((sl) => (
                <td key={sl}>—</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
