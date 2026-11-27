import { useState, useMemo } from 'react';
import Icon from '../../components/Icon';
import { mixLesson } from '../../features/lesson/screens/mixer';
import { SCREEN_CATALOG, SLOTS } from '../../features/lesson/screens/catalog';
import { SLOT_META } from '../../data/config/screens';
import { checkMixRules, simulate1000 } from './ruleChecker';

export default function MixTesterTab({ selectedLesson, group, seed, onChangeSeed, config }) {
  const [isTester, setIsTester] = useState(true);
  const [lastMix, setLastMix] = useState({});
  const [simResult, setSimResult] = useState(null);

  const mixResult = useMemo(() => {
    if (!selectedLesson) return null;
    return mixLesson({
      lesson: selectedLesson,
      group,
      lastMix,
      config,
      isTester,
      registry: SCREEN_CATALOG,
      seed: Number(seed) || 1,
    });
  }, [selectedLesson, group, lastMix, config, isTester, seed]);

  const ruleChecks = useMemo(() => {
    if (!mixResult || !selectedLesson) return [];
    return checkMixRules({
      result: mixResult,
      lesson: selectedLesson,
      group,
      lastMix,
      config,
      isTester,
      registry: SCREEN_CATALOG,
    });
  }, [mixResult, selectedLesson, group, lastMix, config, isTester]);

  const handleRun1000 = () => {
    if (!selectedLesson) return;
    const res = simulate1000({
      lesson: selectedLesson,
      group,
      lastMix,
      config,
      isTester,
      registry: SCREEN_CATALOG,
      runs: 1000,
    });
    setSimResult(res);
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Tuỳ chọn bổ sung */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3">
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <label className="form-check form-switch mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isTester}
                  onChange={(e) => setIsTester(e.target.checked)}
                />
                <span className="form-check-label fw-semibold small">Giả lập tài khoản thử (`isTester`)</span>
              </label>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onChangeSeed(Math.floor(Math.random() * 999999) + 1)}
              >
                🎲 Seed ngẫu nhiên
              </button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setLastMix({})}>
                Xoá `lastMix`
              </button>
            </div>

            <button type="button" className="btn btn-sm btn-cowdi-primary" onClick={handleRun1000}>
              📊 Chạy 1 000 lần
            </button>
          </div>

          <div className="row g-2">
            {SLOTS.map((sl) => {
              const opts = SCREEN_CATALOG.filter((s) => s.slot === sl);
              return (
                <div className="col-6 col-md-2" key={sl}>
                  <label className="form-label small fw-bold mb-1" style={{ fontSize: '0.72rem' }}>
                    lastMix[{SLOT_META[sl]?.label}]
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={lastMix[sl] || ''}
                    onChange={(e) => setLastMix((prev) => ({ ...prev, [sl]: e.target.value || undefined }))}
                  >
                    <option value="">(trống)</option>
                    {opts.map((o) => (
                      <option key={o.code} value={o.code}>{o.code} {o.name}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kết quả trộn 1 lần + 7 luật */}
      {mixResult && (
        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  Chuỗi màn kết quả ({mixResult.screens.length} màn · seed #{seed})
                </h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {mixResult.screens.map((sc, idx) => {
                    const meta = SLOT_META[sc.slot] || SLOT_META.intro;
                    const def = SCREEN_CATALOG.find((x) => x.code === sc.code);
                    return (
                      <div
                        key={`${sc.slot}-${idx}`}
                        className="p-2 rounded-3 border bg-light text-center"
                        style={{ minWidth: 96 }}
                      >
                        <div
                          className="mx-auto mb-1 d-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: 34, height: 34, background: meta.color }}
                        >
                          <Icon name={meta.icon} size={16} />
                        </div>
                        <div className="fw-bold small">{idx + 1}. {sc.code}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{def?.name || meta.label}</div>
                      </div>
                    );
                  })}
                </div>

                {mixResult.skipped.length > 0 && (
                  <div className="alert alert-warning py-2 px-3 small mb-3">
                    <strong>Slot bị bỏ qua (`skipped`):</strong> {mixResult.skipped.join(', ')}
                  </div>
                )}

                <h6 className="fw-bold small text-muted mb-1">Nhật ký giải thích (`mixLesson.log`)</h6>
                <ul className="list-group list-group-flush small font-monospace">
                  {mixResult.log.map((line, i) => (
                    <li key={i} className="list-group-item px-0 py-1">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Kiểm tra 7 luật trộn</h6>
                <ul className="list-group list-group-flush small">
                  {ruleChecks.map((c) => (
                    <li key={c.id} className="list-group-item px-0 py-2 d-flex align-items-center gap-2">
                      <span className={c.ok ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                        {c.ok ? '✓' : '✗'}
                      </span>
                      <span>({c.id}) {c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kết quả mô phỏng 1.000 lần */}
      {simResult && (
        <div className="card shadow-sm border-primary">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h6 className="fw-bold mb-0">Phân bố {simResult.runs} lượt trộn thử</h6>
              <span className={`badge ${simResult.violations === 0 ? 'bg-success' : 'bg-danger'} fs-6`}>
                Vi phạm luật: {simResult.violations} / {simResult.runs}
              </span>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <h6 className="small fw-bold text-muted">% Mã màn theo từng vị trí (slot)</h6>
                <table className="table table-sm small mb-0">
                  <thead>
                    <tr><th>Slot</th><th>Phân bố mã</th></tr>
                  </thead>
                  <tbody>
                    {SLOTS.map((sl) => {
                      const entries = Object.entries(simResult.slotCodeCounts[sl] || {});
                      return (
                        <tr key={sl}>
                          <td className="fw-bold">{SLOT_META[sl]?.label}</td>
                          <td>
                            {entries.length === 0 ? (
                              <span className="text-danger">Bỏ qua 100%</span>
                            ) : (
                              entries.map(([code, cnt]) => (
                                <span key={code} className="badge bg-light text-dark border me-1">
                                  {code}: {((cnt / simResult.runs) * 100).toFixed(1)}%
                                </span>
                              ))
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="col-12 col-md-6">
                <h6 className="small fw-bold text-muted">% Thứ tự kỹ năng ở vị trí Màn 2–5</h6>
                <table className="table table-sm small mb-0">
                  <thead>
                    <tr><th>Vị trí</th><th>Phân bố kỹ năng</th></tr>
                  </thead>
                  <tbody>
                    {[2, 3, 4, 5].map((pos) => {
                      const entries = Object.entries(simResult.posSkillCounts[pos] || {});
                      return (
                        <tr key={pos}>
                          <td className="fw-bold">Màn {pos}</td>
                          <td>
                            {entries.map(([sl, cnt]) => (
                              <span key={sl} className="badge bg-light text-dark border me-1">
                                {SLOT_META[sl]?.label}: {((cnt / simResult.runs) * 100).toFixed(1)}%
                              </span>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
