import { useState, useMemo, useEffect } from 'react';
import { usePet } from '../../hooks/usePet';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { PET_REGISTRY, getEvolutionInfo } from '../../data/pets';
import {
  COSMETIC_RARITIES,
  BACKGROUND_ITEMS,
  EFFECT_ITEMS,
  COSMETIC_MAP,
  getCosmeticPrice,
  checkCosmeticUnlocked,
} from '../../../shared/cosmetics-data.js';
import Emoji from '../../components/Emoji';
import PetPreview from '../../components/pet/PetPreview';
import CosmeticBuySheet from './CosmeticBuySheet';

const COSMETIC_CATEGORIES = [
  { id: 'room', label: `🖼️ Nền (${BACKGROUND_ITEMS.length} món)` },
  { id: 'effect', label: `✨ Hào quang (${EFFECT_ITEMS.length} món)` },
];

const RARITY_FILTERS = [
  { id: 'all', label: 'Tất cả phẩm chất' },
  { id: 'common', label: '⚪ Thường' },
  { id: 'rare', label: '🔵 Hiếm' },
  { id: 'epic', label: '🟣 Sử thi' },
  { id: 'legendary', label: '🟡 Huyền thoại' },
  { id: 'achievement', label: '🟢 Mốc học' },
  { id: 'season', label: '🟠 Mùa' },
];

const ELEMENT_FILTERS = [
  { id: 'all', label: 'Tất cả hệ' },
  { id: 'fire', label: '🔥 Hỏa' },
  { id: 'water', label: '🌊 Thủy' },
  { id: 'wood', label: '🎋 Mộc' },
  { id: 'metal', label: '⚙️ Kim' },
  { id: 'earth', label: '🪨 Thổ' },
  { id: 'light', label: '☀️ Quang' },
  { id: 'dark', label: '🌑 Ám' },
  { id: 'wind', label: '🌪️ Phong' },
  { id: 'thunder', label: '⚡ Lôi' },
  { id: 'neutral', label: '🥋 Vô' },
];

export default function CosmeticsTab({ selectedPetId, onSelectPetId }) {
  const { authFetch } = useAuth();
  const { petData, equipItem } = usePet();
  const showToast = useToast();
  const { play } = useSound();

  const [subCategory, setSubCategory] = useState('room');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [elementFilter, setElementFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);

  // Dữ liệu từ server
  const [serverOwnedIds, setServerOwnedIds] = useState(null);
  const [serverWallet, setServerWallet] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [buyingItem, setBuyingItem] = useState(null);
  const [loadingBuy, setLoadingBuy] = useState(false);

  // Tải danh mục và trạng thái từ server
  useEffect(() => {
    let cancelled = false;
    async function loadCosmetics() {
      try {
        const res = await authFetch('/api/shop/cosmetics');
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.ok) {
            setServerOwnedIds(data.ownedIds || []);
            setServerWallet(data.wallet || null);
            setUserStats(data.userStats || null);
          }
        }
      } catch (err) {
        // Fallback dùng petData local
      }
    }
    loadCosmetics();
    return () => { cancelled = true; };
  }, []);

  const ownedPets = useMemo(() => Object.values(petData.collection || {}), [petData.collection]);
  const currentPetId = selectedPetId && petData.collection[selectedPetId]
    ? selectedPetId
    : petData.activePetId || ownedPets[0]?.instanceId;
  const currentPet = petData.collection[currentPetId] || ownedPets[0];
  const species = currentPet ? PET_REGISTRY[currentPet.speciesId] : null;

  // Tập hợp danh sách ID đã sở hữu (kết hợp server + petData.ownedItems)
  const ownedSet = useMemo(() => {
    const s = new Set(serverOwnedIds || []);
    if (Array.isArray(petData.ownedItems)) {
      for (const id of petData.ownedItems) s.add(id);
    }
    return s;
  }, [serverOwnedIds, petData.ownedItems]);

  // Danh sách thô theo danh mục
  const rawList = subCategory === 'room' ? BACKGROUND_ITEMS : EFFECT_ITEMS;

  // Lọc theo phẩm chất & hệ
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      if (rarityFilter !== 'all' && item.rarity !== rarityFilter) return false;
      if (subCategory === 'room' && elementFilter !== 'all') {
        if (item.element !== elementFilter) return false;
      }
      return true;
    });
  }, [rawList, rarityFilter, elementFilter, subCategory]);

  // Kiểm tra xem món đồ có đủ điều kiện hưởng combo không (sở hữu món khác cùng theme)
  const checkHasCombo = (item) => {
    if (!item.theme) return false;
    return Array.from(ownedSet).some((id) => {
      const other = COSMETIC_MAP[id];
      return other && other.id !== item.id && other.theme === item.theme;
    });
  };

  // Mở sheet mua
  const handleOpenBuy = (item, e) => {
    e?.stopPropagation();
    setBuyingItem(item);
  };

  // Xác nhận mua
  const handleConfirmBuy = async (itemId, isCombo, equipNow) => {
    setLoadingBuy(true);
    try {
      const res = await authFetch('/api/shop/buy-cosmetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cosmeticId: itemId,
          combo: isCombo,
          petId: equipNow && currentPet ? currentPet.instanceId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Lỗi khi mua vật phẩm.', 'error');
        return;
      }

      play?.('celebrate');
      showToast(`Mua thành công ${data.cosmetic?.name || 'món đồ'}!`, 'success');

      // Cập nhật serverOwnedIds
      setServerOwnedIds(data.ownedIds || [...Array.from(ownedSet), itemId]);

      // Bắn sự kiện cập nhật ví trên HUD
      if (data.wallet) {
        setServerWallet(data.wallet);
        window.dispatchEvent(new CustomEvent('wallet-updated', { detail: data.wallet }));
      }

      // Trang bị ngay nếu người dùng chọn
      if (equipNow && currentPet) {
        const item = COSMETIC_MAP[itemId];
        if (item) {
          equipItem(currentPet.instanceId, item.category, itemId);
        }
      }

      setBuyingItem(null);
    } catch (err) {
      showToast('Lỗi kết nối khi mua vật phẩm.', 'error');
    } finally {
      setLoadingBuy(false);
    }
  };

  return (
    <div className="cosmetics-tab-container">
      {/* 1. Khung xem trước Pet với Nền & Hào quang */}
      {currentPet && species && (
        <div
          className="card shadow-sm mb-3 border-0 overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: previewItem ? '2px dashed #4caf50' : '1px solid #eef0f2',
          }}
        >
          <div className="card-body p-3">
            {/* Bộ chọn pet nếu sở hữu nhiều hơn 1 pet */}
            {ownedPets.length > 1 && (
              <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                <span className="small text-muted fw-semibold">Xem thử trên thú cưng:</span>
                <div className="d-flex align-items-center gap-1 flex-wrap">
                  {ownedPets.map((p) => {
                    const sp = PET_REGISTRY[p.speciesId];
                    const evo = getEvolutionInfo(p.speciesId, p.evolution);
                    const isSelected = p.instanceId === currentPet.instanceId;
                    return (
                      <button
                        key={p.instanceId}
                        type="button"
                        className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-2 py-1 ${
                          isSelected ? 'btn-cowdi-primary shadow-sm' : 'btn-light border text-muted'
                        }`}
                        style={{ fontSize: '12px' }}
                        onClick={() => onSelectPetId && onSelectPetId(p.instanceId)}
                        title={`${p.customName || sp?.name} (${evo?.name})`}
                      >
                        {evo?.image ? (
                          <img src={evo.image} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                        ) : (
                          <span>{evo?.emoji || sp?.emoji}</span>
                        )}
                        <span>{p.customName || sp?.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Khung PetPreview dùng chung */}
            <PetPreview
              pet={currentPet}
              previewItem={previewItem}
              previewType={subCategory}
            />

            {/* Dòng chữ trạng thái xem thử */}
            <div className="small text-muted mt-2 text-center">
              {previewItem ? (
                <span>
                  Đang xem thử: <strong>{previewItem.emoji} {previewItem.name}</strong> ·{' '}
                  <button
                    type="button"
                    className="btn btn-xs btn-link p-0 text-decoration-none text-danger fw-semibold"
                    onClick={() => setPreviewItem(null)}
                  >
                    Bỏ xem thử
                  </button>
                </span>
              ) : (
                <span>{currentPet.customName || species.name} — Bấm vào một món bên dưới để xem thử lên pet</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Chip chuyển Nền / Hào quang */}
      <div className="d-flex justify-content-center gap-2 mb-3">
        {COSMETIC_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-bold ${
              subCategory === cat.id ? 'btn-cowdi-primary shadow-sm' : 'btn-light border text-muted'
            }`}
            onClick={() => { setSubCategory(cat.id); setPreviewItem(null); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Bộ lọc phẩm chất */}
      <div className="d-flex gap-1 mb-2 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
        {RARITY_FILTERS.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`btn btn-xs rounded-pill px-2 py-1 small ${
              rarityFilter === r.id ? 'btn-secondary text-white' : 'btn-light border text-muted'
            }`}
            style={{ fontSize: '12px' }}
            onClick={() => setRarityFilter(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* 3b. Bộ lọc hệ nếu đang ở danh mục Nền */}
      {subCategory === 'room' && (
        <div className="d-flex gap-1 mb-3 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
          {ELEMENT_FILTERS.map((elem) => (
            <button
              key={elem.id}
              type="button"
              className={`btn btn-xs rounded-pill px-2 py-1 small ${
                elementFilter === elem.id ? 'btn-dark text-white' : 'btn-light border text-muted'
              }`}
              style={{ fontSize: '11px' }}
              onClick={() => setElementFilter(elem.id)}
            >
              {elem.label}
            </button>
          ))}
        </div>
      )}

      {/* 4. Banner ưu đãi combo 20% */}
      <div
        className="alert py-2 px-3 small d-flex align-items-center justify-content-between mb-3 rounded-3"
        style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0369A1' }}
      >
        <div>
          ✨ <strong>Kinh tế v2:</strong> Mua Nền &amp; Hào quang cùng chủ đề được <strong>giảm ngay 20%</strong>!
        </div>
        <span className="badge bg-primary text-white">Đang mở bán</span>
      </div>

      {/* 5. Lưới danh mục đồ trang trí */}
      <div className="row g-2">
        {filteredList.map((item) => {
          const isSelected = previewItem?.id === item.id;
          const isOwned = ownedSet.has(item.id);
          const rStyle = COSMETIC_RARITIES[item.rarity] || COSMETIC_RARITIES.common;
          const hasCombo = checkHasCombo(item);
          const isGem = item.priceGem > 0;
          const priceCalc = getCosmeticPrice(item, hasCombo);
          const finalPrice = isGem ? priceCalc.gem : priceCalc.milk;
          const originalPrice = isGem ? item.priceGem : item.priceMilk;
          const isMilestone = item.rarity === 'achievement';
          const isMilestoneUnlocked = isMilestone && (isOwned || checkCosmeticUnlocked(item, userStats || {}));

          return (
            <div key={item.id} className="col-6 col-md-4 col-lg-3">
              <div
                className={`card h-100 p-2 text-center shadow-sm cursor-pointer border ${
                  isSelected ? 'border-success border-2 shadow' : ''
                }`}
                style={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#F4FBF5' : '#FFFFFF',
                  borderRadius: '12px',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setPreviewItem(isSelected ? null : item)}
                title="Bấm để xem thử lên thú cưng"
              >
                {/* Emoji / Biểu tượng món đồ */}
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center mx-auto my-1 shadow-xs"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: item.bgStyle || '#F8F9FA',
                    border: '1px solid #ECEFF1',
                  }}
                >
                  <Emoji e={item.emoji} size={38} />
                </div>

                {/* Tên món đồ */}
                <div className="shop-grid-title mt-1 mb-1 text-truncate" title={item.name}>
                  {item.name}
                </div>

                {/* Phẩm chất & Hệ */}
                <div className="d-flex justify-content-center gap-1 mb-1 flex-wrap">
                  <span
                    className="badge rounded-pill"
                    style={{ backgroundColor: rStyle.bg, color: rStyle.color, fontSize: '10px' }}
                  >
                    {rStyle.label}
                  </span>
                  {hasCombo && !isOwned && !isMilestone && (
                    <span className="badge bg-danger rounded-pill" style={{ fontSize: '10px' }}>
                      -20%
                    </span>
                  )}
                </div>

                {/* Ghi chú hoặc điều kiện */}
                <div className="shop-grid-sub mb-2 text-truncate" style={{ fontSize: '11px' }} title={item.note || item.description}>
                  {item.note || item.description}
                </div>

                {/* Phần chân card: Giá tiền & Nút Mua/Đã có */}
                <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
                  {isOwned ? (
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill w-100 py-1 fw-bold">
                      ✓ Đã có
                    </span>
                  ) : isMilestone ? (
                    isMilestoneUnlocked ? (
                      <span className="badge bg-primary-subtle text-primary border rounded-pill w-100 py-1 fw-bold">
                        🟢 Đã mở mốc
                      </span>
                    ) : (
                      <span className="badge bg-light text-muted border rounded-pill w-100 py-1">
                        🔒 Đạt mốc học
                      </span>
                    )
                  ) : item.rarity === 'season' ? (
                    <span className="badge bg-warning-subtle text-dark border rounded-pill w-100 py-1">
                      Thẻ Mùa
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-cowdi-primary w-100 py-1 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-1 shadow-xs"
                      style={{ fontSize: '12px' }}
                      onClick={(e) => handleOpenBuy(item, e)}
                    >
                      {hasCombo && (
                        <span className="text-decoration-line-through opacity-75" style={{ fontSize: '10px' }}>
                          {originalPrice}
                        </span>
                      )}
                      <span>
                        {finalPrice.toLocaleString('vi-VN')} {isGem ? '💎' : '🥛'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Sheet Mua đồ trang trí */}
      <CosmeticBuySheet
        open={Boolean(buyingItem)}
        item={buyingItem}
        wallet={serverWallet || { milk: 0, gem: 0 }}
        hasSameTheme={buyingItem ? checkHasCombo(buyingItem) : false}
        onConfirm={handleConfirmBuy}
        onClose={() => setBuyingItem(null)}
        loading={loadingBuy}
      />
    </div>
  );
}
