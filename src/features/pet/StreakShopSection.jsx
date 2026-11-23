import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { usePush } from '../../hooks/usePush';
import { KEEP_RHYTHM_ITEMS } from '../../../shared/game-config.js';
import Icon from '../../components/Icon';

const CONTRACT_TIERS = [
  { key: 'starter', label: 'Khởi động', deposit: 300, lessons: 1, payout: 450, profit: 150, color: 'text-success' },
  { key: 'diligent', label: 'Chăm chỉ', deposit: 700, lessons: 2, payout: 1050, profit: 350, color: 'text-primary' },
  { key: 'breakthrough', label: 'Bứt phá', deposit: 1500, lessons: 3, payout: 2250, profit: 750, color: 'text-warning' },
];

export default function StreakShopSection() {
  const { authFetch, user } = useAuth();
  const { userData, setUserData } = useUser();
  const showToast = useToast();
  const { play } = useSound();
  const { isSubscribed, subscribe } = usePush();

  const [loading, setLoading] = useState(false);
  const [streakState, setStreakState] = useState(userData.streakState || null);
  const [selectedTier, setSelectedTier] = useState('starter');
  const [clockHour, setClockHour] = useState(20);

  const wallet = userData.wallet || { milk: userData.availableXP || 0, gem: 0 };

  // Tải trạng thái Giữ nhịp mới nhất từ server
  const fetchStreakState = async () => {
    if (!user) return;
    try {
      const res = await authFetch('/api/shop/streak-state');
      if (res.ok) {
        const data = await res.json();
        if (data.streakState) {
          setStreakState(data.streakState);
          if (data.streakState.clockHour != null) {
            setClockHour(data.streakState.clockHour);
          }
          setUserData((prev) => ({
            ...prev,
            wallet: data.wallet || prev.wallet,
            availableXP: data.wallet ? data.wallet.milk : prev.availableXP,
            streak: data.streakState.currentStreak,
            streakState: data.streakState,
          }));
        }
      }
    } catch (err) {
      console.warn('Lỗi tải trạng thái streak:', err);
    }
  };

  useEffect(() => {
    fetchStreakState();
  }, [user]);

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
        showToast('Đã mua 1 Khăn giữ lửa! 🔥 Chuỗi của bạn sẽ được bảo vệ khi lỡ 1 ngày.', 'success');
        setStreakState(data.streakState);
        setUserData((prev) => ({
          ...prev,
          wallet: data.wallet,
          availableXP: data.wallet.milk,
          streakState: data.streakState,
        }));
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
        showToast('Đã kích hoạt Vé quay lại! Hãy hoàn thành 2 bài học trong 24h để khôi phục 50% streak.', 'success');
        setStreakState(data.streakState);
        setUserData((prev) => ({
          ...prev,
          wallet: data.wallet,
          availableXP: data.wallet.milk,
          streakState: data.streakState,
        }));
      }
    } catch {
      showToast('Lỗi kết nối khi mua vật phẩm.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Ký Khế ước 7 ngày
  const handleSignContract = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/shop/sign-contract', {
        method: 'POST',
        body: JSON.stringify({ tier: selectedTier }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể ký khế ước', 'error');
      } else {
        play('levelUp');
        showToast(`Đã ký Khế ước 7 ngày (${CONTRACT_TIERS.find((t) => t.key === selectedTier)?.label})! Hãy hoàn thành mục tiêu mỗi ngày.`, 'success');
        setStreakState(data.streakState);
        setUserData((prev) => ({
          ...prev,
          wallet: data.wallet,
          availableXP: data.wallet.milk,
          streakState: data.streakState,
        }));
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
        body: JSON.stringify({ hour: clockHour, minute: 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể mua Đồng hồ Cowdi', 'error');
      } else {
        play('levelUp');
        showToast(`Đã sở hữu Đồng hồ Cowdi! Khung giờ vàng nhận +10% Sữa: ${clockHour - 1}:00 - ${clockHour + 1}:00.`, 'success');
        setStreakState(data.streakState);
        setUserData((prev) => ({
          ...prev,
          wallet: data.wallet,
          availableXP: data.wallet.milk,
          streakState: data.streakState,
        }));
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
        body: JSON.stringify({ hour: clockHour, minute: 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể đổi giờ học', 'error');
      } else {
        play('equip');
        showToast(`Đã cập nhật giờ học mới: ${clockHour}:00 hàng ngày!`, 'success');
        setStreakState(data.streakState);
        setUserData((prev) => ({ ...prev, streakState: data.streakState }));
      }
    } catch {
      showToast('Lỗi kết nối khi đổi giờ học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const state = streakState || {
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

  return (
    <div className="container px-0">
      <div className="row g-3">
        {/* 1. KHĂN GIỮ LỬA */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100 border-warning">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-2">🧣</span>
                  <div>
                    <h5 className="fw-bold mb-0">Khăn giữ lửa</h5>
                    <span className="badge bg-warning text-dark">Bảo vệ Streak</span>
                  </div>
                </div>
                <span className="badge bg-primary fs-6 px-2 py-1">🥛 400 Sữa</span>
              </div>
              <p className="text-muted small mb-3 flex-grow-1">
                Tự động dùng khi bạn bỏ lỡ một ngày học để giữ nguyên chuỗi streak. Tặng kèm 1 khăn khi đạt mốc streak 7, 30, 100 ngày.
              </p>
              <div className="bg-light p-2 rounded mb-3 small d-flex justify-content-between">
                <span>Số khăn sở hữu: <strong>{state.freezeCount} / 2</strong></span>
                <span>Đã mua tuần này: <strong>{state.freezesBoughtThisWeek} / 2</strong></span>
              </div>
              <button
                type="button"
                className="btn btn-cowdi-primary w-100 py-2"
                onClick={handleBuyFreeze}
                disabled={loading || !state.canBuyFreeze || wallet.milk < KEEP_RHYTHM_ITEMS.freeze.priceMilk}
              >
                {state.freezeCount >= 2
                  ? 'Đã đầy kho (2/2)'
                  : state.freezesBoughtThisWeek >= 2
                  ? 'Đã đạt giới hạn tuần (2/2)'
                  : wallet.milk < KEEP_RHYTHM_ITEMS.freeze.priceMilk
                  ? 'Không đủ Sữa'
                  : 'Mua Khăn (400 Sữa)'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. VÉ QUAY LẠI */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100 border-info">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-2">🔁</span>
                  <div>
                    <h5 className="fw-bold mb-0">Vé quay lại</h5>
                    <span className="badge bg-info text-dark">Khôi phục Streak</span>
                  </div>
                </div>
                <span className="badge bg-primary fs-6 px-2 py-1">🥛 300 Sữa</span>
              </div>
              <p className="text-muted small mb-3 flex-grow-1">
                Dùng khi chuỗi đã đứt và bạn nghỉ 2–14 ngày (yêu cầu streak cũ ≥ 7 ngày). Học xong <strong>2 bài trong 24 giờ</strong> để khôi phục <strong>50% chuỗi cũ</strong>!
              </p>

              {state.returnTicketActive ? (
                <div className="alert alert-success py-2 px-3 small mb-3">
                  ⏳ <strong>Đang kích hoạt:</strong> Đã làm {state.returnTicketLessonsDone} / 2 bài. Hoàn thành trước khi hết 24h để phục hồi streak!
                </div>
              ) : (
                <div className="bg-light p-2 rounded mb-3 small">
                  {state.canBuyReturnTicket ? (
                    <span className="text-success fw-bold">✓ Đủ điều kiện khôi phục {Math.floor(state.brokenStreakCount * 0.5)} ngày streak</span>
                  ) : (
                    <span className="text-muted">Chỉ mở khi streak cũ ≥ 7 ngày và nghỉ 2–14 ngày (1 lần / 30 ngày).</span>
                  )}
                </div>
              )}

              <button
                type="button"
                className="btn btn-outline-info w-100 py-2"
                onClick={handleBuyReturnTicket}
                disabled={loading || state.returnTicketActive || !state.canBuyReturnTicket || wallet.milk < KEEP_RHYTHM_ITEMS.returnTicket.priceMilk}
              >
                {state.returnTicketActive
                  ? 'Vé đang có hiệu lực'
                  : !state.canBuyReturnTicket
                  ? 'Chưa đủ điều kiện'
                  : wallet.milk < KEEP_RHYTHM_ITEMS.returnTicket.priceMilk
                  ? 'Không đủ Sữa'
                  : 'Kích hoạt vé (300 Sữa)'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. KHẾ ƯỚC 7 NGÀY */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100 border-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-2">📜</span>
                  <div>
                    <h5 className="fw-bold mb-0">Khế ước 7 ngày</h5>
                    <span className="badge bg-primary">Thử thách có thưởng</span>
                  </div>
                </div>
                <span className="badge bg-success fs-6 px-2 py-1">Hoàn ×1.5 Sữa</span>
              </div>
              <p className="text-muted small mb-3">
                Đặt cọc Sữa và cam kết học đủ 7 ngày liên tiếp. Hoàn thành nhận lại <strong>×1.5 Sữa</strong>. Bỏ lỡ 1 ngày sẽ mất cọc (Khăn giữ lửa không cứu được khế ước).
              </p>

              {state.contract ? (
                <div className="bg-light p-3 rounded mb-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-primary">Khế ước đang chạy: {state.contract.tier}</span>
                    <span className="badge bg-warning text-dark">{state.contract.daysCompleted} / 7 ngày</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${(state.contract.daysCompleted / 7) * 100}%` }}
                    />
                  </div>
                  <div className="small text-muted d-flex justify-content-between">
                    <span>Hôm nay: {state.contract.todayLessonsDone} / {state.contract.targetLessonsPerDay} bài (≥ 70%)</span>
                    <span>Cọc: {state.contract.depositAmount} 🥛 · Thưởng: {Math.round(state.contract.depositAmount * 1.5)} 🥛</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row g-2 mb-3">
                    {CONTRACT_TIERS.map((tier) => (
                      <div key={tier.key} className="col-4">
                        <div
                          className={`card p-2 text-center cursor-pointer border ${selectedTier === tier.key ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                          onClick={() => setSelectedTier(tier.key)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={`fw-bold small ${tier.color}`}>{tier.label}</div>
                          <div className="small text-muted">Cọc {tier.deposit} 🥛</div>
                          <div className="fw-bold text-success small">+{tier.profit} 🥛</div>
                          <div className="small text-muted">{tier.lessons} bài/ngày</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-cowdi-primary w-100 py-2"
                    onClick={handleSignContract}
                    disabled={loading || wallet.milk < (CONTRACT_TIERS.find((t) => t.key === selectedTier)?.deposit || 300)}
                  >
                    Ký Khế ước (Cọc {CONTRACT_TIERS.find((t) => t.key === selectedTier)?.deposit} Sữa)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4. ĐỒNG HỒ COWDI */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100 border-danger">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-2">⏰</span>
                  <div>
                    <h5 className="fw-bold mb-0">Đồng hồ Cowdi</h5>
                    <span className="badge bg-danger">Giờ vàng +10% Sữa</span>
                  </div>
                </div>
                <span className="badge bg-primary fs-6 px-2 py-1">🥛 1 000 Sữa</span>
              </div>
              <p className="text-muted small mb-3 flex-grow-1">
                Chọn một giờ học cố định. Hoàn thành bài học trong khoảng <strong>±1 giờ</strong> quanh giờ này được <strong>+10% Sữa</strong> (tối đa 3 bài/ngày). Đổi giờ miễn phí 1 lần/tuần!
              </p>

              {state.hasClock ? (
                <div className="bg-light p-3 rounded mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small text-muted">Giờ vàng hàng ngày:</span>
                    <span className="badge bg-success fs-6">{state.clockHour ?? 20}:00</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <select
                      className="form-select form-select-sm"
                      value={clockHour}
                      onChange={(e) => setClockHour(Number(e.target.value))}
                      disabled={!state.clockCanChangeThisWeek}
                    >
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary text-nowrap"
                      onClick={handleSetClock}
                      disabled={loading || !state.clockCanChangeThisWeek || clockHour === state.clockHour}
                    >
                      Đổi giờ
                    </button>
                  </div>
                  <div className="small text-muted">
                    {state.clockCanChangeThisWeek ? '✓ Được đổi giờ miễn phí tuần này' : 'Đã đổi tuần này (reset thứ Hai)'}
                  </div>
                  {!isSubscribed && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-decoration-none p-0 mt-2 text-start"
                      onClick={subscribe}
                    >
                      🔔 Bật thông báo để Cowdi nhắc đúng giờ
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-cowdi-primary w-100 py-2 mt-auto"
                  onClick={handleBuyClock}
                  disabled={loading || wallet.milk < KEEP_RHYTHM_ITEMS.clock.priceMilk}
                >
                  {wallet.milk < KEEP_RHYTHM_ITEMS.clock.priceMilk ? 'Không đủ Sữa' : 'Mua vĩnh viễn (1 000 Sữa)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
