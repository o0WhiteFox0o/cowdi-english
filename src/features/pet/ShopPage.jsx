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
  const { userData, setUserData, syncWallet } = useUser();
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
          if (data.wallet) {
            syncWallet(data.wallet);
          } else {
            setUserData((prev) => ({
              ...prev,
              streak: data.streakState.currentStreak,
              streakState: data.streakState,
            }));
          }
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
    <div className="fade-in shop-page-wrap">
      {/* 1. Header: Nút Quay lại + Tiêu đề Cửa hàng + nút (?) Cách kiếm */}
      <div className="shop-head">
        <div className="shop-title-row">
          <div className="shop-title-left">
            <button
              type="button"
              className="shop-back-btn"
              onClick={handleBack}
              aria-label="Quay lại"
              title="Quay lại"
            >
              <span aria-hidden="true" style={{ fontSize: '18px', lineHeight: 1 }}>←</span>
              <span className="d-none d-sm-inline">Quay lại</span>
            </button>
            <div className="shop-title-wrap">
              <h2 className="shop-title">
                <Icon name="bag" size={26} /> Cửa hàng
              </h2>
              <p className="shop-sub">Sắm vật phẩm giữ nhịp, trang trí phòng và phụ kiện thú cưng</p>
            </div>
          </div>

          <button
            type="button"
            className="shop-help-btn"
            title="Xem cách kiếm tài nguyên"
            onClick={() => setHowToEarnOpen(true)}
            aria-label="Cách kiếm tài nguyên"
          >
            ?
          </button>
        </div>
      </div>

      {/* 2. Đúng 3 tab: 🔥 Giữ nhịp · ✨ Trang trí · 🎒 Kho đồ */}
      <div className="shop-tabs">
        {SHOP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`shop-tab-btn ${isActive ? 'on' : ''}`}
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
          wallet={wallet}
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
