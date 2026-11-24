import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { SEO_CONFIGS } from '../../data/seo-config';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import Icon from '../../components/Icon';
import StreakTab from './StreakTab';
import CosmeticsTab from './CosmeticsTab';
import InventoryTab from './InventoryTab';
import HowToEarnSheet from './HowToEarnSheet';

const SHOP_TABS = [
  { id: 'streak', label: '🔥 Giữ nhịp' },
  { id: 'cosmetics', label: '✨ Trang trí' },
  { id: 'inventory', label: '🎒 Kho đồ' },
];

export default function ShopPage() {
  useSEO(SEO_CONFIGS['/shop']);
  const { userData, setUserData } = useUser();
  const { authFetch, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { petData } = usePet();

  const [activeTab, setActiveTab] = useState('streak');
  const [howToEarnOpen, setHowToEarnOpen] = useState(false);
  const [streakState, setStreakState] = useState(userData.streakState || null);

  const wallet = userData.wallet || {
    milk: userData.availableXP || 0,
    gem: 0,
    stone: 0,
    stone_shard: 0,
  };

  // Xác định pet đang xem thử từ query param "pet", fallback về activePetId
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const petQuery = searchParams.get('pet');
  const selectedPetId = petQuery && petData.collection?.[petQuery]
    ? petQuery
    : (petData.activePetId || Object.keys(petData.collection || {})[0]);

  const handleSelectPet = (newPetId) => {
    const params = new URLSearchParams(location.search);
    params.set('pet', newPetId);
    navigate({ search: params.toString() }, { replace: true });
  };

  // Xử lý nút Quay lại thông minh
  const handleBack = () => {
    const fromParam = searchParams.get('from');
    // Nếu vào từ trang khác trong app (location.key !== 'default' hoặc có state.from)
    if (location.key !== 'default' || location.state?.from) {
      navigate(-1);
      return;
    }
    // Nếu mở trực tiếp bằng link thì về trang nguồn theo query "from", mặc định về /pet
    if (fromParam === 'dex') {
      navigate('/collection');
    } else if (fromParam === 'pet') {
      navigate('/pet');
    } else {
      navigate('/pet');
    }
  };

  // Mở tab hoặc modal từ query param hoặc hash
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') && ['streak', 'cosmetics', 'inventory'].includes(params.get('tab'))) {
      setActiveTab(params.get('tab'));
    }
    if (params.get('help') === 'earn' || location.hash === '#earn') {
      setHowToEarnOpen(true);
    }
  }, [location]);

  // Tải trạng thái Giữ nhịp và ví mới nhất từ server
  const fetchStreakState = async () => {
    if (!user) return;
    try {
      const res = await authFetch('/api/shop/streak-state');
      if (res.ok) {
        const data = await res.json();
        if (data.streakState) {
          setStreakState(data.streakState);
          setUserData((prev) => ({
            ...prev,
            wallet: data.wallet || prev.wallet,
            availableXP: data.wallet ? data.wallet.milk : prev.availableXP,
            streak: data.streakState.currentStreak,
            streakState: data.streakState,
          }));
        }
      }
    } catch (err) {
      console.warn('Lỗi tải trạng thái Cửa hàng:', err);
    }
  };

  useEffect(() => {
    fetchStreakState();
  }, [user]);

  return (
    <div className="fade-in shop-page-container pb-4" style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* 1. Một dòng tiêu đề: Nút Quay lại + Cửa hàng + số dư 🥛 · 💎 · 💠 + nút (?) mở "Cách kiếm" */}
      <div className="d-flex align-items-center justify-content-between py-2 mb-3 border-bottom flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1"
            onClick={handleBack}
            aria-label="Quay lại"
            title="Quay lại"
          >
            <span aria-hidden="true" style={{ fontSize: '15px', fontWeight: 'bold' }}>←</span>
            <span className="d-none d-sm-inline small fw-semibold">Quay lại</span>
          </button>
          <h2 className="fw-bold mb-0 fs-4 d-flex align-items-center gap-2">
            <Icon name="bag" size={24} /> Cửa hàng
          </h2>
        </div>

        {/* Số dư 3 tài nguyên + nút (?) */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center gap-2 px-2 py-1 rounded bg-light border"
            style={{ fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            <span title="Sữa">🥛 <strong>{(wallet.milk || 0).toLocaleString('vi-VN')}</strong></span>
            <span className="text-muted">·</span>
            <span title="Gem">💎 <strong>{(wallet.gem || 0).toLocaleString('vi-VN')}</strong></span>
            <span className="text-muted">·</span>
            <span title="Đá nguyên tố">💠 <strong>{(wallet.stone || 0).toLocaleString('vi-VN')}</strong></span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
            style={{ width: '28px', height: '28px', fontSize: '14px' }}
            title="Xem cách kiếm tài nguyên"
            onClick={() => setHowToEarnOpen(true)}
          >
            ?
          </button>
        </div>
      </div>

      {/* 2. Đúng 3 tab: 🔥 Giữ nhịp · ✨ Trang trí · 🎒 Kho đồ */}
      <div className="d-flex gap-2 mb-3">
        {SHOP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`btn flex-grow-1 py-2 rounded-pill fw-bold ${isActive ? 'btn-cowdi-primary' : 'btn-light border text-muted'}`}
              style={{ fontSize: '14px', transition: 'all 0.15s ease' }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Nội dung từng tab */}
      {activeTab === 'streak' && (
        <StreakTab streakState={streakState} onRefreshState={fetchStreakState} />
      )}

      {activeTab === 'cosmetics' && (
        <CosmeticsTab
          selectedPetId={selectedPetId}
          onSelectPetId={handleSelectPet}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryTab
          selectedPetId={selectedPetId}
          onSelectPetId={handleSelectPet}
        />
      )}

      {/* 4. Bottom Sheet: Cách kiếm Sữa, Gem, Đá */}
      <HowToEarnSheet
        open={howToEarnOpen}
        onClose={() => setHowToEarnOpen(false)}
      />
    </div>
  );
}
