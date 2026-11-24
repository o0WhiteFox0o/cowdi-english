import { COSMETIC_RARITIES } from '../../../shared/cosmetics-data.js';

export default function CosmeticFilterSheet({
  open,
  onClose,
  subCategory,
  rarityFilter,
  onSelectRarity,
  elementFilter,
  onSelectElement,
  onReset,
}) {
  if (!open) return null;

  const RARITY_OPTIONS = [
    { id: 'all', label: 'Tất cả phẩm chất' },
    { id: 'common', label: '⚪ Thường' },
    { id: 'rare', label: '🔵 Hiếm' },
    { id: 'epic', label: '🟣 Sử thi' },
    { id: 'legendary', label: '🟡 Huyền thoại' },
    { id: 'achievement', label: '🟢 Mốc học' },
    { id: 'season', label: '🟠 Mùa' },
  ];

  const ELEMENT_OPTIONS = [
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

  const hasFilter = rarityFilter !== 'all' || (subCategory === 'room' && elementFilter !== 'all');

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end justify-content-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1060 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-100 p-3 p-md-4 shadow"
        style={{
          maxWidth: '520px',
          maxHeight: '85vh',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          overflowY: 'auto',
          animation: 'cowdiSlideUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <h4 className="mb-0 fw-bold" style={{ fontSize: '1.15rem' }}>Bộ lọc & Phân loại</h4>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle"
            onClick={onClose}
            aria-label="Đóng"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Lọc phẩm chất */}
        <div className="mb-3">
          <div className="small fw-bold text-muted mb-2">Phẩm chất vật phẩm</div>
          <div className="d-flex flex-wrap gap-1">
            {RARITY_OPTIONS.map((r) => {
              const isSelected = rarityFilter === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1 ${
                    isSelected ? 'btn-cowdi-primary fw-bold shadow-xs' : 'btn-light border text-muted'
                  }`}
                  style={{ fontSize: '12px' }}
                  onClick={() => onSelectRarity(r.id)}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lọc hệ (chỉ khi xem Nền) */}
        {subCategory === 'room' && (
          <div className="mb-4">
            <div className="small fw-bold text-muted mb-2">Hệ nguyên tố (10 hệ)</div>
            <div className="d-flex flex-wrap gap-1">
              {ELEMENT_OPTIONS.map((elem) => {
                const isSelected = elementFilter === elem.id;
                return (
                  <button
                    key={elem.id}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 ${
                      isSelected ? 'btn-dark fw-bold shadow-xs' : 'btn-light border text-muted'
                    }`}
                    style={{ fontSize: '12px' }}
                    onClick={() => onSelectElement(elem.id)}
                  >
                    {elem.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="d-flex gap-2 pt-2 border-top">
          {hasFilter && (
            <button
              type="button"
              className="btn btn-outline-secondary flex-grow-1 rounded-pill py-2"
              onClick={onReset}
            >
              Đặt lại bộ lọc
            </button>
          )}
          <button
            type="button"
            className="btn btn-cowdi-primary flex-grow-1 rounded-pill py-2 fw-bold"
            onClick={onClose}
          >
            Xem kết quả
          </button>
        </div>
      </div>
    </div>
  );
}
