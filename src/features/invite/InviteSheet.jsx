import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getEvolutionInfo } from '../../data/pets';
import { generateQrDataUrl } from '../../utils/qr';
import { getDeviceId } from '../../utils/device';
import Icon from '../../components/Icon';

/**
 * InviteSheet — bottom sheet "🎁 Tặng bạn một quả trứng pet"
 * - FR-FRD-05: hỏi đặt biệt danh lần đầu trước khi tạo thiệp
 * - FR-LND-04: QR tạo ngay tại client (không phụ thuộc dịch vụ bên thứ ba)
 * - FR-RWD-06: hiển thị thống kê đã gửi / đã nhận / đã học thật, tiến độ mốc, vé tháng (x/3)
 * - FR-MAP-09: gợi ý mời bạn cùng lớp hoặc cùng mục tiêu học
 */
export default function InviteSheet({ open, onClose, prefilledMessage }) {
  const { user, token, authFetch } = useAuth();
  const [invite, setInvite] = useState(null);   // { code, url, expires_at }
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrFull, setQrFull] = useState(false);
  const [qrSrc, setQrSrc] = useState('');
  const canvasRef = useRef(null);
  const triedRef = useRef(false);

  const SITE = window.location.origin;
  const fullUrl = invite ? `${SITE}/i/${invite.code}` : '';

  // FR-LND-04: tạo QR tại client
  useEffect(() => {
    let cancelled = false;
    if (!fullUrl) {
      setQrSrc('');
      return () => { cancelled = true; };
    }
    generateQrDataUrl(fullUrl, 320)
      .then((dataUrl) => { if (!cancelled) setQrSrc(dataUrl); })
      .catch(() => { if (!cancelled) setQrSrc(''); });
    return () => { cancelled = true; };
  }, [fullUrl]);

  const loadStats = useCallback(async () => {
    try {
      const res = await authFetch('/api/invites/mine/stats');
      if (!res.ok) return null;
      const data = await res.json();
      setStats(data);
      return data;
    } catch {
      return null;
    }
  }, [authFetch]);

  const createInvite = useCallback(async (msg) => {
    setLoading(true);
    setError(null);
    try {
      const deviceId = getDeviceId();
      const res = await authFetch('/api/invites', {
        method: 'POST',
        headers: deviceId ? { 'X-Device-Id': deviceId } : {},
        body: JSON.stringify({ pet_species: 'cowdi', message: msg || null, deviceId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Lỗi ${res.status}`);
      }
      setInvite(data);
      loadStats();
    } catch (err) {
      setError(err.message || 'Không tạo được thiệp');
    } finally {
      setLoading(false);
    }
  }, [authFetch, loadStats]);

  useEffect(() => {
    if (open && token && !triedRef.current) {
      triedRef.current = true;
      if (prefilledMessage) setMessage(prefilledMessage);
      loadStats();
      createInvite(prefilledMessage || '');
    }
    if (!open) {
      triedRef.current = false;
      setInvite(null);
      setStats(null);
      setMessage('');
      setError(null);
      setCopied(false);
      setQrFull(false);
    }
  }, [open, token, createInvite, loadStats, prefilledMessage]);

  if (!open) return null;

  async function handleShare() {
    if (!invite) return;
    const text = (message ? `${message}\n\n` : '') +
      `Mình tặng bạn một quả trứng Cowdi 🥚\nHọc tiếng Anh cùng mình nha!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cowdi Pet Invite 🎁', text, url: fullUrl });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  }

  async function handleCopy() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = fullUrl; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  async function handleDownload() {
    if (!invite || !qrSrc) return;
    try {
      const blob = await renderInviteCard({
        senderName: stats?.nickname || 'Một người bạn',
        message,
        fullUrl,
        qrSrc,
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cowdi-invite-${invite.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    } catch (err) {
      setError('Không tạo được ảnh thiệp. ' + (err?.message || ''));
    }
  }

  const evo = getEvolutionInfo('cowdi', 0);
  const petImage = evo?.image || '/assets/images/pets/Cowdi/Cowdi_egg.webp';

  if (!user) {
    return (
      <Overlay onClose={onClose}>
        <Sheet>
          <h5 className="mb-3"><Icon name="gift" size={20} /> Mời bạn học cùng</h5>
          <p className="text-muted small">Bạn cần đăng nhập để tạo thiệp mời cá nhân.</p>
          <button className="btn btn-cowdi-primary w-100" onClick={onClose}>OK</button>
        </Sheet>
      </Overlay>
    );
  }

  const nextMs = stats?.nextMilestone;
  const milestonePct = nextMs
    ? Math.min(100, Math.round(((stats?.activatedCount || 0) / nextMs.count) * 100))
    : 100;

  return (
    <Overlay onClose={onClose}>
      <Sheet>
        {qrFull && invite ? (
          <QrFullscreen url={fullUrl} qrSrc={qrSrc} onClose={() => setQrFull(false)} />
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="m-0"><Icon name="gift" size={20} /> Tặng bạn quả trứng pet</h5>
              <button className="btn btn-sm btn-light" onClick={onClose} aria-label="Đóng">✕</button>
            </div>
            <p className="text-muted small mb-2">
              Gửi link/QR cho bạn mới — khi bạn học thật 3 bài (trong ít nhất 2 ngày), bạn nhận 💎 +3 Gem và bạn mới nhận 🥛 +500 Sữa!
            </p>
            <div className="alert alert-light border small py-2 px-3 mb-3">
              💡 Mời bạn cùng lớp hoặc cùng mục tiêu học để gặp nhau trên lộ trình.
            </div>

            {/* Pet preview */}
                <div className="text-center mb-2">
                  <img src={petImage} alt="Cowdi egg"
                    style={{ width: 96, height: 96, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
                </div>

                {/* QR + URL */}
                <div className="text-center mb-2">
                  {loading && <div className="spinner-border text-cowdi-primary" role="status" />}
                  {error && (
                    <div className="alert alert-warning small py-2 mb-2">
                      <div className="mb-2">{error}</div>
                      <button
                        type="button"
                        className="btn btn-sm btn-warning"
                        onClick={() => { triedRef.current = true; createInvite(''); }}
                        disabled={loading}
                      >
                        <Icon name="refresh" size={14} /> Thử lại
                      </button>
                    </div>
                  )}
                  {invite && (
                    <>
                      <button
                        type="button"
                        className="border-0 bg-transparent p-0"
                        onClick={() => setQrFull(true)}
                        title="Bấm để phóng to"
                      >
                        {qrSrc ? (
                          <img src={qrSrc} alt="QR code"
                            width="180" height="180"
                            style={{ borderRadius: 12, border: '1px solid #eee' }} />
                        ) : (
                          <div style={{ width: 180, height: 180 }} className="d-flex align-items-center justify-content-center border rounded-3">
                            <div className="spinner-border spinner-border-sm text-cowdi-primary" role="status" />
                          </div>
                        )}
                      </button>
                      <div className="small text-muted mt-1" style={{ wordBreak: 'break-all' }}>
                        {fullUrl}
                      </div>
                    </>
                  )}
                </div>

                {/* Optional message */}
                <div className="mb-3">
                  <label className="form-label small mb-1"><Icon name="chat" size={14} /> Lời nhắn (tuỳ chọn)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Học tiếng Anh cùng mình nha!"
                    value={message}
                    maxLength={200}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!invite}
                  />
                </div>

                {/* Action buttons */}
                <div className="d-grid gap-2 mb-3">
                  <button
                    className="btn btn-cowdi-primary"
                    onClick={handleShare}
                    disabled={!invite}
                  >
                    <Icon name="rocket" size={18} /> Gửi qua Zalo / Chat
                  </button>
                  <div className="row g-2">
                    <div className="col-4">
                      <button className="btn btn-outline-secondary w-100 btn-sm" onClick={handleCopy} disabled={!invite}>
                        {copied ? '✓ Đã copy' : <><Icon name="clipboard" size={14} /> Copy link</>}
                      </button>
                    </div>
                    <div className="col-4">
                      <button className="btn btn-outline-secondary w-100 btn-sm" onClick={handleDownload} disabled={!invite || !qrSrc}>
                        <Icon name="save" size={14} /> Tải thiệp
                      </button>
                    </div>
                    <div className="col-4">
                      <button className="btn btn-outline-secondary w-100 btn-sm" onClick={() => setQrFull(true)} disabled={!invite || !qrSrc}>
                        <Icon name="search" size={14} /> QR to
                      </button>
                    </div>
                  </div>
                </div>

            {/* FR-RWD-06: Thống kê mời bạn & tiến độ mốc */}
            {stats && (
              <div className="border rounded-3 p-3 bg-light small mb-2">
                <div className="d-flex justify-content-between text-center mb-2">
                  <div>
                    <div className="fw-bold fs-6">{stats.sentCount}</div>
                    <div className="text-muted">Đã gửi</div>
                  </div>
                  <div>
                    <div className="fw-bold fs-6">{stats.claimedCount}</div>
                    <div className="text-muted">Đã nhận</div>
                  </div>
                  <div>
                    <div className="fw-bold fs-6 text-success">{stats.activatedCount}</div>
                    <div className="text-muted">Đã học thật</div>
                  </div>
                </div>

                {nextMs ? (
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Mốc kế tiếp: <strong>{nextMs.count} bạn</strong></span>
                      <span className="text-primary fw-semibold">
                        +{nextMs.tickets} Vé gacha{nextMs.titleVi ? ` · "${nextMs.titleVi}"` : ''}
                      </span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${milestonePct}%` }}
                        aria-valuenow={milestonePct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-success fw-semibold mb-2">
                    🏆 Bạn đã hoàn thành toàn bộ các mốc Đại sứ Cowdi!
                  </div>
                )}

                <div className="d-flex justify-content-between text-muted">
                  <span>Vé gacha nhận tháng này: <strong>{stats.ticketsGrantedThisMonth}/{stats.ticketsCapThisMonth}</strong></span>
                  <span>🎟️ {stats.totalGachaTickets} Vé gacha (sắp dùng được)</span>
                </div>
                {stats.ticketsDeferredCount > 0 && (
                  <div className="text-muted mt-1">
                    ⏳ {stats.ticketsDeferredCount} vé vượt hạn mức tháng sẽ tự cộng khi sang tháng sau.
                  </div>
                )}
              </div>
            )}

            <p className="text-muted small text-center mt-2 mb-0">
              <Icon name="clock" size={14} /> Thiệp hết hạn sau 7 ngày · Chỉ dành cho tài khoản mới
            </p>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        )}
      </Sheet>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1080,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'cowdiFadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes cowdiFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cowdiSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (min-width: 576px) {
          .cowdi-invite-sheet { align-self: center; border-radius: 16px !important; max-width: 480px; }
        }
      `}</style>
      {children}
    </div>
  );
}

function Sheet({ children }) {
  return (
    <div
      className="cowdi-invite-sheet bg-white p-3 w-100"
      style={{
        maxWidth: 560, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        animation: 'cowdiSlideUp 0.22s ease',
        maxHeight: '92vh', overflowY: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function QrFullscreen({ url, qrSrc, onClose }) {
  return (
    <div className="text-center">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0"><Icon name="phone" size={20} /> Quét mã để nhận trứng</h5>
        <button className="btn btn-sm btn-light" onClick={onClose}>✕</button>
      </div>
      <img src={qrSrc} alt="QR code"
        style={{ width: '100%', maxWidth: 360, borderRadius: 16, border: '1px solid #eee' }} />
      <div className="small text-muted mt-2" style={{ wordBreak: 'break-all' }}>{url}</div>
      <p className="small mt-3 mb-0">Mở camera điện thoại của bạn bè → hướng vào mã này</p>
    </div>
  );
}

async function renderInviteCard({ senderName, message, fullUrl, qrSrc }) {
  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#FFD86B');
  g.addColorStop(1, '#FF8FA3');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 4 + 1;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  const padding = 50;
  const cardX = padding, cardY = padding, cardW = W - padding * 2, cardH = H - padding * 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.fillStyle = '#3D2A1F';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(truncate(`${senderName} tặng bạn`, 28), W / 2, 125);

  const egg = await loadImage('/assets/images/pets/Cowdi/Cowdi_egg.webp').catch(() => null);
  const eggSize = 260;
  const eggX = (W - eggSize) / 2, eggY = 160;
  if (egg) {
    ctx.drawImage(egg, eggX, eggY, eggSize, eggSize);
  } else {
    ctx.font = '220px serif';
    ctx.fillText('🥚', W / 2, eggY + 200);
  }

  ctx.fillStyle = '#E0527E';
  ctx.font = 'bold 50px system-ui, sans-serif';
  ctx.fillText('Một quả trứng Cowdi 🐮', W / 2, 480);

  if (message) {
    const bubbleY = 515, bubbleH = 70;
    const bubbleW = cardW - 100;
    ctx.fillStyle = '#FFF8EC';
    roundRect(ctx, cardX + 50, bubbleY, bubbleW, bubbleH, 18);
    ctx.fill();
    ctx.fillStyle = '#6B4226';
    ctx.font = '28px system-ui, sans-serif';
    ctx.fillText(truncate(`💬 "${message}"`, 60), W / 2, bubbleY + 46);
  }

  const qrImg = await loadImage(qrSrc).catch(() => null);
  const qrSize = 300, qrY = 625, qrX = (W - qrSize) / 2;
  if (qrImg) {
    ctx.fillStyle = '#FFF';
    roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 14);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  ctx.fillStyle = '#888';
  ctx.font = '26px monospace';
  ctx.fillText(fullUrl.replace(/^https?:\/\//, ''), W / 2, qrY + qrSize + 38);

  ctx.fillStyle = '#999';
  ctx.font = 'italic 22px system-ui, sans-serif';
  ctx.fillText('Học tiếng Anh, nuôi pet • cowdi.net', W / 2, H - padding - 18);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
