import { useState, useMemo } from 'react';
import { usePet } from '../../hooks/usePet';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { PET_REGISTRY, SHOP_ITEMS } from '../../data/pets';
import Emoji from '../../components/Emoji';

const INVENTORY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'hat', label: '🎩 Mũ' },
  { id: 'outfit', label: '👔 Trang phục' },
  { id: 'room', label: '🏠 Nền/Phòng' },
  { id: 'effect', label: '✨ Hào quang' },
];

export default function InventoryTab() {
  const { petData, equipItem } = usePet();
  const showToast = useToast();
  const { play } = useSound();
  const [filterType, setFilterType] = useState('all');

  const activePet = petData.collection[petData.activePetId];
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;

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
    if (!petData.activePetId) return;
    const slot = item.category;
    const isEquipped = activePet?.cosmetics?.[slot] === item.id;

    if (isEquipped) {
      equipItem(petData.activePetId, slot, null);
      play('equip');
      showToast(`Đã tháo ${item.name}`, 'info');
    } else {
      equipItem(petData.activePetId, slot, item.id);
      play('equip');
      showToast(`Đã trang bị ${item.name}! ${item.emoji}`, 'success');
    }
  };

  return (
    <div className="inventory-tab-container">
      {/* 1. Khung xem trước Pet với đồ đang trang bị */}
      {activePet && species && (
        <div className="card shadow-sm mb-3 text-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="card-body py-3">
            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              {activePet.cosmetics?.hat && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.hat)?.emoji} size={24} /></span>
              )}
              <span className="fs-1 emoji-big"><Emoji e={species.emoji} size={48} /></span>
              {activePet.cosmetics?.outfit && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.outfit)?.emoji} size={24} /></span>
              )}
              {activePet.cosmetics?.effect && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.effect)?.emoji} size={24} /></span>
              )}
            </div>
            <div className="small text-muted mt-1">{activePet.customName} — Trang bị hiện tại</div>
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
            const isEquipped = activePet?.cosmetics?.[item.category] === item.id;

            return (
              <div key={item.id} className="col-6 col-md-4 col-lg-3">
                <div
                  className={`card h-100 shadow-sm text-center p-2 ${isEquipped ? 'border-success border-2' : 'border'}`}
                  style={{ backgroundColor: isEquipped ? '#f4fbf5' : '#fff' }}
                >
                  <div className="fs-2 my-2"><Emoji e={item.emoji} size={36} /></div>
                  <div className="fw-bold small text-truncate mb-1">{item.name}</div>
                  <div className="small text-muted mb-2 text-capitalize" style={{ fontSize: '11px' }}>
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
