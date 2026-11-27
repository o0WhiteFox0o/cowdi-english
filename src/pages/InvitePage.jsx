import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePet } from '../hooks/usePet';
import { COWDI_IMAGES, PET_REGISTRY } from '../data/pets';
import { GACHA_CONFIG, isPetImageComplete } from '../../shared/game-config';
import { getDeviceId } from '../utils/device';
import Icon from '../components/Icon';

/**
 * /i/:code — Landing nhận thiệp mời (GĐ6 · D7)
 * - Người mới vào qua thiệp mời thường được chọn:
 *   1) Nhận Cowdi (+ phụ kiện "Khăn Bạn Đầu Tiên")
 *   2) Quay Pet Khởi Đầu (1 lượt miễn phí, bể gồm các pet đủ 5 ảnh trừ Cowdi)
 */
export default function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, token, loginWithGoogle, authFetch } = useAuth();
  const { setPetData } = usePet();

  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimingChoice, setClaimingChoice] = useState(null); // 'cowdi' | 'pull' | null
  const [cracking, setCracking] = useState(false);
  const [claimedResult, setClaimedResult] = useState(null);
  const [showRates, setShowRates] = useState(false);

  // Chỉ hiển thị các pet đủ 5/5 hình trong bể quay khởi đầu (trừ Cowdi)
  const readyStarterPets = useMemo(() => {
    return Object.values(PET_REGISTRY).filter(
      (p) => p?.id && p.id !== 'cowdi' && isPetImageComplete(p)
    );
  }, []);

  useEffect(() => {
    if (code) localStorage.setItem('cowdi_pending_invite', code);
  }, [code]);

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

  async function handleChooseStarter(starterChoice) {
    if (!user || !token) {
      loginWithGoogle();
      return;
    }
    if (claimingChoice || cracking) return;
    setClaimingChoice(starterChoice);
    setError(null);
    try {
      const deviceId = getDeviceId();
      const res = await authFetch(`/api/invites/${code}/claim`, {
        method: 'POST',
        headers: deviceId ? { 'X-Device-Id': deviceId } : {},
        body: JSON.stringify({ deviceId, starterChoice }),
      });
      const data = await res.json();
      if (!res.ok && !data.already) {
        localStorage.removeItem('cowdi_pending_invite');
        setError(data.error || 'Không nhận được thiệp.');
        setClaimingChoice(null);
        return;
      }

      localStorage.removeItem('cowdi_pending_invite');
      if (data.starter?.pet && data.starter?.instanceId) {
        setPetData((prev) => ({
          ...prev,
          activePetId: data.starter.instanceId,
          collection: {
            ...(prev?.collection || {}),
            [data.starter.instanceId]: data.starter.pet,
          },
          ownedItems: data.starter.choice === 'cowdi'
            ? Array.from(new Set([...(prev?.ownedItems || []), GACHA_CONFIG.FIRST_FRIEND_SCARF_ID]))
            : (prev?.ownedItems || []),
        }));
      }

      setClaimedResult(data.starter || { choice: starterChoice, speciesId: 'cowdi' });
      setCracking(true);
    } catch {
      setError('Không nhận được thiệp. Thử lại.');
      setClaimingChoice(null);
    }
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
        <div style={{ fontSize: 64 }} className="emoji-big"><Icon name="mail" size={64} /></div>
        <h4 className="mt-3">Thiệp không khả dụng</h4>
        <p className="text-muted">{error || 'Có thể thiệp đã hết hạn hoặc đã được nhận.'}</p>
        <button className="btn btn-cowdi-primary mt-2" onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  if (invite.expired) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: 64 }} className="emoji-big"><Icon name="clock" size={64} /></div>
        <h4 className="mt-3">Thiệp đã hết hạn</h4>
        <p className="text-muted">Nhờ bạn của bạn gửi lại một thiệp mới nha!</p>
        <button className="btn btn-cowdi-primary mt-2" onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  const senderName = invite.sender_name || 'Một người bạn';
  const wonSpecies = claimedResult?.speciesId ? PET_REGISTRY[claimedResult.speciesId] : null;
  const wonRarity = wonSpecies
    ? (GACHA_CONFIG.STARTER_POOL_RATES.find((r) => r.rarity === wonSpecies.rarity) || { label: wonSpecies.rarity, color: '#0d6efd' })
    : null;

  return (
    <div style={{
      minHeight: '72vh',
      background: 'linear-gradient(135deg,#FFD86B 0%,#FF8FA3 100%)',
      borderRadius: 24,
      padding: '28px 18px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Sparkles />

      <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
        <div className="fw-bold text-white fs-5 mb-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
          {senderName}
        </div>
        <p className="text-white mb-3" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
          mời bạn nhận Pet đồng hành đầu tiên <Icon name="gift" size={18} />
        </p>

        {/* Reveal or Egg */}
        {claimedResult && wonSpecies ? (
          <div className="bg-white rounded-4 p-4 mx-auto shadow-lg" style={{ maxWidth: 360 }}>
            <div className="small fw-bold text-uppercase mb-1" style={{ color: wonRarity?.color || '#0d6efd' }}>
              {claimedResult.choice === 'pull' ? `🎲 Quay trúng (${wonRarity?.label || wonSpecies.rarity})` : '🐮 Pet đồng hành'}
            </div>
            <img
              src={wonSpecies.evolutions?.[1]?.image || wonSpecies.evolutions?.[0]?.image || COWDI_IMAGES.egg}
              alt={wonSpecies.name}
              style={{ width: 150, height: 150, objectFit: 'contain' }}
            />
            <h4 className="fw-bold mt-2 mb-1">{wonSpecies.name}</h4>
            {claimedResult.accessoryGranted && (
              <div className="badge bg-warning text-dark mb-2">
                🧣 Tặng kèm: {claimedResult.accessoryGranted}
              </div>
            )}
            <p className="text-muted small mb-3">
              Pet bắt đầu ở C1 — hãy học bài cùng nhau để tiến hoá lên C5 nhé!
            </p>
            <button
              className="btn btn-cowdi-primary w-100 py-2 fw-bold"
              onClick={() => navigate('/pet')}
            >
              Vào nuôi {wonSpecies.name} ngay →
            </button>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={COWDI_IMAGES.egg}
                alt="Pet egg"
                style={{
                  width: 180, height: 180, objectFit: 'contain',
                  filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.25))',
                  animation: cracking ? 'cowdiCrack 1.2s ease-out forwards' : 'cowdiShake 2.4s ease-in-out infinite',
                }}
              />
            </div>

            {invite.message && (
              <div className="mx-auto mb-3 px-3 py-2 bg-white rounded-pill d-inline-block"
                style={{ maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <span className="text-muted"><Icon name="chat" size={16} /> </span>
                <span className="text-dark">"{invite.message}"</span>
              </div>
            )}

            {!user ? (
              <div className="mt-2">
                <button
                  className="btn btn-light btn-lg fw-bold px-4"
                  onClick={loginWithGoogle}
                  style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
                >
                  Đăng nhập Google để chọn Pet
                </button>
                <p className="text-white small mt-2 mb-0" style={{ opacity: 0.9 }}>
                  Sau khi đăng nhập, bạn có thể chọn nhận Cowdi hoặc Quay Pet ngẫu nhiên
                </p>
              </div>
            ) : (
              <div className="mx-auto mt-2" style={{ maxWidth: 440 }}>
                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <button
                      type="button"
                      className="btn btn-light w-100 h-100 p-3 text-start shadow-sm border-2 border-white"
                      disabled={!!claimingChoice}
                      onClick={() => handleChooseStarter('cowdi')}
                    >
                      <div className="fw-bold fs-6 text-dark">🐮 Nhận Cowdi</div>
                      <div className="small text-muted mt-1">
                        Kèm phụ kiện <strong>Khăn Bạn Đầu Tiên</strong>
                      </div>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6">
                    <button
                      type="button"
                      className="btn btn-warning w-100 h-100 p-3 text-start shadow-sm border-2 border-white"
                      disabled={!!claimingChoice}
                      onClick={() => handleChooseStarter('pull')}
                    >
                      <div className="fw-bold fs-6 text-dark">🎰 Quay Pet Khởi Đầu</div>
                      <div className="small text-dark mt-1" style={{ opacity: 0.85 }}>
                        1 lượt miễn phí ({readyStarterPets.length} pet đủ hình · bỏ quyền nhận Cowdi)
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light rounded-pill px-3"
                    onClick={() => setShowRates((v) => !v)}
                  >
                    {showRates ? 'Ẩn tỉ lệ quay' : '📊 Xem tỉ lệ & bể Pet khởi đầu'}
                  </button>
                  {showRates && (
                    <div className="bg-white text-dark rounded-3 p-3 mt-2 text-start small shadow-sm">
                      <div className="fw-bold mb-1">Tỉ lệ công khai (bể {readyStarterPets.length} pet đủ 5 ảnh):</div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {GACHA_CONFIG.STARTER_POOL_RATES.map((r) => (
                          <span key={r.rarity} className="badge" style={{ backgroundColor: r.color }}>
                            {r.label}: {Math.round(r.rate * 100)}%
                          </span>
                        ))}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Các pet chưa đủ 5 hình sẽ tự động được ẩn khỏi bể quay.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-white small mt-4 mb-0" style={{ opacity: 0.85 }}>
          <Icon name="clock" size={14} /> Thiệp hết hạn vào: {new Date(invite.expires_at).toLocaleDateString('vi-VN')}
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
      `}</style>
    </div>
  );
}

function Sparkles() {
  const dots = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.65 }}>
      {dots.map((i) => {
        const top = Math.floor((i * 37) % 100);
        const left = Math.floor((i * 53) % 100);
        const size = 4 + (i % 5);
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
