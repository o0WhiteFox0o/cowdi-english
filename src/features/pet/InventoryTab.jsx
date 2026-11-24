import { useState, useMemo } from 'react';
import { usePet } from '../../hooks/usePet';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { PET_REGISTRY, SHOP_ITEMS, getEvolutionInfo } from '../../data/pets';
import { ALL_COSMETIC_ITEMS, COSMETIC_MAP } from '../../../shared/cosmetics-data.js';
import Emoji from '../../components/Emoji';
import PetDressingModal from './PetDressingModal';

const INVENTORY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'room', label: '🖼️ Nền' },
  { id: 'effect', label: '✨ Hào quang' },
  { id: 'hat', label: '🎩 Mũ' },
  { id: 'outfit', label: '👔 Áo' },
];

export default function InventoryTab({ selectedPetId, onSelectPetId }) {
  const { petData, equipItem } = usePet();
  const { authFetch } = useAuth();
  const showToast = useToast();
  const { play } = useSound();
  const [filterType, setFilterType] = useState('all');
  const [dressingModalOpen, setDressingModalOpen] = useState(false);

  const ownedPets = useMemo(() => Object.values(petData.collection || {}), [petData.collection]);
  const currentPetId = selectedPetId && petData.collection[selectedPetId]
    ? selectedPetId
    : petData.activePetId || ownedPets[0]?.instanceId;
  const currentPet = petData.collection[currentPetId] || ownedPets[0];
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

  // Lấy danh sách đồ đã sở hữu (loại trừ food)
  const ownedItems = useMemo(() => {
    const ownedIds = new Set(petData.ownedItems || []);
    // Cũng bao gồm đồ đang được trang bị trên pet
    if (currentPet?.cosmetics) {
      for (const id of Object.values(currentPet.cosmetics)) {
        if (id) ownedIds.add(id);
      }
    }

    return combinedCatalog.filter(
      (item) => ownedIds.has(item.id) && item.category !== 'food'
    );
  }, [combinedCatalog, petData.ownedItems, currentPet?.cosmetics]);

  const filteredItems = useMemo(() => {
    if (filterType === 'all') return ownedItems;
    return ownedItems.filter((i) => i.category === filterType);
  }, [ownedItems, filterType]);

  const handleEquip = async (item) => {
    if (!currentPet) return;
    const slot = item.category;
    const isEquipped = currentPet.cosmetics?.[slot] === item.id;
    const newId = isEquipped ? null : item.id;

    equipItem(currentPet.instanceId, slot, newId);
    play('equip');
    showToast(
      isEquipped ? `Đã tháo ${item.name}` : `Đã trang bị ${item.name}! ${item.emoji}`,
      isEquipped ? 'info' : 'success'
    );

    // Đồng bộ lên server
    try {
      await authFetch('/api/shop/equip-cosmetic', {
        method: 'POST',
        body: JSON.stringify({
          petInstanceId: currentPet.instanceId,
          slot,
          cosmeticId: newId,
        }),
      });
    } catch (err) {
      console.warn('Lỗi đồng bộ trang bị server:', err);
    }
  };

  return (
    <div className="inventory-tab-container">
      {/* 1. Thanh Phòng thử đồ thú cưng gọn gàng (cao ~44px, thay thế card 300px) */}
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
            <div className="text-truncate" style={{ fontSize: '0.92rem', lineHeight: 1.2 }}>
              <span className="fw-bold text-dark">{currentPet.customName || species?.name}</span>
              <span className="text-muted ms-2 small">({ownedItems.length} món đã có)</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-cowdi rounded-pill px-3 py-1 d-flex align-items-center gap-1 flex-shrink-0"
            style={{ fontSize: '12px' }}
            onClick={() => setDressingModalOpen(true)}
          >
            <span>👗</span> Xem thử lên pet
          </button>
        </div>
      )}

      {/* 2. Chip lọc loại đồ trong kho (ngang gọn gàng) */}
      <div className="d-flex gap-1 mb-3 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
        {INVENTORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
              filterType === cat.id ? 'btn-cowdi-primary shadow-xs' : 'btn-light border text-muted'
            }`}
            style={{ fontSize: '12px' }}
            onClick={() => setFilterType(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Lưới các món sở hữu dạng Compact RPG túi đồ (3 cột mobile, 4 cột desktop) */}
      {filteredItems.length === 0 ? (
        <div className="card border-dashed p-4 text-center text-muted small my-3" style={{ backgroundColor: '#fafbfc', borderRadius: '12px' }}>
          <div className="fs-2 mb-2">🎒</div>
          <div className="fw-bold">Kho đồ đang trống ở mục này.</div>
          <div className="text-muted mt-1">Hãy ghé tab Trang trí để sắm Nền và Hào quang mới cho thú cưng nhé!</div>
        </div>
      ) : (
        <div className="row g-2 mb-3">
          {filteredItems.map((item) => {
            const isEquipped = currentPet?.cosmetics?.[item.category] === item.id;

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
                  {/* Trạng thái trang bị góc trên */}
                  <div className="d-flex justify-content-end mb-1">
                    {isEquipped ? (
                      <span className="badge bg-success rounded-pill px-2 py-0" style={{ fontSize: '9px' }}>
                        ✓ Đang mặc
                      </span>
                    ) : (
                      <span className="badge bg-light text-muted border rounded-pill px-1 py-0" style={{ fontSize: '9px' }}>
                        Trong túi
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mx-auto my-1"
                    style={{
                      width: '46px',
                      height: '46px',
                      backgroundColor: item.bgStyle || '#F8F9FA',
                      border: '1px solid #ECEFF1',
                    }}
                  >
                    <Emoji e={item.emoji} size={28} />
                  </div>

                  {/* Tên */}
                  <div className="shop-compact-title text-truncate" title={item.name}>
                    {item.name}
                  </div>

                  {/* Nút tháo/mặc */}
                  <div className="mt-auto pt-1">
                    <button
                      type="button"
                      className={`btn btn-xs w-100 py-1 rounded-pill fw-bold ${
                        isEquipped ? 'btn-outline-danger' : 'btn-cowdi-primary shadow-xs'
                      }`}
                      style={{ fontSize: '11px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquip(item);
                      }}
                    >
                      {isEquipped ? 'Tháo ra' : 'Trang bị'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal phòng thử đồ */}
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
