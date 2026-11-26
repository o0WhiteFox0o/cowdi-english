import { useState } from 'react';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';

const CONTRACT_TIERS = [
  { key: 'starter', label: 'Khởi động', deposit: 300, lessons: 1, payout: 450, profit: 150 },
  { key: 'diligent', label: 'Chăm chỉ', deposit: 700, lessons: 2, payout: 1050, profit: 350 },
  { key: 'breakthrough', label: 'Bứt phá', deposit: 1500, lessons: 3, payout: 2250, profit: 750 },
];

export default function ContractSelectSheet({ open, userMilk = 0, onSign, onClose, loading = false }) {
  const [selectedTier, setSelectedTier] = useState('starter');
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  const currentTier = CONTRACT_TIERS.find((t) => t.key === selectedTier) || CONTRACT_TIERS[0];
  const canAfford = userMilk >= currentTier.deposit;
  const remaining = userMilk - currentTier.deposit;

  const handleSign = async () => {
    await onSign?.(selectedTier);
    setConfirming(false);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end justify-content-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={() => { setConfirming(false); onClose(); }}
    >
      <div
        className="bg-white w-100 p-3 p-md-4 shadow"
        style={{
          maxWidth: '520px',
          maxHeight: '85vh',
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
              className="d-flex align-items-center justify-content-center rounded"
              style={{ width: '40px', height: '40px', backgroundColor: '#f1f3f4' }}
            >
              <Icon name="shop_contract" size={28} />
            </span>
            <div>
              <h3 className="shop-sheet-title mb-0">Khế ước 7 ngày</h3>
              <div className="shop-row-benefit">Cam kết học tập nhận hoàn ×1.5 Sữa</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-1"
            onClick={() => { setConfirming(false); onClose(); }}
            aria-label="Đóng"
            style={{ width: '32px', height: '32px' }}
          >
            ✕
          </button>
        </div>

        {/* Rule note */}
        <div className="bg-light p-3 rounded mb-3 small">
          <div className="fw-bold mb-1">Luật khế ước:</div>
          <ul className="mb-0 ps-3">
            <li>Cam kết hoàn thành đủ số bài học mỗi ngày trong 7 ngày liên tiếp.</li>
            <li>Bài học tính là bài mới hoặc bài làm lại đạt điểm từ <strong>70% trở lên</strong>.</li>
            <li>Hoàn thành đủ 7 ngày: nhận lại toàn bộ cọc kèm <strong>thưởng ×1.5 Sữa</strong>.</li>
            <li><strong>Lưu ý:</strong> Bỏ lỡ 1 ngày sẽ mất cọc. Khăn giữ lửa không dùng được cho khế ước!</li>
          </ul>
        </div>

        {/* 3 Tier selector cards */}
        <div className="row g-2 mb-3">
          {CONTRACT_TIERS.map((tier) => {
            const isSelected = selectedTier === tier.key;
            return (
              <div key={tier.key} className="col-4">
                <div
                  className={`card h-100 p-2 text-center border ${isSelected ? 'border-success bg-success bg-opacity-10' : ''}`}
                  onClick={() => { setSelectedTier(tier.key); setConfirming(false); }}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  <div className="fw-bold small">{tier.label}</div>
                  <div className="small text-muted my-1">{tier.lessons} bài/ngày</div>
                  <div className="small d-inline-flex align-items-center justify-content-center">Cọc {tier.deposit} <Icon name="res_milk" size={14} className="ms-1" /></div>
                  <div className="fw-bold text-success small d-inline-flex align-items-center justify-content-center">+{tier.profit} <Icon name="res_milk" size={14} className="mx-1" /> lãi</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary box */}
        <div className="bg-light p-3 rounded mb-3 small">
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Mức đã chọn:</span>
            <span className="fw-bold">{currentTier.label} ({currentTier.lessons} bài/ngày)</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Số tiền đặt cọc:</span>
            <span className="fw-bold text-primary d-inline-flex align-items-center">
              {currentTier.deposit.toLocaleString('vi-VN')} <Icon name="res_milk" size={14} className="mx-1" /> Sữa
            </span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Nhận lại khi xong 7 ngày:</span>
            <span className="fw-bold text-success d-inline-flex align-items-center">
              {currentTier.payout.toLocaleString('vi-VN')} <Icon name="res_milk" size={14} className="mx-1" /> Sữa (lãi +{currentTier.profit})
            </span>
          </div>
          <hr className="my-1" />
          <div className="d-flex justify-content-between">
            <span className="text-muted">Số dư sau cọc:</span>
            <span className={`fw-bold d-inline-flex align-items-center ${remaining < 0 ? 'text-danger' : ''}`}>
              {canAfford ? (
                <>{remaining.toLocaleString('vi-VN')} <Icon name="res_milk" size={14} className="mx-1" /> Sữa</>
              ) : (
                <>Thiếu {(currentTier.deposit - userMilk).toLocaleString('vi-VN')} <Icon name="res_milk" size={14} className="mx-1" /></>
              )}
            </span>
          </div>
        </div>

        {/* Confirmation & CTA */}
        {confirming ? (
          <div className="border border-success bg-success bg-opacity-10 p-3 rounded text-center">
            <p className="fw-bold mb-2 d-inline-flex align-items-center justify-content-center flex-wrap">
              Xác nhận cọc {currentTier.deposit.toLocaleString('vi-VN')} <Icon name="res_milk" size={14} className="mx-1" /> Sữa để ký khế ước {currentTier.label}?
            </p>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-50 py-2"
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="btn btn-cowdi-primary w-50 py-2"
                onClick={handleSign}
                disabled={loading}
              >
                {loading ? 'Đang ký...' : 'Xác nhận đặt cọc'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-cowdi-primary w-100 py-2 d-inline-flex align-items-center justify-content-center"
            onClick={() => setConfirming(true)}
            disabled={!canAfford || loading}
          >
            {canAfford ? (
              <>Đặt cọc {currentTier.deposit.toLocaleString('vi-VN')} <Icon name="res_milk" size={14} className="ms-1" /></>
            ) : (
              <>Thiếu {(currentTier.deposit - userMilk).toLocaleString('vi-VN')} <Icon name="res_milk" size={14} className="ms-1" /></>
            )}
          </button>
        )}
      </div>

      <style>{`
        @keyframes cowdiSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
