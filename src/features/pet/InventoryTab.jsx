import { useState, useMemo, useEffect } from 'react';
import { usePet } from '../../hooks/usePet';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { PET_REGISTRY, SHOP_ITEMS, getEvolutionInfo } from '../../data/pets';
import { ALL_COSMETIC_ITEMS, COSMETIC_MAP, COSMETIC_RARITIES } from '../../../shared/cosmetics-data.js';
import Emoji from '../../components/Emoji';
import Icon from '../../components/Icon';
import PetDressingModal from './PetDressingModal';

const INVENTORY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'room', label: 'Nền', icon: 'tab_background' },
  { id: 'effect', label: 'Hào quang', icon: 'rarity_epic' },
  { id: 'hat', label: 'Mũ', emoji: '🎩' },
  { id: 'outfit', label: 'Áo', emoji: '👔' },
];

const PAGE_SIZE = 12; // 12 món mỗi trang (3 hàng x 4 cột desktop)

export default function InventoryTab({ selectedPetId, onSelectPetId }) {
  const { petData, equipItem, setPetData } = usePet();
  const { authFetch } = useAuth();
  const showToast = useToast();
  const { play } = useSound();
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [dressingModalOpen, setDressingModalOpen] = useState(false);
  const [serverOwnedIds, setServerOwnedIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadOwned() {
      try {
        const res = await authFetch('/api/shop/cosmetics');
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.ownedIds)) {
            setServerOwnedIds(data.ownedIds);
          }
        }
      } catch {
        // Fallback dùng petData local
      }
    }
    loadOwned();
    return () => { cancelled = true; };
  }, [authFetch]);

  useEffect(() => {
    setPage(1);
  }, [filterType]);

  const ownedPets = useMemo(
    () => Object.entries(petData.collection || {}).map(([id, p]) => ({ instanceId: p.instanceId || id, ...p })),
    [petData.collection]
  );
  const currentPetId = selectedPetId && petData.collection[selectedPetId]
    ? selectedPetId
    : petData.activePetId || ownedPets[0]?.instanceId || 'cowdi_1';
  const currentPet = petData.collection[currentPetId]
    ? { instanceId: currentPetId, ...petData.collection[currentPetId] }
    : ownedPets[0];
  const species = currentPet ? PET_REGISTRY[currentPet.speciesId] : null;
  const currentEvo = currentPet ? getEvolutionInfo(currentPet.speciesId, currentPet.evolution) : null;

  // Hợp nhất danh mục từ shared/cosmetics-data và SHOP_ITEMS
  const combinedCatalog = useMemo(() => {
    const list = [...ALL_COSMETIC_ITEMS];
    for (const itm of SHOP_ITEMS) {
      if (!COSMETIC_MAP[itm.id]) {
        list.push(itm);
      }
    }
    return list;
  }, []);

  // Lấy danh sách đồ đã sở hữu (hợp nhất server owned_cosmetics + petData.ownedItems + đang mặc)
  const ownedItems = useMemo(() => {
    const ownedIds = new Set([...(serverOwnedIds || []), ...(petData.ownedItems || [])]);
    // Cũng bao gồm đồ đang được trang bị trên pet
    if (currentPet?.cosmetics) {
      for (const id of Object.values(currentPet.cosmetics)) {
        if (id) ownedIds.add(id);
      }
    }

    return combinedCatalog.filter(
      (item) => ownedIds.has(item.id) && item.category !== 'food'
    );
  }, [combinedCatalog, serverOwnedIds, petData.ownedItems, currentPet?.cosmetics]);

  const filteredItems = useMemo(() => {
    if (filterType === 'all') return ownedItems;
    return ownedItems.filter((i) => i.category === filterType);
  }, [ownedItems, filterType]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const handleEquip = async (item) => {
    const targetPetId = currentPet?.instanceId || currentPetId || petData.activePetId || 'cowdi_1';
    if (!targetPetId) return;
    const slot = item.category;
    const isEquipped = currentPet?.cosmetics?.[slot] === item.id;
    const newId = isEquipped ? null : item.id;

    equipItem(targetPetId, slot, newId);
    play('equip');

    // Đồng bộ lên server
    try {
      const res = await authFetch('/api/shop/equip-cosmetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: targetPetId,
          petInstanceId: targetPetId,
          slot,
          cosmeticId: newId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Chưa thể trang bị vật phẩm.', 'error');
        return;
      }
      if (data.petData && typeof setPetData === 'function') {
        setPetData(data.petData);
      }
      showToast(
        isEquipped ? `Đã tháo ${item.name}` : `Đã trang bị ${item.name}! ${item.emoji}`,
        isEquipped ? 'info' : 'success'
      );
    } catch (err) {
      console.warn('Lỗi đồng bộ trang bị server:', err);
      showToast('Lỗi khi đồng bộ trang bị lên server.', 'error');
    }
  };

  return (
    <div className="inventory-tab-container">
      {/* 1. Thanh Phòng thử đồ thú cưng gọn gàng (cao ~42px, thay thế card 300px) */}
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
              <span className="text-muted ms-2 small">({ownedItems.length} món đã có)</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-cowdi rounded-pill px-3 d-flex align-items-center gap-2 flex-shrink-0 fw-bold"
            style={{ fontSize: '0.95rem', height: '36px', lineHeight: 1 }}
            onClick={() => setDressingModalOpen(true)}
          >
            <span style={{ fontSize: '1.1rem' }}>👗</span> Xem thử lên pet
          </button>
        </div>
      )}

      {/* 2. Chip lọc loại đồ trong kho (đồng bộ font chữ chuẩn website) */}
      <div className="d-flex gap-2 mb-3 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
        {INVENTORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`shop-toolbar-pill d-inline-flex align-items-center ${filterType === cat.id ? 'on' : ''}`}
            onClick={() => setFilterType(cat.id)}
          >
            {cat.icon && <Icon name={cat.icon} size={16} className="me-1" />}
            {cat.emoji && <Emoji e={cat.emoji} size={16} className="me-1" />}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Lưới các món sở hữu dạng Compact RPG túi đồ (3 cột mobile, 4 cột desktop) */}
      {filteredItems.length === 0 ? (
        <div className="card border-dashed p-4 text-center text-muted small my-3" style={{ backgroundColor: '#fafbfc', borderRadius: '12px' }}>
          <div className="mb-2"><Icon name="tab_inventory" size={40} /></div>
          <div className="fw-bold">Kho đồ đang trống ở mục này.</div>
          <div className="text-muted mt-1">Hãy ghé tab Trang trí để sắm Nền và Hào quang mới cho thú cưng nhé!</div>
        </div>
      ) : (
        <div className="row g-2 mb-2">
          {paginatedItems.map((item) => {
            const isEquipped = currentPet?.cosmetics?.[item.category] === item.id;
            const rStyle = COSMETIC_RARITIES[item.rarity] || COSMETIC_RARITIES.common;

            return (
              <div key={item.id} className="col-4 col-md-3">
                <div
                  className={`card h-100 p-2 text-center shadow-xs border shop-compact-card ${
                    isEquipped ? 'border-success border-2' : ''
                  }`}
                  style={{
                    backgroundColor: isEquipped ? '#f4fbf5' : '#fff',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleEquip(item)}
                  title={isEquipped ? 'Bấm để tháo ra' : 'Bấm để trang bị'}
                >
                  {/* Trạng thái & phẩm chất góc trên (bên trái là phẩm chất, bên phải là trạng thái) */}
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className="badge rounded-pill px-2 py-1"
                      style={{ backgroundColor: rStyle.bg, color: rStyle.color, fontSize: '12px', fontWeight: 700 }}
                    >
                      {rStyle.label}
                    </span>
                    {isEquipped ? (
                      <span className="badge bg-success rounded-pill px-2 py-1" style={{ fontSize: '11px', fontWeight: 700 }}>
                        ✓ Đang mặc
                      </span>
                    ) : (
                      <span className="badge bg-light text-muted border rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>
                        Trong túi
                      </span>
                    )}
                  </div>

                  {/* Icon to rõ */}
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mx-auto my-1"
                    style={{
                      width: '54px',
                      height: '54px',
                      background: item.bgStyle || '#F8F9FA',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '1px solid #ECEFF1',
                    }}
                  >
                    <Emoji e={item.emoji} size={34} />
                  </div>

                  {/* Tên chữ to rõ ràng */}
                  <div className="shop-compact-title text-truncate" title={item.name}>
                    {item.name}
                  </div>

                  {/* Nút tháo/mặc to rõ ràng */}
                  <div className="mt-auto pt-1">
                    <button
                      type="button"
                      className={`btn w-100 py-1 rounded-pill fw-bold shop-compact-btn ${
                        isEquipped ? 'btn-outline-danger' : 'btn-cowdi-primary shadow-xs'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquip(item);
                      }}
                      title={isEquipped ? 'Bấm để tháo ra' : 'Bấm để trang bị'}
                    >
                      {isEquipped ? '✕ Tháo' : 'Mặc'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Phân trang nếu có nhiều hơn 8 món */}
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
            Trang {page} / {totalPages} · {filteredItems.length} vật phẩm
          </span>
        </div>
      )}

      {/* 5. Modal phòng thử đồ */}
      <PetDressingModal
        open={dressingModalOpen}
        onClose={() => setDressingModalOpen(false)}
        currentPet={currentPet}
        species={species}
        ownedPets={ownedPets}
        onSelectPetId={onSelectPetId}
      />
    </div>
  );
}
