import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { COWDI_IMAGES } from '../data/pets';

/**
 * /i/:code — Landing nhận thiệp mời "trứng pet"
 * - Chưa login: hiện thiệp + nút "Nhận bằng Google"
 * - Đã login: gọi claim → animation crack → vào /pet
 */
export default function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, token, loginWithGoogle, authFetch } = useAuth();

  const [invite, setInvite] = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [cracking, setCracking] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Lưu code vào localStorage để giữ sau khi login redirect quay lại
  useEffect(() => {
    if (code) localStorage.setItem('cowdi_pending_invite', code);
  }, [code]);

  // Fetch thông tin thiệp
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API}/api/invites/${code}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) { setError(data.error || 'Thiệp không tồn tại.'); return; }
        setInvite(data);
      } catch {
        if (!cancelled) setError('Không kết nối được. Thử lại sau.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  // Khi user đã login + đã có invite → auto claim
  useEffect(() => {
    if (!user || !token || !invite || claimed || invite.expired) return;
    if (invite.claimed) return;
    (async () => {
      try {
        const res = await authFetch(`/api/invites/${code}/claim`, { method: 'POST' });
        const data = await res.json();
        if (res.ok || data.already) {
          setClaimed(true);
          localStorage.removeItem('cowdi_pending_invite');
        } else if (data.error) {
          setError(data.error);
        }
      } catch {
        setError('Không nhận được thiệp. Thử lại.');
      }
    })();
  }, [user, token, invite, claimed, authFetch, code]);

  function handleAccept() {
    if (!user) {
      loginWithGoogle();
      return;
    }
    setCracking(true);
    setTimeout(() => navigate('/pet'), 1800);
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-cowdi-primary" role="status" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: 64 }}>📭</div>
        <h4 className="mt-3">Thiệp không khả dụng</h4>
        <p className="text-muted">{error || 'Có thể thiệp đã hết hạn hoặc đã được nhận.'}</p>
        <button className="btn btn-cowdi-primary mt-2" onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  if (invite.expired) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: 64 }}>⏰</div>
        <h4 className="mt-3">Thiệp đã hết hạn</h4>
        <p className="text-muted">Nhờ bạn của bạn gửi lại một thiệp mới nha!</p>
        <button className="btn btn-cowdi-primary mt-2" onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  const senderName = invite.sender_name || 'Một người bạn';
  const senderAvatar = invite.sender_avatar;

  return (
    <div style={{
      minHeight: '70vh',
      background: 'linear-gradient(135deg,#FFD86B 0%,#FF8FA3 100%)',
      borderRadius: 24,
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Sparkles />

      <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
        {/* Sender */}
        <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
          {senderAvatar && (
            <img src={senderAvatar} alt="" width="36" height="36"
              className="rounded-circle border border-2 border-white"
              referrerPolicy="no-referrer" />
          )}
          <span className="fw-bold text-white" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {senderName}
          </span>
        </div>
        <p className="text-white mb-3" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
          tặng bạn một quả trứng pet 🎁
        </p>

        {/* Egg */}
        <div style={{ position: 'relative', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={COWDI_IMAGES.egg}
            alt="Cowdi egg"
            style={{
              width: 220, height: 220, objectFit: 'contain',
              filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.25))',
              animation: cracking ? 'cowdiCrack 1.6s ease-out forwards' : 'cowdiShake 2.4s ease-in-out infinite',
            }}
          />
          {cracking && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 80, animation: 'cowdiPop 1.4s ease-out forwards', opacity: 0,
            }}>
              ✨
            </div>
          )}
        </div>

        {/* Pet name */}
        <h3 className="text-white mt-2" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>Cowdi 🐮</h3>

        {/* Message */}
        {invite.message && (
          <div className="mx-auto mt-3 px-3 py-2 bg-white rounded-pill d-inline-block"
            style={{ maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <span className="text-muted">💬 </span>
            <span className="text-dark">"{invite.message}"</span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-4">
          {!user ? (
            <>
              <button
                className="btn btn-light btn-lg fw-bold px-4"
                onClick={loginWithGoogle}
                style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
              >
                👉 Nhận trứng (đăng nhập Google)
              </button>
              <p className="text-white small mt-2 mb-0" style={{ opacity: 0.9 }}>
                Đăng nhập để pet thuộc về bạn vĩnh viễn
              </p>
            </>
          ) : claimed && !cracking ? (
            <button
              className="btn btn-light btn-lg fw-bold px-4"
              onClick={handleAccept}
              style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
            >
              🥚 Mở trứng & vào nuôi pet
            </button>
          ) : cracking ? (
            <div className="text-white fw-bold">Đang mở... ✨</div>
          ) : (
            <div className="text-white small">Đang nhận thiệp...</div>
          )}
        </div>

        <p className="text-white small mt-4 mb-0" style={{ opacity: 0.85 }}>
          ⏰ Thiệp hết hạn vào: {new Date(invite.expires_at).toLocaleDateString('vi-VN')}
        </p>
      </div>

      <style>{`
        @keyframes cowdiShake {
          0%, 100% { transform: rotate(0deg); }
          15%      { transform: rotate(-6deg); }
          30%      { transform: rotate(5deg); }
          45%      { transform: rotate(-4deg); }
          60%      { transform: rotate(3deg); }
        }
        @keyframes cowdiCrack {
          0%   { transform: scale(1) rotate(0deg); }
          30%  { transform: scale(1.1) rotate(-10deg); }
          60%  { transform: scale(1.15) rotate(8deg); }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        @keyframes cowdiPop {
          0%   { transform: scale(0); opacity: 0; }
          50%  { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Sparkles() {
  const dots = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.65 }}>
      {dots.map((i) => {
        const top   = Math.floor((i * 37) % 100);
        const left  = Math.floor((i * 53) % 100);
        const size  = 4 + (i % 5);
        return (
          <span key={i} style={{
            position: 'absolute',
            top: `${top}%`, left: `${left}%`,
            width: size, height: size, borderRadius: '50%',
            background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.8)',
          }} />
        );
      })}
    </div>
  );
}
