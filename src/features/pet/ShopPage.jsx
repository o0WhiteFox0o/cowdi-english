import { useState, useMemo } from 'react';
import { usePet } from '../../hooks/usePet';
import { SHOP_ITEMS, PET_REGISTRY } from '../../data/pets';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import InviteSheet from '../invite/InviteSheet';

const CATEGORIES = [
  { id: 'hat', icon: '🎩', label: 'Mũ' },
  { id: 'outfit', icon: '👔', label: 'Trang phục' },
  { id: 'room', icon: '🏠', label: 'Phòng' },
  { id: 'effect', icon: '✨', label: 'Hiệu ứng' },
  { id: 'food', icon: '🍕', label: 'Đồ ăn' },
  { id: 'gift', icon: '🎁', label: 'Quà tặng' },
];

export default function ShopPage() {
  const { petData, buyItem, equipItem, useFood, spendCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();
  const [category, setCategory] = useState('hat');
  const [giftOpen, setGiftOpen] = useState(false);

  const items = useMemo(() =>
    SHOP_ITEMS.filter((i) => i.category === category),
  [category]);

  const activePet = petData.collection[petData.activePetId];
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;

  function handleBuy(item) {
    // Gift item: tiêu hao ngay, mở InviteSheet thay vì thêm vào ownedItems
    if (item.category === 'gift') {
      if (petData.coins < item.price) {
        play('denied');
        showToast('Không đủ coins! 💸', 'warning');
        return;
      }
      if (!spendCoins(item.price)) {
        showToast('Không đủ coins! 💸', 'warning');
        return;
      }
      play('purchase');
      showToast(`Đã đổi ${item.name}! Mở thiệp tặng bạn... 🎁`, 'success');
      setGiftOpen(true);
      return;
    }
    const ok = buyItem(item.id, item.price);
    if (ok) {
      play('purchase');
      showToast(`Đã mua ${item.name}! ${item.emoji}`, 'success');
    } else {
      play('denied');
      showToast('Không đủ coins! 💸', 'warning');
    }
  }

  function handleEquip(item) {
    if (!petData.activePetId) return;
    const slot = item.category;
    const currentlyEquipped = activePet?.cosmetics?.[slot];
    if (currentlyEquipped === item.id) {
      // Unequip
      equipItem(petData.activePetId, slot, null);
      play('equip');
      showToast(`Đã tháo ${item.name}`, 'info');
    } else {
      equipItem(petData.activePetId, slot, item.id);
      play('equip');
      showToast(`Đã trang bị ${item.name}! ${item.emoji}`, 'success');
    }
  }

  function handleUseFood(item) {
    const ok = useFood(item.id);
    if (ok) {
      play('petEat');
      // Remove from owned after use
      showToast(`${activePet?.customName || 'Pet'} đã ăn ${item.name}! ${item.emoji}`, 'success');
    }
  }

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">🛍️ Cửa hàng</h2>
        <div className="d-flex justify-content-center align-items-center gap-2">
          <span className="badge bg-warning text-dark fs-6">🪙 {petData.coins} Coins</span>
        </div>
      </div>

      {/* Active pet preview */}
      {activePet && species && (
        <div className="card shadow-sm mb-4 text-center">
          <div className="card-body py-3">
            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              {activePet.cosmetics?.hat && (
                <span className="fs-4">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.hat)?.emoji}</span>
              )}
              <span className="fs-1">{species.emoji}</span>
              {activePet.cosmetics?.outfit && (
                <span className="fs-4">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.outfit)?.emoji}</span>
              )}
              {activePet.cosmetics?.effect && (
                <span className="fs-4">{SHOP_ITEMS.find(i => i.id === activePet.cosmetics.effect)?.emoji}</span>
              )}
            </div>
            <div className="small text-muted mt-1">{activePet.customName} — Xem trước trang bị</div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-center">
        {CATEGORIES.map((c) => (
          <button key={c.id}
            className={`btn btn-sm rounded-pill ${category === c.id ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setCategory(c.id)}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="row g-3">
        {items.map((item) => {
          const isGift = item.category === 'gift';
          const owned = !isGift && petData.ownedItems.includes(item.id);
          const isFood = item.category === 'food';
          const isEquippable = ['hat', 'outfit', 'room', 'effect'].includes(item.category);
          const isEquipped = activePet?.cosmetics?.[item.category] === item.id;

          return (
            <div className="col-6 col-md-4 col-lg-3" key={item.id}>
              <div className={`card h-100 shadow-sm ${isEquipped ? 'border-warning border-2' : owned ? 'border-success' : ''}`}>
                <div className="card-body text-center py-3">
                  <div className="fs-1 mb-2">{item.emoji}</div>
                  <h6 className="fw-bold small">{item.name}</h6>
                  <p className="text-muted mb-2" style={{ fontSize: '0.72rem' }}>{item.description}</p>

                  {isGift ? (
                    <button
                      className={`btn btn-sm w-100 ${petData.coins >= item.price ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handleBuy(item)}
                      disabled={petData.coins < item.price}
                    >
                      🎁 Tặng bạn — 🪙 {item.price}
                    </button>
                  ) : !owned ? (
                    <button
                      className={`btn btn-sm w-100 ${petData.coins >= item.price ? 'btn-warning' : 'btn-outline-secondary'}`}
                      onClick={() => handleBuy(item)}
                      disabled={petData.coins < item.price}
                    >
                      🪙 {item.price}
                    </button>
                  ) : isFood ? (
                    <button className="btn btn-sm btn-success w-100" onClick={() => handleUseFood(item)}>
                      🍽️ Sử dụng
                    </button>
                  ) : isEquippable ? (
                    <button
                      className={`btn btn-sm w-100 ${isEquipped ? 'btn-outline-warning' : 'btn-cowdi-primary'}`}
                      onClick={() => handleEquip(item)}
                    >
                      {isEquipped ? '❌ Tháo' : '✅ Trang bị'}
                    </button>
                  ) : (
                    <span className="badge bg-success">Đã sở hữu</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How to earn coins */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h6 className="fw-bold mb-2">💡 Cách kiếm Coins</h6>
          <div className="row g-2 small">
            {[
              { icon: '📋', text: 'Nhiệm vụ hàng ngày', coins: '+10/nhiệm vụ' },
              { icon: '⭐', text: 'Hoàn thành cả 3 nhiệm vụ', coins: '+25 bonus' },
              { icon: '💯', text: 'Perfect quiz', coins: '+15' },
              { icon: '🔥', text: 'Streak 3 ngày', coins: '+20' },
              { icon: '⚡', text: 'Streak 7 ngày', coins: '+50' },
              { icon: '🏅', text: 'Mỗi achievement mới', coins: '+30' },
            ].map((tip, i) => (
              <div className="col-6 col-md-4" key={i}>
                <div className="d-flex align-items-center gap-1">
                  <span>{tip.icon}</span>
                  <span className="text-muted">{tip.text}</span>
                  <span className="fw-bold text-success ms-auto">{tip.coins}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gift invite sheet — opened after buying gift_egg */}
      <InviteSheet
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        prefilledMessage={'Mình tặng bạn một quả trứng Cowdi 🎁\nHọc tiếng Anh cùng mình nha!'}
      />
    </div>
  );
}
