import { useState } from 'react';
import Emoji from '../../components/Emoji';
import { COSMETIC_RARITIES, getCosmeticPrice } from '../../../shared/cosmetics-data.js';

export default function CosmeticBuySheet({
  open,
  item,
  wallet = { milk: 0, gem: 0 },
  hasSameTheme = false,
  onConfirm,
  onClose,
  loading = false,
}) {
  const [selectedPetOption, setSelectedPetOption] = useState(true);

  if (!open || !item) return null;

  const rarityMeta = COSMETIC_RARITIES[item.rarity] || COSMETIC_RARITIES.common;
  const isGem = item.priceGem > 0;
  const currencyKey = isGem ? 'gem' : 'milk';
  const currencyName = isGem ? 'Gem' : 'Sữa';
  const currencyIcon = isGem ? '💎' : '🥛';

  const priceCalc = getCosmeticPrice(item, hasSameTheme);
  const finalPrice = isGem ? priceCalc.gem : priceCalc.milk;
  const originalPrice = isGem ? item.priceGem : item.priceMilk;
  const userBalance = wallet[currencyKey] || 0;
  const canAfford = userBalance >= finalPrice;
  const remaining = userBalance - finalPrice;

  const handleBuy = async () => {
    if (!canAfford || loading) return;
    await onConfirm?.(item.id, hasSameTheme, selectedPetOption);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end justify-content-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-100 p-3 p-md-4 shadow"
        style={{
          maxWidth: '520px',
          maxHeight: '88vh',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          overflowY: 'auto',
          animation: 'cowdiSlideUp 0.22s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: item.bgStyle || '#f8f9fa',
                fontSize: '28px',
                border: '1px solid #e9ecef',
              }}
            >
              <Emoji e={item.emoji} size={30} />
            </span>
            <div>
              <div className="d-flex align-items-center gap-1">
                <h3 className="shop-sheet-title mb-0">{item.name}</h3>
                <span
                  className="badge rounded-pill ms-1"
                  style={{
                    backgroundColor: rarityMeta.bg,
                    color: rarityMeta.color,
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {rarityMeta.label}
                </span>
              </div>
              <div className="shop-row-benefit">{item.category === 'room' ? 'Trang trí Nền' : 'Hiệu ứng Hào quang'}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-1"
            onClick={onClose}
            aria-label="Đóng"
            style={{ width: '32px', height: '32px' }}
          >
            ✕
          </button>
        </div>

        {/* Content & Description */}
        <div className="mb-3">
          <p className="mb-2 text-dark" style={{ lineHeight: '1.5', fontSize: '14px' }}>
            {item.description}
          </p>
          {item.note && (
            <div className="small text-muted mb-2">
              📌 {item.note}
            </div>
          )}
        </div>

        {/* Combo Discount Callout */}
        {hasSameTheme && (
          <div
            className="alert py-2 px-3 small mb-3 rounded-3 d-flex align-items-center gap-2"
            style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7', color: '#1B5E20' }}
          >
            <span style={{ fontSize: '18px' }}>🎉</span>
            <div>
              <strong>Ưu đãi combo cùng chủ đề:</strong> Giảm ngay <strong>20%</strong> khi sở hữu hoặc mua kèm món cùng bộ!
            </div>
          </div>
        )}

        {/* Price & Balance Calculation */}
        <div className="bg-light p-3 rounded-3 mb-3 small border">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted">Giá bán:</span>
            <div>
              {hasSameTheme && (
                <span className="text-decoration-line-through text-muted me-2">
                  {originalPrice.toLocaleString('vi-VN')} {currencyIcon}
                </span>
              )}
              <span className="fw-bold" style={{ color: isGem ? '#7B1FA2' : '#2E7D32', fontSize: '15px' }}>
                {finalPrice.toLocaleString('vi-VN')} {currencyIcon} {currencyName}
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted">Số dư ví của bạn:</span>
            <span className="fw-semibold">
              {userBalance.toLocaleString('vi-VN')} {currencyIcon} {currencyName}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center pt-2 mt-1 border-top">
            <span className="text-muted">Số dư sau khi mua:</span>
            <span className={`fw-bold ${canAfford ? 'text-success' : 'text-danger'}`}>
              {canAfford
                ? `${remaining.toLocaleString('vi-VN')} ${currencyIcon} ${currencyName}`
                : `Thiếu ${(finalPrice - userBalance).toLocaleString('vi-VN')} ${currencyIcon} ${currencyName}`}
            </span>
          </div>
        </div>

        {/* Option: Trang bị ngay cho Pet đang xem */}
        <div className="form-check mb-3 ms-1">
          <input
            className="form-check-input"
            type="checkbox"
            id="equipAfterBuy"
            checked={selectedPetOption}
            onChange={(e) => setSelectedPetOption(e.target.checked)}
          />
          <label className="form-check-label small text-muted" htmlFor="equipAfterBuy">
            Tự động trang bị ngay cho thú cưng hiện tại sau khi mua
          </label>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-light border flex-grow-1 py-2 rounded-pill fw-semibold"
            onClick={onClose}
            disabled={loading}
          >
            Để sau
          </button>
          <button
            type="button"
            className={`btn flex-grow-1 py-2 rounded-pill fw-bold ${
              canAfford ? 'btn-cowdi-primary shadow-sm' : 'btn-secondary text-white'
            }`}
            onClick={handleBuy}
            disabled={!canAfford || loading}
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : canAfford ? (
              `Xác nhận mua · ${finalPrice.toLocaleString('vi-VN')} ${currencyIcon}`
            ) : (
              `Chưa đủ ${currencyName}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
