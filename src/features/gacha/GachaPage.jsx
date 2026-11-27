import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';
import { usePet } from '../../hooks/usePet';
import { PET_REGISTRY } from '../../data/pets';
import { GACHA_CONFIG, isPetImageComplete } from '../../../shared/game-config';
import Icon from '../../components/Icon';

export default function GachaPage() {
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();
  const { refreshWallet, showToast } = useUser();
  const { setPetData } = usePet();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);
  const [tab, setTab] = useState('machine'); // 'machine' | 'rates' | 'history'

  async function fetchInfo() {
    if (!user) { setLoading(false); return; }
    try {
      const res = await authFetch('/api/gacha/info');
      if (res.ok) {
        const data = await res.json();
        setInfo(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, [user?.id]);

  // Chỉ hiển thị các pet đủ 5/5 hình trong bể Gacha
  const readyEpicPets = useMemo(() => {
    const ids = info?.pools?.epic || [];
    return ids.map((id) => PET_REGISTRY[id]).filter((p) => p && isPetImageComplete(p));
  }, [info]);

  const readyLimitedPets = useMemo(() => {
    const ids = info?.pools?.limited || [];
    return ids.map((id) => PET_REGISTRY[id]).filter((p) => p && isPetImageComplete(p));
  }, [info]);

  async function handleBuyTicket() {
    if (buying || pulling) return;
    setBuying(true);
    try {
      const res = await authFetch('/api/gacha/buy-ticket', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast?.(data.error || 'Không mua được vé Gacha.', 'warning');
      } else {
        showToast?.('Đã mua +1 Vé Gacha!', 'success');
        setInfo((prev) => prev ? { ...prev, wallet: data.wallet } : prev);
        refreshWallet?.();
      }
    } catch {
      showToast?.('Lỗi kết nối khi mua vé.', 'danger');
    } finally {
      setBuying(false);
    }
  }

  async function handlePull() {
    if (pulling || buying) return;
    setPulling(true);
    setLastOutcome(null);
    try {
      const res = await authFetch('/api/gacha/pull', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast?.(data.error || 'Không quay được Gacha.', 'warning');
      } else {
        setLastOutcome(data.outcome);
        if (data.grantedPet?.instanceId) {
          setPetData((prev) => ({
            ...prev,
            collection: {
              ...(prev?.collection || {}),
              [data.grantedPet.instanceId]: data.grantedPet,
            },
          }));
        }
        refreshWallet?.();
        await fetchInfo();
      }
    } catch {
      showToast?.('Lỗi kết nối khi quay Gacha.', 'danger');
    } finally {
      setPulling(false);
    }
  }

  if (!user) {
    return (
      <div className="text-center py-5">
        <div className="fs-1 mb-2">🎰</div>
        <h4 className="fw-bold">Gacha Pet Cowdi</h4>
        <p className="text-muted">Vui lòng đăng nhập để sử dụng máy quay Gacha.</p>
      </div>
    );
  }

  const tickets = info?.wallet?.gacha_ticket ?? 0;
  const gems = info?.wallet?.gem ?? 0;
  const ticketPrice = info?.ticketPriceGem ?? GACHA_CONFIG.TICKET_PRICE_GEM;

  const wonPet = lastOutcome?.rewardType === 'pet' ? PET_REGISTRY[lastOutcome.rewardId] : null;
  const wonRarity = wonPet
    ? (GACHA_CONFIG.STARTER_POOL_RATES.find((r) => r.rarity === wonPet.rarity) || { label: wonPet.rarity, color: '#8b5cf6' })
    : null;

  return (
    <div className="container py-3 fade-in" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary rounded-circle" onClick={() => navigate(-1)}>
            ←
          </button>
          <div>
            <h4 className="fw-bold mb-0">🎰 Máy Quay Gacha Pet</h4>
            <div className="text-muted small">Tỉ lệ cố định 67/22/8/3 · Không bảo hiểm · Chỉ gồm pet đủ 5 hình</div>
          </div>
        </div>
      </div>

      {/* Wallet Strip */}
      <div className="card shadow-sm mb-3 border-0" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%)', borderRadius: 16 }}>
        <div className="card-body py-2.5 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-white text-dark border px-3 py-2 fs-6 shadow-sm">
              🎫 <strong>{tickets}</strong> Vé Gacha
            </span>
            <span className="badge bg-white text-dark border px-3 py-2 fs-6 shadow-sm">
              💎 <strong>{gems}</strong> Gem
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm fw-bold rounded-pill px-3"
            disabled={buying || gems < ticketPrice}
            onClick={handleBuyTicket}
          >
            {buying ? 'Đang mua...' : `Mua 1 vé (${ticketPrice} 💎)`}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="btn-group w-100 mb-3" role="group">
        <button
          type="button"
          className={`btn btn-sm fw-bold ${tab === 'machine' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setTab('machine')}
        >
          🎰 Quay thưởng
        </button>
        <button
          type="button"
          className={`btn btn-sm fw-bold ${tab === 'rates' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setTab('rates')}
        >
          📊 Tỉ lệ & Bể Pet
        </button>
        <button
          type="button"
          className={`btn btn-sm fw-bold ${tab === 'history' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setTab('history')}
        >
          📜 Lịch sử ({info?.history?.length || 0})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : tab === 'machine' ? (
        <div className="card shadow-sm border-0 text-center" style={{ borderRadius: 20 }}>
          <div className="card-body p-4">
            {lastOutcome ? (
              <div className="p-3 rounded-4 mb-3 border" style={{ background: '#f8fafc' }}>
                {wonPet ? (
                  <>
                    <div className="small fw-bold text-uppercase mb-1" style={{ color: wonRarity?.color }}>
                      ✨ CHÚC MỪNG! TRÚNG PET {wonRarity?.label?.toUpperCase()} ✨
                    </div>
                    <img
                      src={wonPet.evolutions?.[1]?.image || wonPet.evolutions?.[0]?.image}
                      alt={wonPet.name}
                      style={{ width: 120, height: 120, objectFit: 'contain' }}
                    />
                    <h5 className="fw-bold mt-2 mb-0">{wonPet.name}</h5>
                    <div className="text-muted small">Đã thêm vào Bộ sưu tập ở cấp C1</div>
                  </>
                ) : (
                  <>
                    <div className="fs-1 mb-1">🎁</div>
                    <h5 className="fw-bold mb-1">{lastOutcome.label}</h5>
                    <div className="text-muted small">
                      Bậc: <strong>{GACHA_CONFIG.STANDARD_RATES.find((r) => r.tier === lastOutcome.tier)?.label || lastOutcome.tier}</strong>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-3 mb-2">
                <div style={{ fontSize: 64 }}>🥚</div>
                <h5 className="fw-bold mt-2">Sẵn sàng quay Gacha!</h5>
                <p className="text-muted small mb-0">
                  Mỗi lượt tốn <strong>1 Vé Gacha</strong>. Pet trúng bắt đầu ở C1 và cần học cùng để tiến hoá.
                </p>
              </div>
            )}

            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg w-100 py-3 fw-bold rounded-4"
              disabled={pulling || tickets < 1}
              onClick={handlePull}
            >
              {pulling ? 'Đang quay...' : tickets >= 1 ? '🎰 Quay 1 lần (1 🎫)' : 'Hết vé — Hãy mua vé bằng Gem'}
            </button>
          </div>
        </div>
      ) : tab === 'rates' ? (
        <div className="card shadow-sm border-0" style={{ borderRadius: 16 }}>
          <div className="card-body">
            <h6 className="fw-bold mb-2">📊 Bảng công khai tỉ lệ Gacha</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {GACHA_CONFIG.STANDARD_RATES.map((r) => (
                <span key={r.tier} className="badge px-2.5 py-1.5" style={{ backgroundColor: r.color }}>
                  {r.label}: {Math.round(r.rate * 100)}%
                </span>
              ))}
            </div>

            <div className="small text-muted mb-3">
              • <strong>Thường (67%)</strong>: 250 Sữa · 4 Vé Đấu trường · 1 Khăn giữ lửa (nếu &lt; 2).<br />
              • <strong>Hiếm (22%)</strong>: 3 Mảnh đá nguyên tố · 600 Sữa.<br />
              • <strong>Sử thi (8%)</strong> &amp; <strong>Giới hạn / Đặc biệt (3%)</strong>: Pet đủ 5/5 hình bên dưới (nếu trùng đổi thành <strong>+{GACHA_CONFIG.DUPLICATE_EPIC_GEM} Gem</strong>).
            </div>

            <h6 className="fw-bold mb-2">🌟 Bể Pet Đặc biệt / Giới hạn (3%)</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {readyLimitedPets.map((p) => (
                <div key={p.id} className="border rounded-3 p-2 text-center bg-light" style={{ width: 92 }}>
                  <img src={p.evolutions?.[1]?.image || p.evolutions?.[0]?.image} alt={p.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                  <div className="small fw-bold text-truncate mt-1">{p.name}</div>
                </div>
              ))}
            </div>

            <h6 className="fw-bold mb-2">🟣 Bể Pet Sử thi (8%)</h6>
            <div className="d-flex flex-wrap gap-2">
              {readyEpicPets.map((p) => (
                <div key={p.id} className="border rounded-3 p-2 text-center bg-light" style={{ width: 92 }}>
                  <img src={p.evolutions?.[1]?.image || p.evolutions?.[0]?.image} alt={p.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                  <div className="small fw-bold text-truncate mt-1">{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0" style={{ borderRadius: 16 }}>
          <div className="card-body">
            <h6 className="fw-bold mb-2">📜 Lịch sử 100 lượt quay gần nhất</h6>
            {(!info?.history || info.history.length === 0) ? (
              <div className="text-muted small py-3 text-center">Chưa có lượt quay nào.</div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }} className="small">
                {info.history.map((h) => (
                  <div key={h.id} className="d-flex justify-content-between align-items-center py-1.5 border-bottom">
                    <div>
                      <span className="badge bg-secondary me-1">{h.tier}</span>
                      <strong>{h.reward_type === 'pet' ? (PET_REGISTRY[h.reward_id]?.name || h.reward_id) : `${h.reward_amount} ${h.reward_type}`}</strong>
                      {h.is_duplicate ? <span className="text-warning ms-1">(Trùng)</span> : null}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {new Date(h.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
