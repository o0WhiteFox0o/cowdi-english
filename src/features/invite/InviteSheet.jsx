import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PET_REGISTRY, getPetEvolution } from '../../data/pets';

/**
 * InviteSheet — bottom sheet "🎁 Tặng bạn một quả trứng pet"
 * Tạo invite ngay khi mở → hiển thị QR + nút share/copy/download.
 */
export default function InviteSheet({ open, onClose, prefilledMessage }) {
  const { user, token, authFetch } = useAuth();
  const [invite, setInvite] = useState(null);   // { code, url, expires_at }
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrFull, setQrFull] = useState(false);
  const canvasRef = useRef(null);
  const triedRef = useRef(false); // ngăn gọi lại sau lỗi

  const SITE   = window.location.origin;
  const fullUrl = invite ? `${SITE}/i/${invite.code}` : '';
  const qrSrc   = invite
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(fullUrl)}`
    : '';

  // Tạo invite khi sheet mở
  const createInvite = useCallback(async (msg) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/invites', {
        method: 'POST',
        body: JSON.stringify({ pet_species: 'cowdi', message: msg || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`);
      setInvite(data);
    } catch (err) {
      setError(err.message || 'Không tạo được thiệp');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (open && token && !triedRef.current) {
      triedRef.current = true;
      if (prefilledMessage) setMessage(prefilledMessage);
      createInvite(prefilledMessage || '');
    }
    if (!open) {
      // reset khi đóng
      triedRef.current = false;
      setInvite(null);
      setMessage('');
      setError(null);
      setCopied(false);
      setQrFull(false);
    }
  }, [open, token, createInvite, prefilledMessage]);

  if (!open) return null;

  // ── Actions ─────────────────────────────────────────────
  async function handleShare() {
    if (!invite) return;
    const text = (message ? `${message}\n\n` : '') +
      `Mình tặng bạn một quả trứng Cowdi 🥚\nHọc tiếng Anh cùng mình nha!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cowdi Pet Invite 🎁', text, url: fullUrl });
      } catch { /* user cancelled */ }
    } else {
      // Fallback: copy
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
      // Fallback execCommand
      const ta = document.createElement('textarea');
      ta.value = fullUrl; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  async function handleDownload() {
    if (!invite) return;
    try {
      const blob = await renderInviteCard({
        senderName: user?.display_name || 'Bạn',
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

  // ── Pet preview ─────────────────────────────────────────
  const evo = getPetEvolution('cowdi', 0);
  const petImage = evo?.image || '/assets/images/pets/Cowdi/Cowdi_egg.webp';

  // ── If not logged in ────────────────────────────────────
  if (!user) {
    return (
      <Overlay onClose={onClose}>
        <Sheet>
          <h5 className="mb-3">🎁 Mời bạn học cùng</h5>
          <p className="text-muted small">Bạn cần đăng nhập để tạo thiệp mời cá nhân.</p>
          <button className="btn btn-cowdi-primary w-100" onClick={onClose}>OK</button>
        </Sheet>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <Sheet>
        {qrFull && invite ? (
          <QrFullscreen url={fullUrl} qrSrc={qrSrc} onClose={() => setQrFull(false)} />
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="m-0">🎁 Tặng bạn quả trứng pet</h5>
              <button className="btn btn-sm btn-light" onClick={onClose} aria-label="Đóng">✕</button>
            </div>
            <p className="text-muted small mb-3">
              Gửi link/QR cho bạn — họ chạm vào sẽ nhận một quả trứng Cowdi.
            </p>

            {/* Pet preview */}
            <div className="text-center mb-2">
              <img src={petImage} alt="Cowdi egg"
                style={{ width: 110, height: 110, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
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
                    🔄 Thử lại
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
                    <img src={qrSrc} alt="QR code"
                      width="200" height="200"
                      style={{ borderRadius: 12, border: '1px solid #eee' }} />
                  </button>
                  <div className="small text-muted mt-1" style={{ wordBreak: 'break-all' }}>
                    {fullUrl}
                  </div>
                </>
              )}
            </div>

            {/* Optional message */}
            <div className="mb-3">
              <label className="form-label small mb-1">💬 Lời nhắn (tuỳ chọn)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Học cùng tao đi nha!"
                value={message}
                maxLength={200}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!invite}
              />
            </div>

            {/* Action buttons */}
            <div className="d-grid gap-2">
              <button
                className="btn btn-cowdi-primary"
                onClick={handleShare}
                disabled={!invite}
              >
                🚀 Gửi qua chat
              </button>
              <div className="row g-2">
                <div className="col-4">
                  <button className="btn btn-outline-secondary w-100 btn-sm" onClick={handleCopy} disabled={!invite}>
                    {copied ? '✓ Đã copy' : '📋 Copy link'}
                  </button>
                </div>
                <div className="col-4">
                  <button className="btn btn-outline-secondary w-100 btn-sm" onClick={handleDownload} disabled={!invite}>
                    💾 Tải thiệp
                  </button>
                </div>
                <div className="col-4">
                  <button className="btn btn-outline-secondary w-100 btn-sm" onClick={() => setQrFull(true)} disabled={!invite}>
                    🔍 QR to
                  </button>
                </div>
              </div>
            </div>

            <p className="text-muted small text-center mt-3 mb-0">
              ⏰ Thiệp hết hạn sau 7 ngày
            </p>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        )}
      </Sheet>
    </Overlay>
  );
}

// ── UI helpers ────────────────────────────────────────────
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
        <h5 className="m-0">📱 Quét mã để nhận trứng</h5>
        <button className="btn btn-sm btn-light" onClick={onClose}>✕</button>
      </div>
      <img src={qrSrc} alt="QR code"
        style={{ width: '100%', maxWidth: 360, borderRadius: 16, border: '1px solid #eee' }} />
      <div className="small text-muted mt-2" style={{ wordBreak: 'break-all' }}>{url}</div>
      <p className="small mt-3 mb-0">Mở camera điện thoại của bạn bè → hướng vào mã này</p>
    </div>
  );
}

// ── Canvas renderer ───────────────────────────────────────
async function renderInviteCard({ senderName, message, fullUrl, qrSrc }) {
  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Gradient background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#FFD86B');
  g.addColorStop(1, '#FF8FA3');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Soft sparkles
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 4 + 1;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // White card
  const padding = 50;
  const cardX = padding, cardY = padding, cardW = W - padding * 2, cardH = H - padding * 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // ── Vertical rhythm (top → bottom inside card) ─────────────
  //  title  ~125
  //  egg    160 → 420   (260×260)
  //  tagline ~480
  //  bubble  515 → 585  (chỉ khi có message)
  //  QR      625 → 925  (300×300)
  //  URL    ~960
  //  watermark ~1010

  // Title
  ctx.fillStyle = '#3D2A1F';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(truncate(`${senderName} tặng bạn`, 28), W / 2, 125);

  // Egg image
  const egg = await loadImage('/assets/images/pets/Cowdi/Cowdi_egg.webp').catch(() => null);
  const eggSize = 260;
  const eggX = (W - eggSize) / 2, eggY = 160;
  if (egg) {
    ctx.drawImage(egg, eggX, eggY, eggSize, eggSize);
  } else {
    ctx.font = '220px serif';
    ctx.fillText('🥚', W / 2, eggY + 200);
  }

  // Tagline
  ctx.fillStyle = '#E0527E';
  ctx.font = 'bold 50px system-ui, sans-serif';
  ctx.fillText('Một quả trứng Cowdi 🐮', W / 2, 480);

  // Optional message bubble
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

  // QR code (centered, with white pad — well separated from egg)
  const qrImg = await loadImage(qrSrc).catch(() => null);
  const qrSize = 300, qrY = 625, qrX = (W - qrSize) / 2;
  if (qrImg) {
    ctx.fillStyle = '#FFF';
    roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 14);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  // URL under QR
  ctx.fillStyle = '#888';
  ctx.font = '26px monospace';
  ctx.fillText(fullUrl.replace(/^https?:\/\//, ''), W / 2, qrY + qrSize + 38);

  // Watermark
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
