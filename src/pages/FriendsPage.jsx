import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/layout/Toast';
import { PET_REGISTRY, getEvolutionInfo } from '../data/pets';
import { parseQrPayload } from '../../shared/friends';
import { generateQrDataUrl } from '../utils/qr';
import QrScannerModal from '../components/QrScannerModal';
import InviteSheet from '../features/invite/InviteSheet';
import Icon from '../components/Icon';

const GROUP_LABELS = {
  beginner: 'Mới học',
  intermediate: 'Trung bình',
  exam: 'Luyện thi',
};

const REPORT_REASONS = [
  { id: 'inappropriate_nickname', label: 'Tên hiển thị không phù hợp' },
  { id: 'spam', label: 'Làm phiền / spam lời mời' },
  { id: 'harassment', label: 'Hành vi quấy rối' },
  { id: 'other', label: 'Lý do khác' },
];

function formatViDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('vi-VN');
}

export default function FriendsPage() {
  const { user, token, loginWithGoogle, authFetch } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState('friends'); // 'friends' | 'requests' | 'add'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Tìm kiếm & kết bạn bằng mã 8 ký tự hoặc email chính xác
  const [searchInput, setSearchInput] = useState('');
  const [searchSource, setSearchSource] = useState('code'); // 'code' | 'qr'
  const [searching, setSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState(null); // { found, user, messageVi }
  const [sendingRequest, setSendingRequest] = useState(false);

  // QR cá nhân
  const [myQrSrc, setMyQrSrc] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Inline confirm / report dialogs (C-04: không dùng window.confirm/alert/prompt)
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'remove'|'block', friend }
  const [reportTarget, setReportTarget] = useState(null);   // friend
  const [reportReason, setReportReason] = useState('inappropriate_nickname');
  const [busyAction, setBusyAction] = useState(false);

  // Nếu người dùng chưa đăng nhập mà quét QR /friends?add=CODE -> lưu lại chờ OAuth xong quay về
  const pendingAddCode = searchParams.get('add');
  useEffect(() => {
    if (!user && pendingAddCode && /^[A-Z0-9]{8}$/i.test(pendingAddCode)) {
      localStorage.setItem('cowdi_pending_friend_add', pendingAddCode.toUpperCase());
    }
  }, [user, pendingAddCode]);

  const loadFriends = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/friends');
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      showToast('Không tải được danh sách bạn bè.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [token, authFetch, showToast]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const runLookup = useCallback(async (queryText, source = 'code') => {
    const cleaned = String(queryText || '').trim();
    if (!cleaned || !token) return;
    setSearching(true);
    setLookupResult(null);
    setSearchSource(source);
    try {
      const res = await authFetch(`/api/friends/lookup?q=${encodeURIComponent(cleaned)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLookupResult({ found: false, messageVi: json.messageVi || json.error || 'Không tìm được người dùng.' });
        return;
      }
      setLookupResult(json);
    } catch {
      showToast('Không kết nối được máy chủ.', 'danger');
    } finally {
      setSearching(false);
    }
  }, [token, authFetch, showToast]);

  // Hỗ trợ mở link từ Camera/Zalo: /friends?add=CODE (khi đã đăng nhập)
  useEffect(() => {
    if (!user || !token) return;
    const addCode = searchParams.get('add');
    if (addCode) {
      const normalized = addCode.trim().toUpperCase();
      setSearchInput(normalized);
      setTab('add');
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
      localStorage.removeItem('cowdi_pending_friend_add');
      runLookup(normalized, 'qr');
    }
  }, [user, token, searchParams, setSearchParams, runLookup]);

  // Tạo QR mã bạn bè tại client (URL đầy đủ để người chưa cài App cũng quét được bằng Camera/Zalo)
  useEffect(() => {
    let cancelled = false;
    const fc = data?.friendCode;
    if (!fc) {
      setMyQrSrc('');
      return () => { cancelled = true; };
    }
    const qrUrl = `${window.location.origin}/friends?add=${fc}`;
    generateQrDataUrl(qrUrl, 260)
      .then((src) => { if (!cancelled) setMyQrSrc(src); })
      .catch(() => { if (!cancelled) setMyQrSrc(''); });
    return () => { cancelled = true; };
  }, [data?.friendCode]);

  async function handleSearchSubmit(e) {
    e.preventDefault();
    await runLookup(searchInput, 'code');
  }

  async function handleSendRequest(targetQuery, source = searchSource) {
    const q = String(targetQuery || searchInput).trim();
    if (!q) return;
    setSendingRequest(true);
    try {
      const res = await authFetch('/api/friends/requests', {
        method: 'POST',
        body: JSON.stringify({ query: q, source }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(json.messageVi || json.error || 'Không gửi được lời mời.', 'warning');
        return;
      }
      if (json.autoAccepted) {
        showToast(`🎉 Hai bạn đã trở thành bạn bè với ${json.friend?.nickname || 'bạn mới'}!`, 'success');
        setTab('friends');
      } else {
        showToast(`Đã gửi lời mời kết bạn tới ${json.friend?.nickname || q}!`, 'success');
        setTab('requests');
      }
      setSearchInput('');
      setLookupResult(null);
      setSearchSource('code');
      loadFriends();
    } catch {
      showToast('Không kết nối được máy chủ.', 'danger');
    } finally {
      setSendingRequest(false);
    }
  }

  function handleQrDetected(rawText) {
    setScannerOpen(false);
    const parsed = parseQrPayload(rawText);
    if (!parsed) {
      showToast('Mã QR này không phải mã bạn bè hoặc thiệp mời Cowdi.', 'warning');
      return;
    }
    if (parsed.type === 'invite') {
      navigate(`/i/${parsed.code}`);
      return;
    }
    const queryValue = parsed.type === 'friend_code' ? parsed.code : parsed.email;
    setTab('add');
    setSearchInput(queryValue);
    runLookup(queryValue, 'qr');
  }

  function handleDownloadMyQr() {
    if (!myQrSrc || !data?.friendCode) return;
    const a = document.createElement('a');
    a.href = myQrSrc;
    a.download = `cowdi-friend-${data.friendCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleAccept(userId) {
    setBusyAction(true);
    try {
      const res = await authFetch(`/api/friends/requests/${userId}/accept`, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(json.messageVi || json.error || 'Không chấp nhận được.', 'warning');
      } else {
        showToast('🎉 Đã chấp nhận lời mời kết bạn!', 'success');
        setLookupResult(null);
        loadFriends();
      }
    } finally {
      setBusyAction(false);
    }
  }

  async function handleDecline(userId) {
    setBusyAction(true);
    try {
      const res = await authFetch(`/api/friends/requests/${userId}/decline`, { method: 'POST' });
      if (res.ok) {
        showToast('Đã từ chối / thu hồi lời mời.', 'info');
        loadFriends();
      }
    } finally {
      setBusyAction(false);
    }
  }

  async function handleConfirmedAction() {
    if (!confirmAction) return;
    setBusyAction(true);
    try {
      const { type, friend } = confirmAction;
      if (type === 'remove') {
        const res = await authFetch(`/api/friends/${friend.userId}`, { method: 'DELETE' });
        if (res.ok) showToast(`Đã huỷ kết bạn với ${friend.nickname}.`, 'info');
      } else if (type === 'block') {
        const res = await authFetch(`/api/friends/${friend.userId}/block`, { method: 'POST' });
        if (res.ok) showToast(`Đã chặn ${friend.nickname}.`, 'warning');
      }
      setConfirmAction(null);
      loadFriends();
    } finally {
      setBusyAction(false);
    }
  }

  async function handleUnblock(userId) {
    setBusyAction(true);
    try {
      const res = await authFetch(`/api/friends/${userId}/block`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Đã bỏ chặn.', 'info');
        loadFriends();
      }
    } finally {
      setBusyAction(false);
    }
  }

  async function handleSubmitReport(e) {
    e.preventDefault();
    if (!reportTarget) return;
    setBusyAction(true);
    try {
      const res = await authFetch(`/api/friends/${reportTarget.userId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason: reportReason }),
      });
      if (res.ok) {
        showToast('Đã gửi báo cáo tới quản trị viên. Cảm ơn bạn!', 'success');
        setReportTarget(null);
      } else {
        showToast('Không gửi được báo cáo.', 'danger');
      }
    } finally {
      setBusyAction(false);
    }
  }

  async function handleCopyMyCode() {
    if (!data?.friendCode) return;
    try {
      await navigator.clipboard.writeText(data.friendCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      showToast(`Mã của bạn: ${data.friendCode}`, 'info');
    }
  }

  if (!user) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 520 }}>
        <div className="card border-0 shadow-sm p-4 rounded-4">
          <div className="fs-1 mb-2">🤝</div>
          <h4 className="fw-bold mb-2">
            {pendingAddCode ? `Kết bạn với mã ${pendingAddCode.toUpperCase()}` : 'Bạn bè & Học cùng nhau'}
          </h4>
          <p className="text-muted small mb-3">
            {pendingAddCode
              ? 'Đăng nhập Google để tự động tìm tài khoản này và gửi lời mời kết bạn ngay!'
              : 'Đăng nhập để kết bạn, thăm pet của nhau, thách đấu và cùng đua tiến độ trên lộ trình học!'}
          </p>
          <button className="btn btn-cowdi-primary" onClick={loginWithGoogle}>
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
    );
  }

  const friends = data?.friends || [];
  const incoming = data?.incomingRequests || [];
  const outgoing = data?.outgoingRequests || [];
  const blocked = data?.blocked || [];
  const myDisplayName = data?.nickname || user.display_name || '';

  return (
    <div className="container py-3" style={{ maxWidth: 760 }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="fw-bold mb-0">🤝 Bạn bè</h3>
          <div className="text-muted small">
            {friends.length}/{data?.limits?.maxFriends || 100} bạn bè
            {myDisplayName && (
              <>
                {' · '}Tên hiển thị: <strong>{myDisplayName}</strong>{' '}
                (<Link to="/account" className="text-decoration-none">đổi ở Tài khoản</Link>)
              </>
            )}
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-primary btn-sm" onClick={() => setScannerOpen(true)}>
            📷 Quét mã QR
          </button>
          <button className="btn btn-cowdi-primary btn-sm" onClick={() => setInviteOpen(true)}>
            <Icon name="gift" size={16} /> Gửi thiệp cho người mới
          </button>
        </div>
      </div>

      {/* 3 Tab chính */}
      <ul className="nav nav-pills mb-3 gap-2">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${tab === 'friends' ? 'active' : 'bg-white border text-dark'}`}
            onClick={() => setTab('friends')}
          >
            Bạn bè ({friends.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${tab === 'requests' ? 'active' : 'bg-white border text-dark'}`}
            onClick={() => setTab('requests')}
          >
            Lời mời
            {incoming.length > 0 && (
              <span className="badge bg-danger ms-1">{incoming.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${tab === 'add' ? 'active' : 'bg-white border text-dark'}`}
            onClick={() => setTab('add')}
          >
            ➕ Thêm bạn
          </button>
        </li>
      </ul>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-cowdi-primary" role="status" />
        </div>
      )}

      {/* TAB 1: DANH SÁCH BẠN BÈ */}
      {!loading && tab === 'friends' && (
        friends.length === 0 ? (
          <div className="card border-0 shadow-sm p-4 text-center rounded-4">
            <div className="fs-2 mb-2">🥚</div>
            <h6 className="fw-bold">Chưa có bạn bè nào</h6>
            <p className="text-muted small mb-3">
              Tìm bạn bằng email, nhập mã bạn bè, quét mã QR hoặc gửi thiệp mời cho người mới!
            </p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <button className="btn btn-cowdi-primary btn-sm" onClick={() => setTab('add')}>
                🔍 Tìm bạn / Quét QR
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setInviteOpen(true)}>
                <Icon name="gift" size={16} /> Gửi thiệp cho người mới
              </button>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {friends.map((f) => {
              const evo = getEvolutionInfo(f.petId || 'cowdi', f.petEvolution || 0);
              const species = PET_REGISTRY[f.petId] || PET_REGISTRY.cowdi;
              return (
                <div key={f.userId} className="card border-0 shadow-sm rounded-4 p-3">
                  <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={evo?.image || '/assets/images/pets/Cowdi/Cowdi_egg.webp'}
                        alt={species?.name || 'Pet'}
                        width="52"
                        height="52"
                        className="rounded-circle border bg-light p-1"
                        style={{ objectFit: 'contain' }}
                      />
                      <div>
                        <div className="fw-bold d-flex align-items-center gap-2">
                          <span>{f.nickname}</span>
                          <span className="badge bg-light text-dark border">
                            {species?.name || 'Cowdi'} · C{(f.petEvolution || 0) + 1}
                          </span>
                        </div>
                        <div className="text-muted small">
                          {f.learnerGroup ? `Nhóm: ${GROUP_LABELS[f.learnerGroup] || f.learnerGroup}` : 'Chưa chọn nhóm'}
                          {f.lastActiveDate ? ` · Học gần nhất: ${formatViDate(f.lastActiveDate)}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <Link to={`/friends/${f.userId}`} className="btn btn-sm btn-cowdi-primary">
                        🐾 Thăm pet
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setConfirmAction({ type: 'remove', friend: f })}
                      >
                        Huỷ bạn
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setConfirmAction({ type: 'block', friend: f })}
                      >
                        Chặn
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light border"
                        onClick={() => { setReportTarget(f); setReportReason('inappropriate_nickname'); }}
                        title="Báo cáo"
                      >
                        🚩
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 2: LỜI MỜI & ĐÃ CHẶN */}
      {!loading && tab === 'requests' && (
        <div className="d-flex flex-column gap-3">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <h6 className="fw-bold mb-2">Lời mời đến ({incoming.length})</h6>
            {incoming.length === 0 ? (
              <div className="text-muted small">Không có lời mời kết bạn nào đang chờ.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {incoming.map((req) => {
                  const evo = getEvolutionInfo(req.petId || 'cowdi', req.petEvolution || 0);
                  return (
                    <div key={req.userId} className="d-flex align-items-center justify-content-between border rounded-3 p-2">
                      <div className="d-flex align-items-center gap-2">
                        <img src={evo?.image} alt="" width="40" height="40" className="rounded-circle bg-light" style={{ objectFit: 'contain' }} />
                        <div>
                          <div className="fw-semibold">{req.nickname}</div>
                          <div className="small text-muted">C{(req.petEvolution || 0) + 1}</div>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-success" disabled={busyAction} onClick={() => handleAccept(req.userId)}>
                          Chấp nhận
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" disabled={busyAction} onClick={() => handleDecline(req.userId)}>
                          Từ chối
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-3">
            <h6 className="fw-bold mb-2">Lời mời đã gửi ({outgoing.length})</h6>
            {outgoing.length === 0 ? (
              <div className="text-muted small">Bạn chưa gửi lời mời nào đang chờ.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {outgoing.map((req) => (
                  <div key={req.userId} className="d-flex align-items-center justify-content-between border rounded-3 p-2">
                    <span className="fw-semibold">{req.nickname}</span>
                    <button className="btn btn-sm btn-outline-secondary" disabled={busyAction} onClick={() => handleDecline(req.userId)}>
                      Thu hồi
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {blocked.length > 0 && (
            <div className="card border-0 shadow-sm rounded-4 p-3">
              <h6 className="fw-bold mb-2">Đã chặn ({blocked.length})</h6>
              <div className="d-flex flex-column gap-2">
                {blocked.map((b) => (
                  <div key={b.userId} className="d-flex align-items-center justify-content-between border rounded-3 p-2">
                    <span>{b.nickname}</span>
                    <button className="btn btn-sm btn-outline-primary" disabled={busyAction} onClick={() => handleUnblock(b.userId)}>
                      Bỏ chặn
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: THÊM BẠN (TÌM EMAIL / MÃ BẠN BÈ, QUÉT QR TRONG APP & MÃ QR CÁ NHÂN) */}
      {!loading && tab === 'add' && (
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
              <h6 className="fw-bold mb-2">Tìm bạn đã có tài khoản</h6>
              <p className="text-muted small mb-2">
                Nhập <strong>email chính xác</strong> hoặc <strong>mã bạn bè 8 ký tự</strong>, hoặc bấm quét mã QR.
              </p>

              <form onSubmit={handleSearchSubmit} className="mb-2">
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: banbe@gmail.com hoặc ABCD2345"
                    value={searchInput}
                    onChange={(e) => { setSearchInput(e.target.value); setSearchSource('code'); }}
                    required
                  />
                  <button type="submit" className="btn btn-cowdi-primary" disabled={searching}>
                    {searching ? '...' : '🔍 Tìm'}
                  </button>
                </div>
              </form>

              <button
                type="button"
                className="btn btn-outline-primary btn-sm w-100 mb-3"
                onClick={() => setScannerOpen(true)}
              >
                📷 Quét mã QR bằng Camera / Ảnh
              </button>

              {/* Kết quả tìm kiếm chính xác */}
              {lookupResult && !lookupResult.found && (
                <div className="alert alert-light border small py-2 mb-3">
                  {lookupResult.messageVi || 'Không tìm thấy tài khoản khớp chính xác.'}
                </div>
              )}

              {lookupResult?.found && lookupResult.user && (() => {
                const u = lookupResult.user;
                const evo = getEvolutionInfo(u.petId || 'cowdi', u.petEvolution || 0);
                const species = PET_REGISTRY[u.petId] || PET_REGISTRY.cowdi;
                return (
                  <div className="border rounded-3 p-3 bg-light mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <img src={evo?.image} alt="" width="44" height="44" className="rounded-circle bg-white border p-1" style={{ objectFit: 'contain' }} />
                      <div>
                        <div className="fw-bold">{u.nickname}</div>
                        <div className="small text-muted">
                          {species?.name || 'Cowdi'} · C{(u.petEvolution || 0) + 1}
                          {u.learnerGroup ? ` · ${GROUP_LABELS[u.learnerGroup] || u.learnerGroup}` : ''}
                        </div>
                      </div>
                    </div>
                    {u.relationStatus === 'accepted' ? (
                      <Link to={`/friends/${u.userId}`} className="btn btn-sm btn-success w-100">
                        ✓ Đã là bạn bè — Thăm pet
                      </Link>
                    ) : u.relationStatus === 'outgoing' ? (
                      <button type="button" className="btn btn-sm btn-secondary w-100" disabled>
                        ⏳ Đã gửi lời mời (đang chờ đồng ý)
                      </button>
                    ) : u.relationStatus === 'incoming' ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-success w-100"
                        disabled={busyAction}
                        onClick={() => handleAccept(u.userId)}
                      >
                        ✓ Bạn này đã gửi lời mời — Chấp nhận ngay
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-cowdi-primary w-100"
                        disabled={sendingRequest}
                        onClick={() => handleSendRequest(u.friendCode || searchInput, searchSource)}
                      >
                        {sendingRequest ? 'Đang gửi...' : '➕ Gửi lời mời kết bạn'}
                      </button>
                    )}
                  </div>
                );
              })()}

              <hr className="my-2" />
              <h6 className="fw-bold mb-1">Bạn của bạn chưa có tài khoản?</h6>
              <p className="text-muted small mb-2">
                Gửi thiệp mời tặng trứng Cowdi — hai bạn sẽ tự động kết bạn và cùng nhận thưởng (+3 💎 / +500 🥛)!
              </p>
              <button className="btn btn-outline-success btn-sm w-100" onClick={() => setInviteOpen(true)}>
                <Icon name="gift" size={16} /> Gửi thiệp cho người mới
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100 text-center">
              <h6 className="fw-bold mb-1">Mã bạn bè &amp; QR của bạn</h6>
              <div className="d-flex justify-content-center align-items-center gap-2 my-2">
                <span className="fs-4 fw-bold font-monospace px-3 py-1 bg-light border rounded-3">
                  {data?.friendCode || '--------'}
                </span>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCopyMyCode}>
                  {copiedCode ? '✓ Đã copy' : 'Copy'}
                </button>
              </div>
              {myQrSrc && (
                <div className="my-2">
                  <img src={myQrSrc} alt="QR mã bạn bè" width="180" height="180" className="border rounded-3 p-1" />
                  <div className="mt-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleDownloadMyQr}>
                      📥 Tải ảnh QR để gửi Zalo
                    </button>
                  </div>
                </div>
              )}
              <div className="text-muted small text-start bg-light rounded-3 p-2 mt-2">
                <div><strong>Cách quét mã QR này:</strong></div>
                <div>• <strong>Bạn đã mở App Cowdi:</strong> vào <em>Bạn bè → 📷 Quét mã QR</em> (quét trực tiếp hoặc chọn ảnh QR).</div>
                <div>• <strong>Bạn chưa cài App / chưa mở Cowdi:</strong> dùng <strong>Camera điện thoại hoặc Zalo</strong> quét thẳng mã này → trình duyệt tự mở Cowdi, đăng nhập và kết bạn ngay!</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận huỷ kết bạn / chặn */}
      {confirmAction && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.45)', zIndex: 1090 }}
          onClick={() => setConfirmAction(null)}
        >
          <div className="bg-white rounded-4 p-4 shadow" style={{ maxWidth: 400, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h6 className="fw-bold mb-2">
              {confirmAction.type === 'block' ? `Chặn ${confirmAction.friend.nickname}?` : `Huỷ kết bạn với ${confirmAction.friend.nickname}?`}
            </h6>
            <p className="text-muted small mb-3">
              {confirmAction.type === 'block'
                ? 'Người bị chặn sẽ không thể tìm thấy, gửi lời mời kết bạn, thách đấu và sẽ ẩn khỏi lộ trình của nhau.'
                : 'Hai bạn có thể kết bạn lại sau bằng email, mã bạn bè hoặc QR.'}
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-light" onClick={() => setConfirmAction(null)}>Đóng</button>
              <button
                className={`btn btn-sm ${confirmAction.type === 'block' ? 'btn-danger' : 'btn-warning'}`}
                disabled={busyAction}
                onClick={handleConfirmedAction}
              >
                {confirmAction.type === 'block' ? 'Chặn ngay' : 'Huỷ kết bạn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal báo cáo */}
      {reportTarget && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.45)', zIndex: 1090 }}
          onClick={() => setReportTarget(null)}
        >
          <form className="bg-white rounded-4 p-4 shadow" style={{ maxWidth: 420, width: '100%' }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmitReport}>
            <h6 className="fw-bold mb-2">🚩 Báo cáo {reportTarget.nickname}</h6>
            <div className="mb-3">
              {REPORT_REASONS.map((r) => (
                <div className="form-check mb-1" key={r.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="reportReason"
                    id={`rep-${r.id}`}
                    checked={reportReason === r.id}
                    onChange={() => setReportReason(r.id)}
                  />
                  <label className="form-check-label small" htmlFor={`rep-${r.id}`}>
                    {r.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-sm btn-light" onClick={() => setReportTarget(null)}>Huỷ</button>
              <button type="submit" className="btn btn-sm btn-danger" disabled={busyAction}>Gửi báo cáo</button>
            </div>
          </form>
        </div>
      )}

      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleQrDetected}
      />

      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
