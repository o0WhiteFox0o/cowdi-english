import { useState } from 'react';
import { usePet } from '../../hooks/usePet';
import { PET_REGISTRY, SHOP_ITEMS } from '../../data/pets';
import Emoji from '../../components/Emoji';

const COSMETIC_CATEGORIES = [
  { id: 'room', label: '🖼️ Nền' },
  { id: 'effect', label: '✨ Hào quang' },
];

const RARITY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'common', label: '⚪ Thường' },
  { id: 'rare', label: '🔵 Hiếm' },
  { id: 'epic', label: '🟣 Sử thi' },
  { id: 'legendary', label: '🟡 Huyền thoại' },
  { id: 'milestone', label: '🟢 Mốc học' },
];

export default function CosmeticsTab() {
  const { petData } = usePet();
  const [subCategory, setSubCategory] = useState('room');
  const [rarityFilter, setRarityFilter] = useState('all');

  const activePet = petData.collection[petData.activePetId];
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;

  return (
    <div className="cosmetics-tab-container">
      {/* 1. Khung xem trước Pet với Nền & Hào quang */}
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
            <div className="small text-muted mt-1">{activePet.customName} — Xem trước đồ trang trí</div>
          </div>
        </div>
      )}

      {/* 2. Chip chuyển Nền / Hào quang */}
      <div className="d-flex justify-content-center gap-2 mb-3">
        {COSMETIC_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${subCategory === cat.id ? 'btn-cowdi-primary' : 'btn-light border'}`}
            onClick={() => setSubCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Bộ lọc bậc */}
      <div className="d-flex gap-1 mb-3 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
        {RARITY_FILTERS.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`btn btn-xs rounded-pill px-2 py-1 small ${rarityFilter === r.id ? 'btn-secondary text-white' : 'btn-light border text-muted'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setRarityFilter(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* 4. Trạng thái rỗng thân thiện (sắp có ở GĐ4) + 4 ô placeholder mờ */}
      <div className="card border-dashed p-4 text-center mb-4" style={{ backgroundColor: '#fafbfc' }}>
        <div className="fs-1 mb-2">🎨</div>
        <h6 className="fw-bold mb-1">Sắp có: Nền &amp; Hào quang mới theo Kinh tế v2</h6>
        <p className="text-muted small mb-0" style={{ maxWidth: '420px', margin: '0 auto' }}>
          Hệ thống đồ trang trí theo 10 hệ (Núi lửa, Đáy biển, Rừng trúc...), mốc học tập và hiệu ứng kỹ năng đang được hoàn thiện ở Giai đoạn 4!
        </p>
      </div>

      {/* 4 ô xem trước mờ (Placeholders) */}
      <div className="row g-2 opacity-50">
        {[
          { name: subCategory === 'room' ? '🌲 Rừng xanh' : '🍃 Lá rơi', badge: '⚪ Thường · 800 🥛' },
          { name: subCategory === 'room' ? '🏖️ Bãi biển' : '🫧 Bong bóng', badge: '⚪ Thường · 800 🥛' },
          { name: subCategory === 'room' ? '🚀 Vũ trụ' : '❄️ Tuyết rơi', badge: '🔵 Hiếm · 2 000 🥛' },
          { name: subCategory === 'room' ? '🏰 Lâu đài' : '🌸 Hoa anh đào', badge: '🟣 Sử thi · 40 💎' },
        ].map((item, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div className="card h-100 p-2 text-center border-dashed">
              <div className="fs-3 mb-1">{item.name.split(' ')[0]}</div>
              <div className="small fw-bold text-truncate">{item.name}</div>
              <div className="small text-muted" style={{ fontSize: '11px' }}>{item.badge}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
