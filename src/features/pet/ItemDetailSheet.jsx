import { useState } from 'react';

export default function ItemDetailSheet({ open, item, userMilk = 0, onConfirm, onClose, loading = false }) {
  const [confirming, setConfirming] = useState(false);

  if (!open || !item) return null;

  const price = item.price || 0;
  const canAfford = userMilk >= price;
  const remaining = userMilk - price;

  const handleBuyClick = () => {
    if (!canAfford) return;
    setConfirming(true);
  };

  const handleExecute = async () => {
    await onConfirm?.(item.id);
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
              style={{ width: '40px', height: '40px', backgroundColor: '#f1f3f4', fontSize: '24px' }}
            >
              {item.icon}
            </span>
            <div>
              <h5 className="fw-bold mb-0">{item.name}</h5>
              <div className="small text-muted">{item.shortBenefit}</div>
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

        {/* Content & Rules */}
        <div className="mb-3">
          <h6 className="fw-bold small text-muted text-uppercase mb-2">Cơ chế hoạt động</h6>
          <p className="mb-2" style={{ lineHeight: '1.5' }}>
            {item.description}
          </p>

          {item.rules && (
            <div className="bg-light p-3 rounded mb-3 small">
              <div className="fw-bold mb-1">Quy định &amp; Giới hạn:</div>
              <ul className="mb-0 ps-3">
                {item.rules.map((rule, idx) => (
                  <li key={idx} className="mb-1">{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {item.statusDetail && (
            <div className="alert alert-info py-2 px-3 small mb-3">
              {item.statusDetail}
            </div>
          )}
        </div>

        {/* Balance calculation if buying */}
        {price > 0 && !item.actionCustom && (
          <div className="bg-light p-3 rounded mb-3 small">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Giá vật phẩm:</span>
              <span className="fw-bold text-primary">{price.toLocaleString('vi-VN')} 🥛 Sữa</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Số dư hiện tại:</span>
              <span>{userMilk.toLocaleString('vi-VN')} 🥛 Sữa</span>
            </div>
            <hr className="my-1" />
            <div className="d-flex justify-content-between">
              <span className="text-muted">Số dư sau mua:</span>
              <span className={`fw-bold ${remaining < 0 ? 'text-danger' : 'text-success'}`}>
                {remaining >= 0 ? `${remaining.toLocaleString('vi-VN')} 🥛 Sữa` : `Thiếu ${Math.abs(remaining).toLocaleString('vi-VN')} 🥛 Sữa`}
              </span>
            </div>
          </div>
        )}

        {/* Actions / Confirmation */}
        {confirming ? (
          <div className="border border-success bg-success bg-opacity-10 p-3 rounded text-center">
            <p className="fw-bold mb-2">
              Xác nhận dùng {price.toLocaleString('vi-VN')} 🥛 Sữa để {item.actionLabel || 'mua'} {item.name}?
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
                onClick={handleExecute}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận mua'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {item.buttonState?.disabled ? (
              <button type="button" className="btn btn-secondary w-100 py-2" disabled>
                {item.buttonState.label}
              </button>
            ) : item.actionCustom ? (
              item.actionCustom
            ) : (
              <button
                type="button"
                className="btn btn-cowdi-primary w-100 py-2"
                onClick={handleBuyClick}
                disabled={!canAfford || loading}
              >
                {canAfford ? `${item.actionLabel || 'Mua ngay'} · ${price.toLocaleString('vi-VN')} 🥛` : `Thiếu ${Math.abs(remaining).toLocaleString('vi-VN')} 🥛`}
              </button>
            )}
          </div>
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
