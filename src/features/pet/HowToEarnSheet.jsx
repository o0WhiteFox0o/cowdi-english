import Icon from '../../components/Icon';

export default function HowToEarnSheet({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end justify-content-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-100 p-3 p-md-4 shadow"
        style={{
          maxWidth: '560px',
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
            <span className="fs-4">💡</span>
            <h5 className="fw-bold mb-0">Cách kiếm tài nguyên</h5>
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

        {/* 1. Sữa 🥛 */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="fs-5">🥛</span>
            <h6 className="fw-bold text-primary mb-0">Sữa — Học tập &amp; Giữ nhịp</h6>
          </div>
          <p className="text-muted small mb-2">
            Dùng để tiến hoá pet và mua vật phẩm giữ nhịp chuỗi học.
          </p>
          <div className="list-group list-group-flush small border rounded">
            {[
              { label: 'Bài học mới hoàn thành', reward: '~170 Sữa' },
              { label: 'Ôn lại bài học đã xong', reward: '1/3 Sữa (~57)' },
              { label: 'Nhiệm vụ hàng ngày', reward: '+30 Sữa / nhiệm vụ' },
              { label: 'Hoàn thành đủ 3 nhiệm vụ ngày', reward: '+75 Sữa bonus' },
              { label: 'Quiz trọn điểm (100%)', reward: '+45 Sữa' },
              { label: 'Streak 3 ngày liên tiếp', reward: '+60 Sữa' },
              { label: 'Streak 7 ngày liên tiếp', reward: '+150 Sữa' },
              { label: 'Mỗi thành tựu mới mở khoá', reward: '+90 Sữa' },
              { label: 'Khế ước 7 ngày thành công', reward: 'Lãi +150 ~ 750 Sữa (×1.5)' },
              { label: 'Giờ vàng (Đồng hồ Cowdi)', reward: '+10% Sữa (tối đa 3 bài/ngày)' },
            ].map((item, idx) => (
              <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                <span>{item.label}</span>
                <span className="fw-bold text-primary">{item.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Gem 💎 */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="fs-5">💎</span>
            <h6 className="fw-bold text-info mb-0">Gem — Tiến hoá, Đổi đá &amp; Gacha</h6>
          </div>
          <p className="text-muted small mb-2">
            Tài nguyên quý hiếm nhận từ các cột mốc hoàn thành bài học và unit.
          </p>
          <div className="list-group list-group-flush small border rounded">
            {[
              { label: 'Mỗi 2 bài học mới hoàn thành', reward: '+1 Gem' },
              { label: 'Hoàn thành Unit (Checkpoint)', reward: '+1 Gem' },
              { label: 'Unit đạt 100% (toàn bộ bài trọn điểm)', reward: '+2 Gem nữa' },
              { label: 'Tặng pet qua thiệp mời (khi bạn học 3 bài)', reward: '+3 Gem' },
            ].map((item, idx) => (
              <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                <span>{item.label}</span>
                <span className="fw-bold text-info">{item.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Đá nguyên tố 💠 */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="fs-5">💠</span>
            <h6 className="fw-bold text-secondary mb-0">Đá nguyên tố — Mốc tiến hoá C4 &amp; C5</h6>
          </div>
          <p className="text-muted small mb-2">
            Vật phẩm quan trọng để đánh thức tiềm năng tối thượng của pet.
          </p>
          <div className="list-group list-group-flush small border rounded">
            {[
              { label: 'Mỗi 10 bài học mới hoàn thành', reward: '+1 Đá nguyên tố' },
              { label: 'Đổi từ Gem tại Ví tài khoản (15 Gem)', reward: '1 Đá / tuần (reset thứ Hai)' },
              { label: 'Ghép mảnh đá nguyên tố', reward: '10 Mảnh = 1 Đá' },
            ].map((item, idx) => (
              <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                <span>{item.label}</span>
                <span className="fw-bold text-secondary">{item.reward}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-cowdi-primary w-100 py-2 mt-2"
          onClick={onClose}
        >
          Đã hiểu
        </button>
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
