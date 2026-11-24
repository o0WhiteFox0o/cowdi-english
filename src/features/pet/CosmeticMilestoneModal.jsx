import Emoji from '../../components/Emoji';
import { getMilestoneProgress } from '../../../shared/cosmetics-data.js';

export default function CosmeticMilestoneModal({
  open,
  item,
  userStats = {},
  onClose,
  onEquip,
  currentPet,
}) {
  if (!open || !item) return null;

  const prog = getMilestoneProgress(item, userStats);
  const isEquipped = currentPet?.cosmetics?.[item.category] === item.id;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 p-3 p-md-4 shadow-lg w-100"
        style={{
          maxWidth: '460px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'cowdiScaleUp 0.18s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.35rem' }}>🏆</span>
            <h4 className="mb-0 fw-bold" style={{ fontSize: '1.25rem' }}>Vật phẩm Mốc học tập</h4>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle"
            onClick={onClose}
            aria-label="Đóng"
            style={{ width: '34px', height: '34px', padding: 0, fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>

        {/* Thông tin vật phẩm */}
        <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3" style={{ backgroundColor: '#FAFBFB', border: '1.5px solid #E5E7EB' }}>
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: item.bgStyle || '#F8F9FA',
              border: '1.5px solid #ECEFF1',
            }}
          >
            <Emoji e={item.emoji} size={40} />
          </div>
          <div className="min-w-0 flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge rounded-pill px-2 py-1 bg-success-subtle text-success border border-success-subtle fw-bold" style={{ fontSize: '11px' }}>
                🟢 Mốc học (Miễn phí)
              </span>
              {isEquipped && (
                <span className="badge rounded-pill px-2 py-1 bg-primary-subtle text-primary border border-primary-subtle fw-bold" style={{ fontSize: '11px' }}>
                  ✓ Đang mặc
                </span>
              )}
            </div>
            <h5 className="mb-1 fw-bold text-dark text-truncate" style={{ fontFamily: 'var(--font-hand, cursive)', fontSize: '1.25rem' }}>
              {item.name}
            </h5>
            <p className="mb-0 text-muted small" style={{ lineHeight: 1.35 }}>
              {item.description}
            </p>
          </div>
        </div>

        {/* Khung điều kiện mở khoá & tiến độ */}
        <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: prog.isUnlocked ? '#F0FDF4' : '#F8FAFC', border: `1.5px solid ${prog.isUnlocked ? '#BBF7D0' : '#E2E8F0'}` }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
              {prog.isUnlocked ? '🎉 Đã đạt điều kiện mở khoá:' : '🎯 Yêu cầu để mở khoá:'}
            </span>
            <span className={`badge rounded-pill px-2 py-1 fw-bold ${prog.isUnlocked ? 'bg-success text-white' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '12px' }}>
              {item.note || prog.label}
            </span>
          </div>

          <div className="mb-2 text-secondary small">
            {prog.label}: <strong>{prog.current.toLocaleString('vi-VN')} / {prog.target.toLocaleString('vi-VN')} {prog.unit}</strong>
          </div>

          {/* Thanh tiến trình trực quan */}
          <div className="progress mb-2" style={{ height: '10px', borderRadius: '999px', backgroundColor: '#E2E8F0' }}>
            <div
              className={`progress-bar progress-bar-striped ${prog.isUnlocked ? 'bg-success' : 'bg-primary'}`}
              role="progressbar"
              style={{ width: `${prog.percent}%`, borderRadius: '999px', transition: 'width 0.4s ease' }}
              aria-valuenow={prog.percent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center small">
            <span className="text-muted">Tiến độ đạt được:</span>
            <span className={`fw-bold ${prog.isUnlocked ? 'text-success' : 'text-primary'}`}>
              {prog.percent}% {prog.isUnlocked ? '(Đã xong)' : ''}
            </span>
          </div>
        </div>

        {/* Giải thích rõ ràng */}
        <div className="alert alert-light border small text-muted mb-3 d-flex align-items-start gap-2" style={{ borderRadius: '12px', fontSize: '0.9rem' }}>
          <span style={{ fontSize: '1.15rem' }}>💡</span>
          <div>
            Đồ <strong>Mốc học tập</strong> là phần thưởng vinh danh <strong>hoàn toàn MIỄN PHÍ</strong> (0 Sữa, 0 Gem).
            Chỉ cần chăm chỉ rèn luyện và đạt mốc mục tiêu là bạn có thể trang bị ngay cho thú cưng!
          </div>
        </div>

        {/* Nút hành động */}
        <div className="d-flex gap-2">
          {prog.isUnlocked ? (
            <button
              type="button"
              className="btn btn-cowdi-primary w-100 py-2 rounded-pill fw-bold"
              style={{ fontSize: '1.05rem', minHeight: '42px' }}
              onClick={() => {
                onEquip?.(item);
                onClose?.();
              }}
            >
              {isEquipped ? '✓ Đang mặc trên Pet' : '👗 Mặc cho thú cưng ngay'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-light border text-dark w-100 py-2 rounded-pill fw-bold"
              style={{ fontSize: '1.02rem', minHeight: '42px' }}
              onClick={onClose}
            >
              Đã hiểu, cố gắng cày mốc!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
