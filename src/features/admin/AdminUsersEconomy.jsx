import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function AdminUsersEconomy() {
  const { authFetch } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [economy, setEconomy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(
    async (q = '') => {
      setLoading(true);
      setError('');
      try {
        const [uRes, eRes] = await Promise.all([
          authFetch(`/api/admin/users?q=${encodeURIComponent(q)}&limit=40`),
          authFetch('/api/admin/economy'),
        ]);
        if (!uRes.ok) throw new Error('Không tải được danh sách người dùng.');
        const uJson = await uRes.json();
        const eJson = eRes.ok ? await eRes.json() : null;
        setUsers(Array.isArray(uJson?.users) ? uJson.users : []);
        if (eJson) setEconomy(eJson);
      } catch (err) {
        setError(err.message || 'Lỗi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    loadData('');
  }, [loadData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(query);
  };

  const circ = economy?.circulation || {};

  return (
    <div className="fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-1">👥 Quản lý Người dùng &amp; Tổng quan Kinh tế v2</h4>
          <p className="text-muted small mb-0">
            Tra cứu tài khoản học sinh, kiểm tra ví tài nguyên (Sữa, Gem, Đá, Vé), xếp hạng Đấu trường và dòng tiền 7 ngày.
          </p>
        </div>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => loadData(query)} disabled={loading}>
          🔄 Tải lại
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Tổng quan Kinh tế v2 */}
      {economy && (
        <div className="row g-2 mb-3">
          {[
            { label: 'Sữa lưu hành', val: (circ.milk || 0).toLocaleString(), icon: '🥛', color: '#0284c7' },
            { label: 'Gem lưu hành', val: (circ.gem || 0).toLocaleString(), icon: '💎', color: '#7c3aed' },
            { label: 'Đá tiến hoá', val: (circ.stone || 0).toLocaleString(), icon: '🪨', color: '#b45309' },
            { label: 'Vé Đấu trường', val: (circ.arenaTickets || 0).toLocaleString(), icon: '🎟️', color: '#dc2626' },
            { label: 'Trận Đấu 7 ngày', val: (economy.arenaMatches7d || 0).toLocaleString(), icon: '⚔️', color: '#059669' },
            { label: 'Lượt Gacha 7 ngày', val: (economy.gachaPulls7d || 0).toLocaleString(), icon: '🎁', color: '#db2777' },
          ].map((tile) => (
            <div key={tile.label} className="col-6 col-md-4 col-lg-2">
              <div className="cowdi-card p-2 text-center">
                <div className="small text-muted">{tile.icon} {tile.label}</div>
                <div className="fw-bold fs-5" style={{ color: tile.color }}>{tile.val}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tìm kiếm tài khoản */}
      <form className="card border-0 shadow-sm mb-3" onSubmit={handleSearchSubmit}>
        <div className="card-body py-2 px-3 d-flex flex-wrap gap-2 align-items-center">
          <input
            type="search"
            className="form-control form-control-sm"
            style={{ maxWidth: 320 }}
            placeholder="Tìm theo email, tên hiển thị hoặc nickname..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-primary fw-bold" disabled={loading}>
            Tìm kiếm
          </button>
          <span className="ms-auto small text-muted">
            Hiển thị <strong>{users.length}</strong> tài khoản gần nhất
          </span>
        </div>
      </form>

      {/* Bảng tài khoản */}
      <div className="cowdi-card p-0 overflow-hidden mb-3">
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.83rem' }}>
            <thead className="table-light">
              <tr>
                <th>Học sinh</th>
                <th>Học tập</th>
                <th>Ví Kinh tế v2</th>
                <th>Đấu trường</th>
                <th className="text-end">Hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">Không tìm thấy tài khoản nào.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="fw-bold">
                        {u.displayName}{' '}
                        {u.isAdmin && <span className="badge bg-danger ms-1">Admin</span>}
                      </div>
                      <div className="small text-muted">{u.email} · ID #{u.id}</div>
                    </td>
                    <td>
                      <div><strong>{u.lessonsCompleted}</strong> bài · 🔥 {u.streak} ngày</div>
                      <div className="small text-muted">{u.totalXp.toLocaleString()} XP</div>
                    </td>
                    <td>
                      {u.wallet ? (
                        <div className="d-flex flex-wrap gap-1">
                          <span className="badge bg-light text-dark border">🥛 {u.wallet.milk.toLocaleString()}</span>
                          <span className="badge bg-light text-dark border">💎 {u.wallet.gem}</span>
                          <span className="badge bg-light text-dark border">🪨 {u.wallet.stone}</span>
                          <span className="badge bg-light text-dark border">🎟️ {u.wallet.arenaTickets}</span>
                        </div>
                      ) : (
                        <span className="text-muted small">Chưa khởi tạo ví</span>
                      )}
                    </td>
                    <td>
                      {u.arena ? (
                        <div>
                          <strong>{u.arena.lp} LP</strong>{' '}
                          <span className="small text-muted">({u.arena.wins}W / {u.arena.losses}L)</span>
                        </div>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="text-end small text-muted">
                      <div>Gần nhất: {fmtDate(u.lastSeenAt)}</div>
                      <div>Tạo: {fmtDate(u.createdAt)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dòng tiền ledger 7 ngày */}
      {Array.isArray(economy?.ledger7d) && economy.ledger7d.length > 0 && (
        <div className="cowdi-card p-3">
          <h6 className="fw-bold mb-2">📒 Tổng hợp giao dịch Ledger (7 ngày qua)</h6>
          <div className="table-responsive">
            <table className="table table-sm mb-0" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Lý do (reason)</th>
                  <th>Loại tài nguyên</th>
                  <th className="text-end">Số giao dịch</th>
                  <th className="text-end">Biến động ròng</th>
                </tr>
              </thead>
              <tbody>
                {economy.ledger7d.map((row, idx) => (
                  <tr key={`${row.currency}-${row.reason}-${idx}`}>
                    <td><code>{row.reason}</code></td>
                    <td>{row.currency}</td>
                    <td className="text-end">{row.txCount.toLocaleString()}</td>
                    <td className={`text-end fw-bold ${row.netDelta >= 0 ? 'text-success' : 'text-danger'}`}>
                      {row.netDelta >= 0 ? `+${row.netDelta.toLocaleString()}` : row.netDelta.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
