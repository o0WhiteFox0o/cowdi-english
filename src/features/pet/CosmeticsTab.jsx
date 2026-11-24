import { useState, useMemo } from 'react';
import { usePet } from '../../hooks/usePet';
import { PET_REGISTRY, SHOP_ITEMS } from '../../data/pets';
import Emoji from '../../components/Emoji';

const COSMETIC_CATEGORIES = [
  { id: 'room', label: '🖼️ Nền (19 món)' },
  { id: 'effect', label: '✨ Hào quang (15 món)' },
];

const RARITY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'common', label: '⚪ Thường' },
  { id: 'rare', label: '🔵 Hiếm' },
  { id: 'epic', label: '🟣 Sử thi' },
  { id: 'legendary', label: '🟡 Huyền thoại' },
  { id: 'milestone', label: '🟢 Mốc học' },
  { id: 'season', label: '🟠 Mùa' },
];

const PLANNED_BACKGROUNDS = [
  { id: 'bg_forest', name: 'Rừng xanh', emoji: '🌲', rarity: 'common', priceText: '800 🥛', note: 'Thường · Rừng cây mát mẻ', bgStyle: '#e8f5e9' },
  { id: 'bg_beach', name: 'Bãi biển', emoji: '🏖️', rarity: 'common', priceText: '800 🥛', note: 'Thường · Cát vàng biển xanh', bgStyle: '#e1f5fe' },
  { id: 'bg_space', name: 'Vũ trụ', emoji: '🚀', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Bầu trời ngàn sao', bgStyle: '#ede7f6' },
  { id: 'bg_volcano', name: 'Núi lửa', emoji: '🌋', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Hỏa (Pet Hỏa mở)', bgStyle: '#fbe9e7' },
  { id: 'bg_ocean', name: 'Đáy biển', emoji: '🌊', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Thủy (Pet Thủy mở)', bgStyle: '#e0f7fa' },
  { id: 'bg_bamboo', name: 'Rừng trúc', emoji: '🎋', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Mộc (Pet Mộc mở)', bgStyle: '#f1f8e9' },
  { id: 'bg_goldmine', name: 'Mỏ vàng', emoji: '⚙️', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Kim (Pet Kim mở)', bgStyle: '#fff8e1' },
  { id: 'bg_cave', name: 'Hang đá', emoji: '🪨', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Thổ (Pet Thổ mở)', bgStyle: '#efebe9' },
  { id: 'bg_temple', name: 'Đền ánh sáng', emoji: '☀️', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Quang (Pet Quang mở)', bgStyle: '#fffde7' },
  { id: 'bg_nightforest', name: 'Rừng đêm', emoji: '🌑', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Ám (Pet Ám mở)', bgStyle: '#eceff1' },
  { id: 'bg_cloudpeak', name: 'Đỉnh mây', emoji: '🌪️', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Phong (Pet Phong mở)', bgStyle: '#f3e5f5' },
  { id: 'bg_stormcloud', name: 'Mây giông', emoji: '⚡', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Lôi (Pet Lôi mở)', bgStyle: '#fff9c4' },
  { id: 'bg_arena', name: 'Võ đài', emoji: '🥋', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Hệ Vô (Pet Vô mở)', bgStyle: '#f5f5f5' },
  { id: 'bg_castle', name: 'Lâu đài cổ tích', emoji: '🏰', rarity: 'epic', priceText: '40 💎', note: 'Sử thi · Hoàng gia tráng lệ', bgStyle: '#f3e5f5' },
  { id: 'bg_sakura', name: 'Vườn anh đào', emoji: '🌸', rarity: 'epic', priceText: '40 💎', note: 'Sử thi · Cánh hoa rơi lãng mạn', bgStyle: '#fce4ec' },
  { id: 'bg_aurora', name: 'Cực quang Bắc cực', emoji: '🌌', rarity: 'legendary', priceText: '90 💎', note: 'Huyền thoại · Ánh sáng diệu kỳ', bgStyle: '#e0f2f1' },
  { id: 'bg_heaven', name: 'Thiên đình', emoji: '☁️', rarity: 'legendary', priceText: '90 💎', note: 'Huyền thoại · Tiên cảnh mây bồng', bgStyle: '#fffde7' },
  { id: 'bg_study', name: 'Phòng học theo cấp', emoji: '📚', rarity: 'milestone', priceText: 'Mốc học', note: 'Mốc học · Tự mở theo A1 → C2', bgStyle: '#f9fbe7' },
  { id: 'bg_floatingmarket', name: 'Chợ nổi', emoji: '🛶', rarity: 'season', priceText: 'Thẻ mùa', note: 'Mùa · Sông nước miền Tây', bgStyle: '#e0f7fa' },
];

const PLANNED_AURAS = [
  { id: 'aur_leaves', name: 'Lá rơi', emoji: '🍃', rarity: 'common', priceText: '800 🥛', note: 'Thường · Lá bay quanh thân' },
  { id: 'aur_bubbles', name: 'Bong bóng nước', emoji: '🫧', rarity: 'common', priceText: '800 🥛', note: 'Thường · Bong bóng lấp lánh' },
  { id: 'aur_snow', name: 'Tuyết rơi', emoji: '❄️', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Bông tuyết mùa đông' },
  { id: 'aur_stars', name: 'Sao sáng', emoji: '✨', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Ánh sao lấp lánh' },
  { id: 'aur_flame', name: 'Ngọn lửa', emoji: '🔥', rarity: 'rare', priceText: '2 000 🥛', note: 'Hiếm · Lửa nhiệt huyết' },
  { id: 'aur_sakura', name: 'Cánh hoa anh đào', emoji: '🌸', rarity: 'epic', priceText: '40 💎', note: 'Sử thi · Cánh hoa bay lượn' },
  { id: 'aur_firefly', name: 'Đom đóm', emoji: '🪲', rarity: 'epic', priceText: '40 💎', note: 'Sử thi · Đom đóm phát sáng ban đêm' },
  { id: 'aur_dragon', name: 'Rồng vàng', emoji: '🐉', rarity: 'legendary', priceText: '90 💎', note: 'Huyền thoại · Rồng uốn lượn uy nghi' },
  { id: 'aur_galaxy', name: 'Thiên hà xoay', emoji: '🌀', rarity: 'legendary', priceText: '90 💎', note: 'Huyền thoại · Vòng xoáy ngân hà' },
  { id: 'aur_streakfire', name: 'Lửa streak', emoji: '🔥', rarity: 'milestone', priceText: 'Mốc học', note: 'Mốc streak ≥ 7 (đổi màu ở 30/100/365)' },
  { id: 'aur_soundwave', name: 'Sóng âm', emoji: '🎧', rarity: 'milestone', priceText: 'Mốc học', note: 'Mốc học · Kỹ năng Nghe ≥ 600' },
  { id: 'aur_musicnotes', name: 'Nốt nhạc', emoji: '🎵', rarity: 'milestone', priceText: 'Mốc học', note: 'Mốc học · Kỹ năng Nói ≥ 600' },
  { id: 'aur_letters', name: 'Chữ bay', emoji: '🔤', rarity: 'milestone', priceText: 'Mốc học', note: 'Mốc học · Kỹ năng Đọc ≥ 600' },
  { id: 'aur_ink', name: 'Mực vẽ', emoji: '🖋️', rarity: 'milestone', priceText: 'Mốc học', note: 'Mốc học · Kỹ năng Viết ≥ 600' },
  { id: 'aur_almighty', name: 'Toàn năng', emoji: '🌈', rarity: 'milestone', priceText: 'Mốc học', note: 'Mốc học · Cả 4 kỹ năng ≥ 1 800' },
];

const RARITY_BADGE_STYLE = {
  common: { bg: '#e9ecef', color: '#495057', label: '⚪ Thường' },
  rare: { bg: '#cff4fc', color: '#055160', label: '🔵 Hiếm' },
  epic: { bg: '#e2d9f3', color: '#432874', label: '🟣 Sử thi' },
  legendary: { bg: '#fff3cd', color: '#664d03', label: '🟡 Huyền thoại' },
  milestone: { bg: '#d1e7dd', color: '#0f5132', label: '🟢 Mốc học' },
  season: { bg: '#ffe5d0', color: '#8f3d00', label: '🟠 Mùa' },
};

export default function CosmeticsTab() {
  const { petData } = usePet();
  const [subCategory, setSubCategory] = useState('room');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);

  const activePet = petData.collection[petData.activePetId];
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;

  const rawList = subCategory === 'room' ? PLANNED_BACKGROUNDS : PLANNED_AURAS;

  const filteredList = useMemo(() => {
    if (rarityFilter === 'all') return rawList;
    return rawList.filter((item) => item.rarity === rarityFilter);
  }, [rawList, rarityFilter]);

  return (
    <div className="cosmetics-tab-container">
      {/* 1. Khung xem trước Pet với Nền & Hào quang thử nghiệm */}
      {activePet && species && (
        <div
          className="card shadow-sm mb-3 text-center border-0"
          style={{
            backgroundColor: previewItem?.bgStyle || '#f8f9fa',
            transition: 'background-color 0.3s ease',
            borderRadius: '16px',
            border: previewItem ? '2px dashed #4caf50' : 'none',
          }}
        >
          <div className="card-body py-3">
            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap position-relative">
              {/* Preview aura / effect nếu đang xem thử hào quang */}
              {previewItem && subCategory === 'effect' && (
                <span className="fs-3 position-absolute top-0 start-50 translate-middle-x" style={{ zIndex: 2 }}>
                  <Emoji e={previewItem.emoji} size={28} />
                </span>
              )}
              {activePet.cosmetics?.hat && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.hat)?.emoji} size={24} /></span>
              )}
              <span className="fs-1 emoji-big"><Emoji e={species.emoji} size={54} /></span>
              {activePet.cosmetics?.outfit && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.outfit)?.emoji} size={24} /></span>
              )}
              {activePet.cosmetics?.effect && !previewItem && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.effect)?.emoji} size={24} /></span>
              )}
            </div>
            <div className="small text-muted mt-2">
              {previewItem ? (
                <span>
                  Đang xem thử: <strong>{previewItem.emoji} {previewItem.name}</strong> ·{' '}
                  <button
                    type="button"
                    className="btn btn-xs btn-link p-0 text-decoration-none"
                    onClick={() => setPreviewItem(null)}
                  >
                    Bỏ xem thử
                  </button>
                </span>
              ) : (
                <span>{activePet.customName} — Bấm vào một món bên dưới để xem thử lên pet</span>
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
            className={`btn btn-sm rounded-pill px-3 fw-bold ${subCategory === cat.id ? 'btn-cowdi-primary' : 'btn-light border text-muted'}`}
            onClick={() => { setSubCategory(cat.id); setPreviewItem(null); }}
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

      {/* 4. Banner thông báo Giai đoạn 4 */}
      <div className="alert alert-light border py-2 px-3 small d-flex align-items-center justify-content-between mb-3 rounded">
        <div>
          🎨 <strong>Danh mục đồ trang trí dự kiến (GĐ4):</strong> Mua nền &amp; hào quang cùng chủ đề giảm 20%!
        </div>
        <span className="badge bg-secondary text-white">Sắp mở mua</span>
      </div>

      {/* 5. Lưới danh mục đồ trang trí */}
      <div className="row g-2">
        {filteredList.map((item) => {
          const isSelected = previewItem?.id === item.id;
          const rStyle = RARITY_BADGE_STYLE[item.rarity] || RARITY_BADGE_STYLE.common;

          return (
            <div key={item.id} className="col-6 col-md-4 col-lg-3">
              <div
                className={`card h-100 p-2 text-center shadow-sm cursor-pointer border ${isSelected ? 'border-success border-2' : ''}`}
                style={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#f4fbf5' : '#fff',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setPreviewItem(isSelected ? null : item)}
                title="Bấm để xem thử lên pet"
              >
                <div className="fs-2 my-2"><Emoji e={item.emoji} size={36} /></div>
                <div className="small fw-bold text-truncate mb-1">{item.name}</div>
                <div className="d-flex justify-content-center gap-1 mb-1">
                  <span
                    className="badge rounded-pill"
                    style={{ backgroundColor: rStyle.bg, color: rStyle.color, fontSize: '10px' }}
                  >
                    {rStyle.label}
                  </span>
                </div>
                <div className="text-muted text-truncate" style={{ fontSize: '11px', marginBottom: '6px' }}>
                  {item.note}
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center pt-1 border-top" style={{ fontSize: '12px' }}>
                  <span className="fw-bold text-primary">{item.priceText}</span>
                  <span className="text-success small fw-bold">
                    {isSelected ? '✓ Đang thử' : 'Thử'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
