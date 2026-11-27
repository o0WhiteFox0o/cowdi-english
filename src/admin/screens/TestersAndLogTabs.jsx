import { useState, useEffect, useCallback } from 'react';

export function TestersTab({ authFetch, onNotify }) {
  const [query, setQuery] = useState('');
  const [testers, setTesters] = useState([]);
  const [matches, setMatches] = useState([]);
  const [noteById, setNoteById] = useState({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/admin/screen-testers?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setTesters(data.testers || []);
        setMatches(data.matches || []);
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { load(''); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(query);
  };

  const handleAdd = async (userId) => {
    const res = await authFetch('/api/admin/screen-testers', {
      method: 'POST',
      body: JSON.stringify({ userId, note: noteById[userId] || '' }),
    });
    if (res.ok) {
      onNotify?.('Đã thêm tài khoản vào danh sách thử nghiệm.', 'success');
      load(query);
    } else {
      const err = await res.json().catch(() => ({}));
      onNotify?.(err.error || 'Không thêm được tài khoản thử.', 'danger');
    }
  };

  const handleRemove = async (userId) => {
    const res = await authFetch(`/api/admin/screen-testers/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      onNotify?.('Đã gỡ khỏi danh sách thử nghiệm.', 'info');
      load(query);
    }
  };

  const testerIdSet = new Set(testers.map((t) => t.userId));

  return (
    <div className="d-flex flex-column gap-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-2">Tìm người dùng để thêm vào nhóm thử nghiệm</h6>
          <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nhập tên hoặc email người dùng..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-sm btn-cowdi-primary px-3" disabled={loading}>
              Tìm
            </button>
          </form>

          {matches.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr><th>ID</th><th>Tên</th><th>Email</th><th>Ghi chú</th><th className="text-end">Thêm</th></tr>
                </thead>
                <tbody>
                  {matches.map((u) => (
                    <tr key={u.userId}>
                      <td className="font-monospace small">{u.userId}</td>
                      <td className="fw-semibold">{u.name || '—'}</td>
                      <td className="small text-muted">{u.email}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Ghi chú..."
                          value={noteById[u.userId] || ''}
                          onChange={(e) => setNoteById((p) => ({ ...p, [u.userId]: e.target.value }))}
                        />
                      </td>
                      <td className="text-end">
                        {testerIdSet.has(u.userId) ? (
                          <span className="badge bg-success">Đã trong nhóm</span>
                        ) : (
                          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleAdd(u.userId)}>
                            + Thêm
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-2">Danh sách tài khoản thử hiện tại ({testers.length})</h6>
          {testers.length === 0 ? (
            <p className="text-muted small mb-0">Chưa có tài khoản thử nào.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr><th>ID</th><th>Tên</th><th>Email</th><th>Ghi chú</th><th>Ngày thêm</th><th className="text-end">Gỡ</th></tr>
                </thead>
                <tbody>
                  {testers.map((t) => (
                    <tr key={t.userId}>
                      <td className="font-monospace small">{t.userId}</td>
                      <td className="fw-semibold">{t.name || '—'}</td>
                      <td className="small text-muted">{t.email}</td>
                      <td className="small">{t.note || '—'}</td>
                      <td className="small text-muted">{t.addedAt ? new Date(t.addedAt).toLocaleString('vi-VN') : '—'}</td>
                      <td className="text-end">
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(t.userId)}>
                          Bỏ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LogTab({ authFetch }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (beforeId = null) => {
    setLoading(true);
    try {
      const qs = beforeId ? `?limit=50&before=${beforeId}` : '?limit=50';
      const res = await authFetch(`/api/admin/screen-log${qs}`);
      if (res.ok) {
        const data = await res.json();
        const next = data.logs || [];
        setLogs((prev) => (beforeId ? [...prev, ...next] : next));
        setHasMore(next.length === 50);
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { load(null); }, [load]);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0">Nhật ký thay đổi cấu hình ({logs.length})</h6>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => load(null)} disabled={loading}>
            ↻ Làm mới
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-muted small mb-0">Chưa có thay đổi nào được ghi nhận.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0 small">
              <thead className="table-light">
                <tr><th>Thời gian</th><th>Người đổi</th><th>Đối tượng</th><th>Cũ → Mới</th></tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="text-muted text-nowrap">{l.changedAt ? new Date(l.changedAt).toLocaleString('vi-VN') : '—'}</td>
                    <td className="fw-semibold">{l.actorName}</td>
                    <td className="font-monospace">{l.target}</td>
                    <td className="font-monospace text-break">
                      <span className="text-muted">{l.oldValue ? JSON.stringify(l.oldValue) : '(trống)'}</span>
                      {' → '}
                      <span className="text-success fw-semibold">{l.newValue ? JSON.stringify(l.newValue) : '(trống)'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasMore && logs.length > 0 && (
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={loading}
              onClick={() => load(logs[logs.length - 1].id)}
            >
              {loading ? 'Đang tải...' : 'Xem thêm'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
