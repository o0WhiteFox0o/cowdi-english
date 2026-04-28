import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

// ── Sparkline SVG (không cần thư viện) ─────────────────────────────
function Sparkline({ data, color = '#E91E63', height = 60, label = '' }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-muted small">—</div>;
  }
  const max = Math.max(1, ...data);
  const w = 100;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => `${(i * step).toFixed(2)},${(height - (v / max) * (height - 4) - 2).toFixed(2)}`).join(' ');
  const areaPts = `0,${height} ${points} ${w},${height}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }} role="img" aria-label={label}>
      <polygon points={areaPts} fill={color} fillOpacity="0.12" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
function fmtRelative(d) {
  if (!d) return '—';
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.round(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.round(diff / 3600)} giờ trước`;
  return `${Math.round(diff / 86400)} ngày trước`;
}

const KPI_TILES = [
  { key: 'totalUsers', label: 'Tổng user',       icon: '👥', color: '#2196F3' },
  { key: 'newToday',   label: 'Đăng ký h.nay',   icon: '🆕', color: '#4CAF50' },
  { key: 'newWeek',    label: 'Đăng ký 7 ngày',  icon: '📈', color: '#8BC34A' },
  { key: 'dau',        label: 'DAU',             icon: '🔥', color: '#FF5722' },
  { key: 'wau',        label: 'WAU',             icon: '📅', color: '#FF9800' },
  { key: 'mau',        label: 'MAU',             icon: '🗓️', color: '#9C27B0' },
  { key: 'hitsToday',  label: 'Lượt h.nay',      icon: '⚡', color: '#FFC107' },
  { key: 'stickiness', label: 'DAU/MAU',         icon: '🧲', color: '#E91E63', isRatio: true },
];

export default function AdminPage() {
  const { user, authFetch } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState(null);
  const [days, setDays]     = useState(30);

  useEffect(() => {
    if (!user) { setLoad(false); return; }
    setLoad(true);
    setError(null);
    authFetch(`/api/admin/overview?days=${days}`)
      .then(async r => {
        if (r.status === 403) { setError('forbidden'); return null; }
        if (!r.ok) { setError('Lỗi tải dữ liệu.'); return null; }
        return r.json();
      })
      .then(json => { if (json) setData(json); })
      .catch(() => setError('Không kết nối được server.'))
      .finally(() => setLoad(false));
  }, [days, user, authFetch]);

  const seriesSignups = useMemo(() => data?.series?.map(s => s.signups) || [], [data]);
  const seriesActive  = useMemo(() => data?.series?.map(s => s.active)  || [], [data]);
  const seriesHits    = useMemo(() => data?.series?.map(s => s.hits)    || [], [data]);

  if (!user) {
    return <div className="alert alert-warning">Vui lòng đăng nhập.</div>;
  }
  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-cowdi-primary" /></div>;
  }
  if (error === 'forbidden') {
    return (
      <div className="text-center py-5">
        <div className="fs-1 mb-3">🔒</div>
        <h4>Trang dành cho quản trị viên</h4>
        <p className="text-muted">Liên hệ admin để được cấp quyền.</p>
      </div>
    );
  }
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return null;

  return (
    <div className="fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h2 className="fw-bold mb-0">📊 Quản trị cộng đồng</h2>
          <p className="text-muted small mb-0">Theo dõi tăng trưởng, độ gắn kết và chăm sóc người dùng</p>
        </div>
        <div className="btn-group btn-group-sm">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              className={`btn ${days === d ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
              onClick={() => setDays(d)}
            >{d} ngày</button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="row g-2 mb-3">
        {KPI_TILES.map(t => {
          const v = data.kpi[t.key];
          const display = t.isRatio ? `${Math.round((v || 0) * 100)}%` : (v ?? 0).toLocaleString();
          return (
            <div className="col-6 col-md-3" key={t.key}>
              <div className="card border-0 shadow-sm h-100" style={{ background: t.color + '10' }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                    <span className="text-muted small">{t.label}</span>
                  </div>
                  <div className="fw-bold" style={{ fontSize: '1.5rem', color: t.color }}>{display}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retention card */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2 px-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <div className="fw-bold">🎯 Retention 7 ngày</div>
              <div className="text-muted small">Tỉ lệ user mới (7-14 ngày trước) vẫn quay lại 7 ngày qua</div>
            </div>
            <div className="col-md-8 d-flex align-items-center gap-3">
              <div style={{ flex: 1 }}>
                <div className="progress" style={{ height: 18 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${Math.round(data.retention7d.rate * 100)}%` }}
                  >{Math.round(data.retention7d.rate * 100)}%</div>
                </div>
              </div>
              <div className="text-muted small text-nowrap">
                {data.retention7d.retained} / {data.retention7d.cohort} user
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-2 mb-3">
        {[
          { label: '🆕 Đăng ký mới', data: seriesSignups, color: '#4CAF50', total: seriesSignups.reduce((a,b)=>a+b,0) },
          { label: '🔥 Active users',  data: seriesActive,  color: '#FF5722', total: Math.max(...seriesActive, 0) + ' đỉnh' },
          { label: '⚡ Lượt truy cập', data: seriesHits,    color: '#FFC107', total: seriesHits.reduce((a,b)=>a+b,0) },
        ].map((c, i) => (
          <div className="col-md-4" key={i}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body py-2 px-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold small">{c.label}</span>
                  <span className="text-muted small">{c.total}</span>
                </div>
                <Sparkline data={c.data} color={c.color} label={c.label} />
                <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.65rem' }}>
                  <span className="text-muted">{data.series[0]?.date}</span>
                  <span className="text-muted">{data.series[data.series.length-1]?.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User tables */}
      <div className="row g-2">
        <UserTable
          title="🌟 Top user hoạt động (7 ngày)"
          rows={data.topUsers}
          columns={[
            { key: 'hits7d',       label: 'Lượt' },
            { key: 'activeDays7d', label: 'Ngày' },
            { key: 'streak',       label: '🔥' },
          ]}
        />
        <UserTable
          title="🆕 Đăng ký gần đây"
          rows={data.recentSignups}
          columns={[
            { key: 'created_at',   label: 'Đăng ký', format: fmtDate },
            { key: 'last_seen_at', label: 'Last seen', format: fmtRelative },
          ]}
        />
        <UserTable
          title="⚠️ User có nguy cơ rời"
          rows={data.atRisk}
          columns={[
            { key: 'daysAway', label: 'Ngày vắng' },
            { key: 'streak',   label: '🔥' },
            { key: 'total_xp', label: 'XP' },
          ]}
          emptyHint="Không có ai 'cần chăm sóc' lúc này 🎉"
        />
      </div>
    </div>
  );
}

function UserTable({ title, rows, columns, emptyHint }) {
  return (
    <div className="col-lg-4 col-md-6">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-0">
          <div className="px-3 pt-3 pb-2 fw-bold small">{title}</div>
          {rows && rows.length > 0 ? (
            <div className="list-group list-group-flush">
              {rows.map(r => (
                <div key={r.id} className="list-group-item d-flex align-items-center gap-2 py-2 px-3">
                  {r.avatar_url
                    ? <img src={r.avatar_url} alt="" width="28" height="28" className="rounded-circle" referrerPolicy="no-referrer" />
                    : <span className="fs-5">👤</span>}
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold small text-truncate" style={{ maxWidth: 180 }}>{r.display_name || 'Ẩn danh'}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: '0.65rem', maxWidth: 180 }}>{r.email}</div>
                  </div>
                  <div className="text-end" style={{ fontSize: '0.7rem' }}>
                    {columns.map(c => (
                      <div key={c.key} className="text-muted">
                        <span className="me-1">{c.label}</span>
                        <span className="fw-bold text-dark">
                          {c.format ? c.format(r[c.key]) : (r[c.key] ?? 0).toLocaleString?.() ?? r[c.key]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted small py-3 px-3">{emptyHint || 'Không có dữ liệu'}</div>
          )}
        </div>
      </div>
    </div>
  );
}
