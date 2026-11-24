import { useState, useMemo } from 'react';
import { usePet } from '../../hooks/usePet';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { PET_REGISTRY, SHOP_ITEMS, getEvolutionInfo } from '../../data/pets';
import PetPreview from '../../components/pet/PetPreview';

const INVENTORY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'hat', label: '🎩 Mũ' },
  { id: 'outfit', label: '👔 Trang phục' },
  { id: 'room', label: '🏠 Nền/Phòng' },
  { id: 'effect', label: '✨ Hào quang' },
];

export default function InventoryTab({ selectedPetId, onSelectPetId }) {
  const { petData, equipItem } = usePet();
  const showToast = useToast();
  const { play } = useSound();
  const [filterType, setFilterType] = useState('all');

  const ownedPets = useMemo(() => Object.values(petData.collection || {}), [petData.collection]);
  const currentPetId = selectedPetId && petData.collection[selectedPetId]
    ? selectedPetId
    : petData.activePetId || ownedPets[0]?.instanceId;
  const currentPet = petData.collection[currentPetId] || ownedPets[0];
  const species = currentPet ? PET_REGISTRY[currentPet.speciesId] : null;

  // Lấy danh sách đồ đã sở hữu (loại trừ food)
  const ownedItems = useMemo(() => {
    return SHOP_ITEMS.filter(
      (item) => petData.ownedItems?.includes(item.id) && item.category !== 'food'
    );
  }, [petData.ownedItems]);

  const filteredItems = useMemo(() => {
    if (filterType === 'all') return ownedItems;
    return ownedItems.filter((i) => i.category === filterType);
  }, [ownedItems, filterType]);

  const handleEquip = (item) => {
    if (!currentPet) return;
    const slot = item.category;
    const isEquipped = currentPet.cosmetics?.[slot] === item.id;

    if (isEquipped) {
      equipItem(currentPet.instanceId, slot, null);
      play('equip');
      showToast(`Đã tháo ${item.name}`, 'info');
    } else {
      equipItem(currentPet.instanceId, slot, item.id);
      play('equip');
      showToast(`Đã trang bị ${item.name}! ${item.emoji}`, 'success');
    }
  };

  return (
    <div className="inventory-tab-container">
      {/* 1. Khung xem trước Pet với đồ đang trang bị */}
      {currentPet && species && (
        <div className="card shadow-sm mb-3 border-0 overflow-hidden" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #eef0f2' }}>
          <div className="card-body p-3">
            {/* Bộ chọn pet nếu sở hữu nhiều hơn 1 pet */}
            {ownedPets.length > 1 && (
              <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                <span className="small text-muted fw-semibold">Chọn pet trang bị:</span>
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
            <PetPreview pet={currentPet} />

            <div className="small text-muted mt-2 text-center">
              {currentPet.customName || species.name} — Trang bị hiện tại
            </div>
          </div>
        </div>
      )}

      {/* 2. Chip lọc loại đồ trong kho */}
      <div className="d-flex justify-content-center gap-1 mb-3 flex-wrap">
        {INVENTORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${filterType === cat.id ? 'btn-cowdi-primary' : 'btn-light border'}`}
            onClick={() => setFilterType(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Lưới các món sở hữu */}
      {filteredItems.length === 0 ? (
        <div className="card border-dashed p-4 text-center text-muted small my-3" style={{ backgroundColor: '#fafbfc' }}>
          <div className="fs-2 mb-2">🎒</div>
          <div>Kho đồ đang trống ở mục này.</div>
          <div className="text-muted mt-1">Các món đồ mua từ trước vẫn được lưu giữ an toàn tại đây!</div>
        </div>
      ) : (
        <div className="row g-2">
          {filteredItems.map((item) => {
            const isEquipped = currentPet?.cosmetics?.[item.category] === item.id;

            return (
              <div key={item.id} className="col-6 col-md-4 col-lg-3">
                <div
                  className={`card h-100 shadow-sm text-center p-2 ${isEquipped ? 'border-success border-2' : 'border'}`}
                  style={{ backgroundColor: isEquipped ? '#f4fbf5' : '#fff' }}
                >
                  <div className="fs-2 my-2"><Emoji e={item.emoji} size={36} /></div>
                  <div className="shop-grid-title mb-1">{item.name}</div>
                  <div className="shop-grid-sub mb-2 text-capitalize">
                    {item.category === 'room' ? 'Nền' : item.category === 'effect' ? 'Hào quang' : item.category === 'hat' ? 'Mũ' : 'Trang phục'}
                  </div>

                  <button
                    type="button"
                    className={`btn btn-sm w-100 mt-auto ${isEquipped ? 'btn-outline-danger' : 'btn-cowdi-primary'}`}
                    onClick={() => handleEquip(item)}
                  >
                    {isEquipped ? 'Tháo ra' : 'Trang bị'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
