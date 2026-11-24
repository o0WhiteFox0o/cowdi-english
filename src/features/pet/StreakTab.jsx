import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { usePush } from '../../hooks/usePush';
import { KEEP_RHYTHM_ITEMS } from '../../../shared/game-config.js';
import ItemDetailSheet from './ItemDetailSheet';
import ContractSelectSheet from './ContractSelectSheet';

export default function StreakTab({ streakState, onRefreshState }) {
  const { authFetch, user } = useAuth();
  const { userData, setUserData } = useUser();
  const showToast = useToast();
  const { play } = useSound();
  const { isSubscribed, subscribe } = usePush();

  const [loading, setLoading] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [contractSheetOpen, setContractSheetOpen] = useState(false);
  const [clockPickerOpen, setClockPickerOpen] = useState(false);
  const [selectedClockHour, setSelectedClockHour] = useState(streakState?.clockHour ?? 20);

  const wallet = userData.wallet || { milk: userData.availableXP || 0, gem: 0, stone: 0 };
  const userMilk = wallet.milk || 0;

  const state = streakState || {
    currentStreak: userData.streak || 0,
    freezeCount: 0,
    freezesBoughtThisWeek: 0,
    canBuyFreeze: true,
    brokenStreakCount: 0,
    canBuyReturnTicket: false,
    returnTicketActive: false,
    hasClock: false,
    clockHour: 20,
    clockCanChangeThisWeek: true,
    contract: null,
  };

  // 1. Mua Khăn giữ lửa
  const handleBuyFreeze = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/shop/buy-freeze', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể mua Khăn giữ lửa', 'error');
      } else {
        play('levelUp');
        showToast('Đã mua 1 Khăn giữ lửa! Chuỗi của bạn sẽ được bảo vệ khi lỡ 1 ngày.', 'success');
        setActiveDetailItem(null);
        await onRefreshState?.();
      }
    } catch {
      showToast('Lỗi kết nối khi mua vật phẩm.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Mua Vé quay lại
  const handleBuyReturnTicket = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/shop/buy-return-ticket', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể dùng Vé quay lại', 'error');
      } else {
        play('levelUp');
        showToast('Đã kích hoạt Vé quay lại! Hoàn thành 2 bài học trong 24h để khôi phục 50% streak.', 'success');
        setActiveDetailItem(null);
        await onRefreshState?.();
      }
    } catch {
      showToast('Lỗi kết nối khi kích hoạt vé.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Ký Khế ước 7 ngày
  const handleSignContract = async (tierKey) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/shop/sign-contract', {
        method: 'POST',
        body: JSON.stringify({ tier: tierKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể ký khế ước', 'error');
      } else {
        play('levelUp');
        showToast('Đã ký Khế ước 7 ngày thành công! Chúc bạn giữ vững mục tiêu.', 'success');
        setContractSheetOpen(false);
        setActiveDetailItem(null);
        await onRefreshState?.();
      }
    } catch {
      showToast('Lỗi kết nối khi ký khế ước.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Mua Đồng hồ Cowdi
  const handleBuyClock = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/shop/buy-clock', {
        method: 'POST',
        body: JSON.stringify({ hour: selectedClockHour, minute: 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể mua Đồng hồ Cowdi', 'error');
      } else {
        play('levelUp');
        showToast(`Đã sở hữu Đồng hồ Cowdi! Khung giờ vàng nhận +10% Sữa: ${selectedClockHour - 1}:00 - ${selectedClockHour + 1}:00.`, 'success');
        setActiveDetailItem(null);
        await onRefreshState?.();
      }
    } catch {
      showToast('Lỗi kết nối khi mua đồng hồ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 5. Đổi giờ học Đồng hồ Cowdi
  const handleSetClock = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/shop/set-clock', {
        method: 'POST',
        body: JSON.stringify({ hour: selectedClockHour, minute: 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể đổi giờ học', 'error');
      } else {
        play('equip');
        showToast(`Đã cập nhật giờ học mới: ${selectedClockHour}:00 hàng ngày!`, 'success');
        setClockPickerOpen(false);
        await onRefreshState?.();
      }
    } catch {
      showToast('Lỗi kết nối khi đổi giờ học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Xây dựng thông tin cấu hình và trạng thái nút cho 4 món
  const freezeItem = {
    id: 'freeze',
    icon: '🧣',
    name: 'Khăn giữ lửa',
    shortBenefit: 'Bảo vệ chuỗi khi lỡ 1 ngày học',
    description: 'Tự động kích hoạt khi bạn bỏ lỡ một ngày học để giữ nguyên chuỗi streak. Mỗi khăn che chở cho đúng 1 ngày nghỉ.',
    rules: [
      'Sở hữu tối đa 2 khăn cùng lúc trong kho.',
      'Mua tối đa 2 khăn mỗi tuần (reset vào 00:00 thứ Hai).',
      'Được tặng miễn phí 1 khăn khi đạt các mốc streak 7, 30, 100 ngày (nếu kho chưa đầy 2 khăn).',
    ],
    price: KEEP_RHYTHM_ITEMS.freeze.priceMilk,
    statusSubtitle: `Số lượng: ${state.freezeCount}/2 · Đã mua tuần này: ${state.freezesBoughtThisWeek}/2`,
    buttonState: (() => {
      if (state.freezeCount >= KEEP_RHYTHM_ITEMS.freeze.maxInventory) {
        return { disabled: true, label: 'Đủ 2/2 khăn' };
      }
      if (state.freezesBoughtThisWeek >= KEEP_RHYTHM_ITEMS.freeze.maxBuyPerWeek) {
        return { disabled: true, label: 'Tuần sau mua tiếp (2/2)' };
      }
      if (userMilk < KEEP_RHYTHM_ITEMS.freeze.priceMilk) {
        return { disabled: true, label: `Thiếu ${(KEEP_RHYTHM_ITEMS.freeze.priceMilk - userMilk).toLocaleString('vi-VN')} 🥛` };
      }
      return { disabled: false, label: `${KEEP_RHYTHM_ITEMS.freeze.priceMilk.toLocaleString('vi-VN')} 🥛` };
    })(),
  };

  const returnTicketItem = {
    id: 'return_ticket',
    icon: '🔁',
    name: 'Vé quay lại',
    shortBenefit: 'Khôi phục 50% streak cũ sau khi nghỉ',
    description: 'Dành cho những người học không may bị đứt chuỗi và đã nghỉ từ 2 đến 14 ngày. Sau khi kích hoạt, hoàn thành 2 bài học trong vòng 24 giờ để khôi phục 50% chuỗi streak cũ!',
    rules: [
      'Điều kiện: Chuỗi streak cũ trước khi đứt phải đạt từ 7 ngày trở lên.',
      'Thời gian nghỉ: Từ 2 đến 14 ngày kể từ ngày học gần nhất.',
      'Giới hạn: 1 lần sử dụng mỗi 30 ngày.',
      'Yêu cầu: Hoàn thành 2 bài học (mới hoặc ôn lại ≥ 70%) trong vòng 24 giờ kể từ khi kích hoạt.',
    ],
    price: KEEP_RHYTHM_ITEMS.returnTicket.priceMilk,
    statusSubtitle: state.returnTicketActive
      ? `● Đang dùng · Đã làm ${state.returnTicketLessonsDone}/2 bài`
      : state.canBuyReturnTicket
      ? `Đủ điều kiện khôi phục ${Math.floor(state.brokenStreakCount * 0.5)} ngày streak cũ`
      : 'Cần streak cũ ≥ 7 ngày và nghỉ 2–14 ngày',
    buttonState: (() => {
      if (state.returnTicketActive) {
        return { disabled: true, label: `● Đang dùng (${state.returnTicketLessonsDone}/2)` };
      }
      if (!state.canBuyReturnTicket) {
        return { disabled: true, label: 'Mở khi nghỉ 2–14 ngày' };
      }
      if (userMilk < KEEP_RHYTHM_ITEMS.returnTicket.priceMilk) {
        return { disabled: true, label: `Thiếu ${(KEEP_RHYTHM_ITEMS.returnTicket.priceMilk - userMilk).toLocaleString('vi-VN')} 🥛` };
      }
      return { disabled: false, label: `${KEEP_RHYTHM_ITEMS.returnTicket.priceMilk.toLocaleString('vi-VN')} 🥛` };
    })(),
  };

  const contractItem = {
    id: 'contract',
    icon: '📜',
    name: 'Khế ước 7 ngày',
    shortBenefit: 'Cam kết học đủ 7 ngày liên tiếp nhận hoàn ×1.5 Sữa',
    description: 'Đặt cọc Sữa và cam kết hoàn thành mục tiêu học tập mỗi ngày trong 7 ngày liên tiếp. Khi hoàn thành, bạn nhận lại toàn bộ tiền cọc kèm 50% lợi nhuận (tổng ×1.5 Sữa)!',
    rules: [
      '3 mức cọc: Khởi động (300 🥛, 1 bài/ngày), Chăm chỉ (700 🥛, 2 bài/ngày), Bứt phá (1 500 🥛, 3 bài/ngày).',
      'Bài học tính là bài mới hoặc bài làm lại đạt điểm ≥ 70%.',
      'Lưu ý: Bỏ lỡ 1 ngày sẽ mất toàn bộ tiền cọc. Khăn giữ lửa KHÔNG dùng được cho khế ước!',
      'Mỗi thời điểm chỉ được tham gia 1 khế ước duy nhất.',
    ],
    price: 0,
    statusSubtitle: state.contract
      ? `Tiến độ: ${'●'.repeat(state.contract.daysCompleted)}${'○'.repeat(7 - state.contract.daysCompleted)} ${state.contract.daysCompleted}/7 ngày · Hôm nay: ${state.contract.todayLessonsDone}/${state.contract.targetLessonsPerDay} bài`
      : 'Thử thách 7 ngày: Khởi động 300 🥛 · Chăm chỉ 700 🥛 · Bứt phá 1 500 🥛',
    buttonState: (() => {
      if (state.contract) {
        return { disabled: false, isProgress: true, label: `${state.contract.daysCompleted}/7 ngày (còn ${7 - state.contract.daysCompleted} ngày)` };
      }
      return { disabled: false, isContractSelect: true, label: 'Chọn mức' };
    })(),
  };

  const clockItem = {
    id: 'clock',
    icon: '⏰',
    name: 'Đồng hồ Cowdi',
    shortBenefit: 'Giờ vàng học tập cố định +10% Sữa mỗi ngày',
    description: 'Chọn một khung giờ học cố định mỗi ngày. Mọi bài học bắt đầu trong khoảng ±1 giờ quanh giờ này được thưởng thêm +10% Sữa (tối đa 3 bài/ngày). Mua một lần dùng mãi mãi!',
    rules: [
      'Giá 1 000 🥛 Sữa, mua một lần dùng vĩnh viễn.',
      'Khung giờ vàng: Trong vòng ±60 phút trước và sau giờ đã chọn (ví dụ chọn 20:00 thì khung giờ vàng là 19:00 - 21:00).',
      'Thưởng thêm +10% Sữa cho tối đa 3 bài học hoàn thành trong khung giờ vàng mỗi ngày.',
      'Miễn phí đổi giờ học 1 lần mỗi tuần (reset vào 00:00 thứ Hai).',
    ],
    price: KEEP_RHYTHM_ITEMS.clock.priceMilk,
    statusSubtitle: state.hasClock
      ? `Giờ vàng: ${String(state.clockHour ?? 20).padStart(2, '0')}:00 hàng ngày (±1 giờ) · ${state.clockCanChangeThisWeek ? 'Được đổi giờ' : 'Đã đổi tuần này'}`
      : 'Mua vĩnh viễn · Thưởng +10% Sữa cho tối đa 3 bài/ngày quanh giờ đã chọn',
    buttonState: (() => {
      if (state.hasClock) {
        return { disabled: false, isClockManage: true, label: `Giờ vàng ${String(state.clockHour ?? 20).padStart(2, '0')}:00 · Đổi giờ` };
      }
      if (userMilk < KEEP_RHYTHM_ITEMS.clock.priceMilk) {
        return { disabled: true, label: `Thiếu ${(KEEP_RHYTHM_ITEMS.clock.priceMilk - userMilk).toLocaleString('vi-VN')} 🥛` };
      }
      return { disabled: false, label: `${KEEP_RHYTHM_ITEMS.clock.priceMilk.toLocaleString('vi-VN')} 🥛` };
    })(),
  };

  const listItems = [freezeItem, returnTicketItem, contractItem, clockItem];

  return (
    <div className="streak-tab-container">
      {/* Dải trạng thái 1 dòng */}
      <div
        className="d-flex align-items-center justify-content-between p-2 px-3 rounded mb-3"
        style={{ backgroundColor: '#f8f9fa', border: '1px solid #e8eaed', fontSize: '13px', flexWrap: 'wrap', gap: '8px' }}
      >
        <span title="Chuỗi ngày học liên tục">
          🔥 <strong>{state.currentStreak || 0}</strong> ngày streak
        </span>
        <span className="text-muted">·</span>
        <span title="Số Khăn giữ lửa sở hữu">
          🧣 <strong>{state.freezeCount}</strong>/2 khăn
        </span>
        <span className="text-muted">·</span>
        <span title="Trạng thái Khế ước 7 ngày">
          📜 {state.contract ? (
            <span><strong>{state.contract.daysCompleted}</strong>/7 ngày</span>
          ) : (
            <span className="text-muted">Chưa có khế ước</span>
          )}
        </span>
        <span className="text-muted">·</span>
        <span title="Giờ vàng Đồng hồ Cowdi">
          ⏰ {state.hasClock ? (
            <span><strong>{String(state.clockHour ?? 20).padStart(2, '0')}:00</strong></span>
          ) : (
            <span className="text-muted">Chưa đặt giờ</span>
          )}
        </span>
      </div>

      {/* Danh sách 4 món dạng dòng chuẩn */}
      <div className="d-flex flex-column gap-2 mb-3">
        {listItems.map((item) => {
          const btn = item.buttonState;

          return (
            <div
              key={item.id}
              className="d-flex align-items-center justify-content-between p-3 rounded bg-white"
              style={{
                border: '1px solid #e0e0e0',
                transition: 'border-color 0.15s ease',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (item.id === 'contract' && !state.contract) {
                  setContractSheetOpen(true);
                } else if (item.id === 'clock' && state.hasClock) {
                  setClockPickerOpen(true);
                } else {
                  setActiveDetailItem(item);
                }
              }}
            >
              {/* Bên trái: Icon 36px nền xám nhạt + Nội dung */}
              <div className="d-flex align-items-center gap-3 pe-2 flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0 rounded"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#f1f3f4',
                    fontSize: '20px',
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="fw-bold text-dark text-truncate" style={{ fontSize: '15px' }}>
                    {item.name}
                  </div>
                  <div className="text-dark small text-truncate" style={{ fontSize: '13px' }}>
                    {item.shortBenefit}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '12px', marginTop: '2px' }}>
                    {item.statusSubtitle}
                  </div>
                </div>
              </div>

              {/* Bên phải: Nút / Trạng thái */}
              <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {btn.disabled ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-light border text-muted"
                    style={{ minWidth: '100px', fontSize: '13px' }}
                    onClick={() => setActiveDetailItem(item)}
                  >
                    {btn.label}
                  </button>
                ) : btn.isContractSelect ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-cowdi-primary text-nowrap"
                    style={{ minWidth: '100px', fontSize: '13px' }}
                    onClick={() => setContractSheetOpen(true)}
                  >
                    {btn.label}
                  </button>
                ) : btn.isProgress ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success text-nowrap"
                    style={{ minWidth: '100px', fontSize: '13px' }}
                    onClick={() => setActiveDetailItem(item)}
                  >
                    {btn.label}
                  </button>
                ) : btn.isClockManage ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary text-nowrap"
                    style={{ minWidth: '100px', fontSize: '13px' }}
                    onClick={() => setClockPickerOpen(true)}
                  >
                    {btn.label}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-cowdi-primary text-nowrap"
                    style={{ minWidth: '100px', fontSize: '13px' }}
                    onClick={() => setActiveDetailItem(item)}
                  >
                    {btn.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal/Sheet chọn giờ Đồng hồ Cowdi */}
      {clockPickerOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={() => setClockPickerOpen(false)}
        >
          <div
            className="bg-white w-100 p-3 p-md-4 shadow"
            style={{
              maxWidth: '480px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              animation: 'cowdiSlideUp 0.22s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">⏰ Đổi giờ học Đồng hồ Cowdi</h5>
              <button
                type="button"
                className="btn btn-sm btn-light rounded-circle"
                onClick={() => setClockPickerOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="small text-muted mb-3">
              Mỗi bài học hoàn thành trong vòng ±1 giờ quanh giờ đã chọn được +10% Sữa (tối đa 3 bài/ngày). Mỗi tuần được đổi giờ miễn phí 1 lần.
            </p>
            <div className="mb-3">
              <label className="form-label small fw-bold">Chọn giờ học vàng của bạn:</label>
              <select
                className="form-select"
                value={selectedClockHour}
                onChange={(e) => setSelectedClockHour(Number(e.target.value))}
                disabled={!state.clockCanChangeThisWeek}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00 (Khung vàng: {h === 0 ? 23 : h - 1}:00 - {(h + 1) % 24}:00)
                  </option>
                ))}
              </select>
            </div>

            {!isSubscribed && (
              <div className="alert alert-light p-2 small mb-3 border d-flex justify-content-between align-items-center">
                <span>Nhận thông báo khi đến giờ vàng:</span>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={subscribe}>
                  Bật nhắc nhở
                </button>
              </div>
            )}

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-50 py-2"
                onClick={() => setClockPickerOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-cowdi-primary w-50 py-2"
                onClick={handleSetClock}
                disabled={loading || !state.clockCanChangeThisWeek || selectedClockHour === state.clockHour}
              >
                {loading ? 'Đang lưu...' : state.clockCanChangeThisWeek ? 'Lưu giờ học' : 'Đã đổi tuần này'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet chi tiết món Giữ nhịp */}
      <ItemDetailSheet
        open={!!activeDetailItem}
        item={activeDetailItem}
        userMilk={userMilk}
        loading={loading}
        onClose={() => setActiveDetailItem(null)}
        onConfirm={(itemId) => {
          if (itemId === 'freeze') return handleBuyFreeze();
          if (itemId === 'return_ticket') return handleBuyReturnTicket();
          if (itemId === 'clock') return handleBuyClock();
        }}
      />

      {/* Bottom Sheet chọn mức Khế ước 7 ngày */}
      <ContractSelectSheet
        open={contractSheetOpen}
        userMilk={userMilk}
        loading={loading}
        onClose={() => setContractSheetOpen(false)}
        onSign={handleSignContract}
      />
    </div>
  );
}
