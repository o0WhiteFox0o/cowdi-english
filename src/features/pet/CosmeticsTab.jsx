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
import CosmeticBuySheet from './CosmeticBuySheet';
import CosmeticFilterSheet from './CosmeticFilterSheet';
import PetDressingModal from './PetDressingModal';
import CosmeticMilestoneModal from './CosmeticMilestoneModal';

const COSMETIC_CATEGORIES = [
  { id: 'room', label: `🖼️ Nền (${BACKGROUND_ITEMS.length})` },
  { id: 'effect', label: `✨ Hào quang (${EFFECT_ITEMS.length})` },
];

const PAGE_SIZE = 12; // 12 món mỗi trang (3 hàng x 4 cột desktop)

export default function CosmeticsTab({ selectedPetId, onSelectPetId }) {
  const { authFetch } = useAuth();
  const { petData, equipItem } = usePet();
  const showToast = useToast();
  const { play } = useSound();

  const [subCategory, setSubCategory] = useState('room');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [elementFilter, setElementFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);
  const [page, setPage] = useState(1);

  // Modal / Sheet states
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [dressingModalOpen, setDressingModalOpen] = useState(false);
  const [milestoneModalItem, setMilestoneModalItem] = useState(null);

  // Dữ liệu từ server
  const [serverOwnedIds, setServerOwnedIds] = useState(null);
  const [serverWallet, setServerWallet] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [buyingItem, setBuyingItem] = useState(null);
  const [loadingBuy, setLoadingBuy] = useState(false);

  // Reset trang về 1 khi đổi danh mục hoặc bộ lọc
  useEffect(() => {
    setPage(1);
  }, [subCategory, rarityFilter, elementFilter]);

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
  const currentEvo = currentPet ? getEvolutionInfo(currentPet.speciesId, currentPet.evolution) : null;

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

  const activeFilterCount = (rarityFilter !== 'all' ? 1 : 0) + (subCategory === 'room' && elementFilter !== 'all' ? 1 : 0);

  // Phân trang
  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, page]);

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

  // Mở modal mốc học
  const handleOpenMilestone = (item, e) => {
    e?.stopPropagation();
    setMilestoneModalItem(item);
  };

  // Trang bị đồ mốc học
  const handleEquipMilestone = async (item) => {
    if (!currentPet) return;
    try {
      const res = await authFetch('/api/shop/equip-cosmetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: currentPet.instanceId,
          slot: item.category,
          cosmeticId: item.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Chưa thể trang bị vật phẩm này.', 'error');
        return;
      }
      equipItem(currentPet.instanceId, item.category, item.id);
      play?.('pop');
      showToast(`Đã trang bị ${item.name} cho thú cưng!`, 'success');
    } catch {
      showToast('Lỗi khi trang bị vật phẩm.', 'error');
    }
  };

  // Xem thử món đồ (mở modal phòng thử đồ)
  const handleItemPreview = (item) => {
    setPreviewItem(item);
    setDressingModalOpen(true);
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
      {/* 1. Thanh Phòng thử đồ thú cưng gọn gàng (cao ~42px, không chiếm nửa trang) */}
      {currentPet && (
        <div className="shop-dressing-bar mb-3">
          <div className="d-flex align-items-center gap-2 min-w-0">
            <span className="shop-dressing-avatar">
              {currentEvo?.image ? (
                <img src={currentEvo.image} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              ) : (
                <span>{currentEvo?.emoji || species?.emoji || '🐮'}</span>
              )}
            </span>
            <div className="text-truncate" style={{ fontSize: '1rem', lineHeight: 1.2 }}>
              <span className="fw-bold text-dark">{currentPet.customName || species?.name}</span>
              {previewItem && (
                <span className="badge bg-success-subtle text-success border ms-2 py-1 px-2" style={{ fontSize: '12px' }}>
                  Đang ướm: {previewItem.name}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-cowdi rounded-pill px-3 d-flex align-items-center gap-2 flex-shrink-0 fw-bold"
            style={{ fontSize: '0.95rem', height: '36px', lineHeight: 1 }}
            onClick={() => setDressingModalOpen(true)}
          >
            <span style={{ fontSize: '1.1rem' }}>👗</span> Phòng thử đồ
          </button>
        </div>
      )}

      {/* 2. Thanh Danh mục (Nền / Hào quang) + Nút Lọc — ĐỒNG BỘ 100% CỠ CHỮ & CHIỀU CAO */}
      <div className="shop-toolbar">
        <div className="d-flex gap-2">
          {COSMETIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`shop-toolbar-pill ${subCategory === cat.id ? 'on' : ''}`}
              onClick={() => setSubCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className={`shop-toolbar-filter ${activeFilterCount > 0 ? 'active' : ''}`}
            onClick={() => setFilterSheetOpen(true)}
          >
            <span>🔍</span> Lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <span
            className="shop-toolbar-badge d-none d-sm-inline-flex"
            title="Mua combo Nền + Hào quang cùng chủ đề giảm 20%"
          >
            ✨ Combo -20%
          </span>
        </div>
      </div>

      {/* 3. Chip bộ lọc đang hoạt động (nếu có, có thể gỡ nhanh 1 chạm) */}
      {activeFilterCount > 0 && (
        <div className="d-flex align-items-center gap-1 mb-2 flex-wrap" style={{ fontSize: '12px' }}>
          <span className="text-muted small">Đang lọc:</span>
          {rarityFilter !== 'all' && (
            <span
              className="badge bg-secondary-subtle text-dark border rounded-pill d-flex align-items-center gap-1 cursor-pointer px-2 py-1"
              onClick={() => setRarityFilter('all')}
              style={{ cursor: 'pointer' }}
            >
              {rarityFilter} ✕
            </span>
          )}
          {subCategory === 'room' && elementFilter !== 'all' && (
            <span
              className="badge bg-secondary-subtle text-dark border rounded-pill d-flex align-items-center gap-1 cursor-pointer px-2 py-1"
              onClick={() => setElementFilter('all')}
              style={{ cursor: 'pointer' }}
            >
              Hệ {elementFilter} ✕
            </span>
          )}
          <button
            type="button"
            className="btn btn-xs btn-link p-0 text-muted ms-1 text-decoration-none"
            onClick={() => { setRarityFilter('all'); setElementFilter('all'); }}
          >
            Xoá hết
          </button>
        </div>
      )}

      {/* 4. Lưới sản phẩm dạng Compact có phân trang (3 cột mobile, 4 cột desktop) */}
      <div className="row g-2 mb-2">
        {paginatedList.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted small">
            Không tìm thấy vật phẩm phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          paginatedList.map((item) => {
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
              <div key={item.id} className="col-4 col-md-3">
                <div
                  className={`card h-100 p-2 text-center shadow-xs border shop-compact-card ${
                    isSelected ? 'border-success border-2' : ''
                  }`}
                  onClick={() => handleItemPreview(item)}
                  title="Bấm để thử lên thú cưng"
                  style={{ cursor: 'pointer', borderRadius: '12px' }}
                >
                  {/* Badge phẩm chất trên góc trái (RÕ RÀNG, CHỮ TO ĐẦY ĐỦ) */}
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className="badge rounded-pill px-2 py-1"
                      style={{ backgroundColor: rStyle.bg, color: rStyle.color, fontSize: '12px', fontWeight: 700 }}
                    >
                      {rStyle.label}
                    </span>
                    {hasCombo && !isOwned && !isMilestone && (
                      <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '11px', fontWeight: 700 }}>
                        -20%
                      </span>
                    )}
                  </div>

                  {/* Icon vật phẩm to rõ hơn */}
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mx-auto my-1"
                    style={{
                      width: '54px',
                      height: '54px',
                      backgroundColor: item.bgStyle || '#F8F9FA',
                      border: '1px solid #ECEFF1',
                    }}
                  >
                    <Emoji e={item.emoji} size={34} />
                  </div>

                  {/* Tên vật phẩm (CỠ CHỮ TO ĐẸP RÕ RÀNG) */}
                  <div className="shop-compact-title text-truncate" title={item.name}>
                    {item.name}
                  </div>

                  {/* Nút hành động / Giá tiền (SỐ TO, DỄ ĐỌC, ĐỒNG BỘ 100% CHIỀU CAO 36px) */}
                  <div className="mt-auto pt-1">
                    {isOwned ? (
                      <span
                        className="badge bg-success-subtle text-success border border-success-subtle rounded-pill w-100 py-1 shop-compact-btn d-flex align-items-center justify-content-center"
                        style={{ fontSize: '13px', fontWeight: 700, minHeight: '36px' }}
                      >
                        ✓ Đã có
                      </span>
                    ) : isMilestone ? (
                      <button
                        type="button"
                        className={`btn w-100 py-1 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-1 shadow-xs shop-compact-btn ${
                          isMilestoneUnlocked ? 'btn-success text-white' : 'btn-light border text-dark'
                        }`}
                        style={{ minHeight: '36px', fontSize: '0.88rem' }}
                        onClick={(e) => handleOpenMilestone(item, e)}
                        title="Bấm để xem chi tiết điều kiện mở khoá & tiến độ"
                      >
                        {isMilestoneUnlocked ? (
                          <span>🟢 Mặc ngay</span>
                        ) : (
                          <span className="text-truncate">🔒 {item.note || 'Mốc học'}</span>
                        )}
                      </button>
                    ) : item.rarity === 'season' ? (
                      <button
                        type="button"
                        className="btn btn-warning-subtle text-dark border border-warning w-100 py-1 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-1 shop-compact-btn"
                        style={{ minHeight: '36px', fontSize: '0.88rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast('Vật phẩm thuộc Thẻ Mùa (Season Pass)!', 'info');
                        }}
                        title="Vật phẩm nhận qua Thẻ Mùa"
                      >
                        🎫 Thẻ Mùa
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-cowdi-primary w-100 py-1 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-1 shadow-xs shop-compact-btn"
                        onClick={(e) => handleOpenBuy(item, e)}
                        title="Bấm để mua"
                      >
                        {hasCombo && (
                          <span className="text-decoration-line-through opacity-75 me-1" style={{ fontSize: '12px' }}>
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
          })
        )}
      </div>

      {/* 5. Phân trang Cửa hàng đẹp mắt chuẩn Sổ tay Cowdi */}
      {totalPages > 1 && (
        <div className="shop-pagination-wrap">
          <div className="shop-pagination">
            <button
              type="button"
              className="shop-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Trang trước"
              title="Trang trước"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                className={`shop-page-btn ${page === pNum ? 'active' : ''}`}
                onClick={() => setPage(pNum)}
              >
                {pNum}
              </button>
            ))}
            <button
              type="button"
              className="shop-page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Trang sau"
              title="Trang sau"
            >
              ›
            </button>
          </div>
          <span className="shop-page-hint">
            Trang {page} / {totalPages} · {filteredList.length} vật phẩm
          </span>
        </div>
      )}

      {/* 6. Popup Bộ lọc Phẩm chất & Hệ */}
      <CosmeticFilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        subCategory={subCategory}
        rarityFilter={rarityFilter}
        onSelectRarity={setRarityFilter}
        elementFilter={elementFilter}
        onSelectElement={setElementFilter}
        onReset={() => { setRarityFilter('all'); setElementFilter('all'); }}
      />

      {/* 7. Modal Phòng thử đồ thú cưng */}
      <PetDressingModal
        open={dressingModalOpen}
        onClose={() => setDressingModalOpen(false)}
        currentPet={currentPet}
        species={species}
        ownedPets={ownedPets}
        onSelectPetId={onSelectPetId}
        previewItem={previewItem}
        previewType={subCategory}
        onClearPreview={() => setPreviewItem(null)}
      />

      {/* 8. Bottom Sheet: Mua vật phẩm */}
      <CosmeticBuySheet
        open={Boolean(buyingItem)}
        item={buyingItem}
        wallet={serverWallet || { milk: 0, gem: 0 }}
        hasSameTheme={buyingItem ? checkHasCombo(buyingItem) : false}
        onConfirm={handleConfirmBuy}
        onClose={() => setBuyingItem(null)}
        loading={loadingBuy}
      />

      {/* 9. Modal Chi tiết Mốc học tập */}
      <CosmeticMilestoneModal
        open={Boolean(milestoneModalItem)}
        item={milestoneModalItem}
        userStats={userStats || {}}
        currentPet={currentPet}
        onClose={() => setMilestoneModalItem(null)}
        onEquip={handleEquipMilestone}
      />
    </div>
  );
}
