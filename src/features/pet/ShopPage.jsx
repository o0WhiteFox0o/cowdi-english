import { useState, useMemo } from 'react';
import { useSEO } from '../../hooks/useSEO';
import { SEO_CONFIGS } from '../../data/seo-config';
import { usePet } from '../../hooks/usePet';
import { useUser } from '../../hooks/useUser';
import { SHOP_ITEMS, PET_REGISTRY } from '../../data/pets';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import InviteSheet from '../invite/InviteSheet';
import StreakShopSection from './StreakShopSection';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';

const CATEGORIES = [
  { id: 'streak', icon: '🔥', label: 'Giữ nhịp' },
  { id: 'hat', icon: '🎩', label: 'Mũ' },
  { id: 'outfit', icon: '👔', label: 'Trang phục' },
  { id: 'room', icon: '🏠', label: 'Phòng' },
  { id: 'effect', icon: '✨', label: 'Hiệu ứng' },
  { id: 'gift', icon: '🎁', label: 'Mời bạn' },
];

export default function ShopPage() {
  useSEO(SEO_CONFIGS['/shop']);
  const { petData, equipItem } = usePet();
  const { userData } = useUser();
  const showToast = useToast();
  const { play } = useSound();
  const [category, setCategory] = useState('streak');
  const [giftOpen, setGiftOpen] = useState(false);

  const wallet = userData.wallet || { milk: userData.availableXP || 0, gem: 0, stone: 0, stone_shard: 0 };

  const items = useMemo(() =>
    SHOP_ITEMS.filter((i) => i.category === category && i.category !== 'food'),
  [category]);

  const activePet = petData.collection[petData.activePetId];
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;

  function handleEquip(item) {
    if (!petData.activePetId) return;
    const slot = item.category;
    const currentlyEquipped = activePet?.cosmetics?.[slot];
    if (currentlyEquipped === item.id) {
      equipItem(petData.activePetId, slot, null);
      play('equip');
      showToast(`Đã tháo ${item.name}`, 'info');
    } else {
      equipItem(petData.activePetId, slot, item.id);
      play('equip');
      showToast(`Đã trang bị ${item.name}! ${item.emoji}`, 'success');
    }
  }

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold"><Icon name="bag" size={32} /> Cửa hàng</h2>
        <div className="d-flex justify-content-center align-items-center gap-3">
          <span className="badge bg-primary fs-6 px-3 py-2">🥛 {wallet.milk.toLocaleString('vi-VN')} Sữa</span>
          <span className="badge bg-info text-dark fs-6 px-3 py-2">💎 {wallet.gem.toLocaleString('vi-VN')} Gem</span>
        </div>
      </div>

      {/* Active pet preview */}
      {activePet && species && (
        <div className="card shadow-sm mb-4 text-center">
          <div className="card-body py-3">
            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              {activePet.cosmetics?.hat && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.hat)?.emoji} size={24} /></span>
              )}
              <span className="fs-1 emoji-big"><Emoji e={species.emoji} size={44} /></span>
              {activePet.cosmetics?.outfit && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.outfit)?.emoji} size={24} /></span>
              )}
              {activePet.cosmetics?.effect && (
                <span className="fs-4"><Emoji e={SHOP_ITEMS.find((i) => i.id === activePet.cosmetics.effect)?.emoji} size={24} /></span>
              )}
            </div>
            <div className="small text-muted mt-1">{activePet.customName} — Xem trước trang bị</div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-center">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`btn btn-sm rounded-pill ${category === c.id ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setCategory(c.id)}
          >
            <Emoji e={c.icon} size={16} /> {c.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {category === 'streak' ? (
        <StreakShopSection />
      ) : category === 'gift' ? (
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card shadow-sm text-center border-success">
              <div className="card-body py-4">
                <div className="fs-1 mb-2 emoji-big">🎁</div>
                <h5 className="fw-bold">Mời bạn học cùng Cowdi</h5>
                <p className="text-muted small mb-3">
                  Gửi thiệp mời bạn bè cùng học tiếng Anh! Nhận thưởng khi bạn bè hoàn thành các bài học đầu tiên.
                </p>
                <button
                  type="button"
                  className="btn btn-cowdi-primary w-100 py-2 d-inline-flex align-items-center justify-content-center gap-2"
                  onClick={() => setGiftOpen(true)}
                >
                  <Icon name="gift" size={18} /> Mời bạn học (Miễn phí)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="alert alert-secondary py-2 px-3 text-center mb-3 small">
            🎨 Đang tạm dừng bán vật phẩm trang trí cũ để chuẩn bị hệ thống Đồ trang trí Kinh tế v2 (Giai đoạn 4). Đồ bạn đã mua vẫn trang bị và tháo được bình thường!
          </div>
          <div className="row g-3">
          {items.map((item) => {
            const owned = petData.ownedItems.includes(item.id);
            const isEquippable = ['hat', 'outfit', 'room', 'effect'].includes(item.category);
            const isEquipped = activePet?.cosmetics?.[item.category] === item.id;

            return (
              <div className="col-6 col-md-4 col-lg-3" key={item.id}>
                <div className={`card h-100 shadow-sm ${isEquipped ? 'border-warning border-2' : owned ? 'border-success' : ''}`}>
                  <div className="card-body text-center py-3">
                    <div className="fs-1 mb-2 emoji-big"><Emoji e={item.emoji} size={44} /></div>
                    <h6 className="fw-bold small">{item.name}</h6>
                    <p className="text-muted mb-2" style={{ fontSize: '0.72rem' }}>{item.description}</p>

                    {owned && isEquippable ? (
                      <button
                        className={`btn btn-sm w-100 ${isEquipped ? 'btn-outline-warning' : 'btn-cowdi-primary'}`}
                        onClick={() => handleEquip(item)}
                      >
                        {isEquipped ? <><Icon name="x" size={16} /> Tháo</> : <><Icon name="check" size={16} /> Trang bị</>}
                      </button>
                    ) : owned ? (
                      <span className="badge bg-success">Đã sở hữu</span>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary w-100" disabled>
                        Tạm ngừng bán
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {/* Cách kiếm Sữa & Gem v2 */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3"><Icon name="bulb" size={18} /> Cách kiếm Sữa &amp; Gem</h6>
          <div className="row g-2 small">
            {[
              { icon: '🥛', text: 'Bài học mới hoàn thành', reward: '~170 Sữa' },
              { icon: '🥛', text: 'Ôn lại bài học đã xong', reward: '1/3 Sữa (~57)' },
              { icon: '📋', text: 'Nhiệm vụ hàng ngày', reward: '+30 Sữa/nhiệm vụ' },
              { icon: '⭐', text: 'Hoàn thành cả 3 nhiệm vụ ngày', reward: '+75 Sữa bonus' },
              { icon: '💯', text: 'Quiz trọn điểm (100%)', reward: '+45 Sữa' },
              { icon: '🔥', text: 'Streak 3 ngày liên tiếp', reward: '+60 Sữa' },
              { icon: '⚡', text: 'Streak 7 ngày liên tiếp', reward: '+150 Sữa' },
              { icon: '🏅', text: 'Mỗi thành tựu mới', reward: '+90 Sữa' },
              { icon: '💎', text: 'Mỗi 2 bài học mới hoàn thành', reward: '+1 Gem' },
              { icon: '💎', text: 'Hoàn thành Unit (Checkpoint)', reward: '+1 Gem' },
              { icon: '⭐', text: 'Unit đạt 100% (trọn điểm)', reward: '+2 Gem nữa' },
              { icon: '🪨', text: 'Đá nguyên tố', reward: '1 Đá / 10 bài mới hoặc đổi 15 Gem (1/tuần)' },
            ].map((tip, i) => (
              <div className="col-12 col-md-6" key={i}>
                <div className="d-flex align-items-center gap-2 p-2 rounded bg-light">
                  <span className="fs-5">{tip.icon}</span>
                  <span className="text-muted">{tip.text}</span>
                  <span className="fw-bold text-success ms-auto">{tip.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gift invite sheet */}
      <InviteSheet
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        prefilledMessage={'Mình mời bạn cùng học tiếng Anh trên Cowdi nè 🎁\nVào học cùng mình nha!'}
      />
    </div>
  );
}
