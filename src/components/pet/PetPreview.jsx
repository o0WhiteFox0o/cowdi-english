import { PetAvatar, bondOf, topSkillOf } from '../../pet-rig/PetAvatar';
import { getEvolutionInfo, SHOP_ITEMS, PET_REGISTRY } from '../../data/pets';
import { COSMETIC_MAP } from '../../../shared/cosmetics-data.js';
import Emoji from '../Emoji';

export default function PetPreview({
  pet,
  previewItem = null,
  previewType = 'room',
  className = '',
  style = {},
  height = 180,
}) {
  if (!pet) return null;
  const species = PET_REGISTRY[pet.speciesId];
  if (!species) return null;
  const evo = getEvolutionInfo(pet.speciesId, pet.evolution);

  // 1. Nền (Backgrounds / Rooms)
  const isBgPreview = previewItem && (previewType === 'room' || previewItem.bgStyle);
  let activeBg = '#f8f9fa';
  let activeRoom = null;

  if (isBgPreview) {
    activeBg = previewItem.bgStyle || '#e8f5e9';
    activeRoom = previewItem;
  } else if (pet.cosmetics?.room) {
    activeRoom = COSMETIC_MAP[pet.cosmetics.room] || SHOP_ITEMS.find((i) => i.id === pet.cosmetics.room);
    if (activeRoom?.bgStyle) {
      activeBg = activeRoom.bgStyle;
    }
  }

  // 2. Hào quang (Effects / Auras)
  const isAuraPreview = previewItem && (previewType === 'effect' || previewItem.emoji);
  const activeAura = isAuraPreview
    ? previewItem
    : (pet.cosmetics?.effect
        ? (COSMETIC_MAP[pet.cosmetics.effect] || SHOP_ITEMS.find((i) => i.id === pet.cosmetics.effect))
        : null);

  // 3. Mũ & Trang phục đang mặc
  const activeHat = pet.cosmetics?.hat ? SHOP_ITEMS.find((i) => i.id === pet.cosmetics.hat) : null;
  const activeOutfit = pet.cosmetics?.outfit ? SHOP_ITEMS.find((i) => i.id === pet.cosmetics.outfit) : null;

  return (
    <div
      className={`pet-preview-box position-relative d-flex flex-column align-items-center justify-content-center overflow-hidden ${className}`}
      style={{
        background: activeBg,
        minHeight: `${height}px`,
        borderRadius: '16px',
        transition: 'background 0.3s ease, border-color 0.25s ease',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)',
        ...style,
      }}
    >
      {/* Hiệu ứng nền nhẹ trang trí theo chủ đề nếu có */}
      {activeRoom?.id === 'room_space' && (
        <div className="position-absolute w-100 h-100 pointer-events-none opacity-25" style={{ zIndex: 1 }}>
          <span style={{ position: 'absolute', top: '10px', left: '15%' }}>✨</span>
          <span style={{ position: 'absolute', top: '25px', right: '20%' }}>⭐</span>
          <span style={{ position: 'absolute', bottom: '15px', left: '30%' }}>🌟</span>
        </div>
      )}
      {activeRoom?.id === 'room_cherry_garden' && (
        <div className="position-absolute w-100 h-100 pointer-events-none opacity-35" style={{ zIndex: 1 }}>
          <span style={{ position: 'absolute', top: '15px', left: '10%', animation: 'petPetalDrift 4s ease-in-out infinite' }}>🌸</span>
          <span style={{ position: 'absolute', top: '40px', right: '12%', animation: 'petPetalDrift 3.5s ease-in-out infinite 1s' }}>🌸</span>
        </div>
      )}

      {/* 1. Hào quang (z-index 4) */}
      {activeAura && (
        <div
          className="position-absolute w-100 h-100 pointer-events-none"
          style={{ zIndex: 4, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          {/* Điểm hào quang góc trên phải */}
          <span
            className="position-absolute"
            style={{
              top: '12px',
              right: '24px',
              filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.75))',
              animation: activeAura.id === 'effect_galaxy_spin'
                ? 'petGalaxySpin 8s linear infinite'
                : 'petAuraSparkle 2s ease-in-out infinite',
            }}
          >
            <Emoji e={activeAura.emoji} size={30} />
          </span>

          {/* Điểm hào quang góc dưới trái */}
          <span
            className="position-absolute opacity-75"
            style={{
              bottom: '16px',
              left: '24px',
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.55))',
              animation: activeAura.id === 'effect_galaxy_spin'
                ? 'petGalaxySpin 8s linear infinite reverse'
                : 'petAuraSparkle 2.4s ease-in-out infinite reverse',
            }}
          >
            <Emoji e={activeAura.emoji} size={24} />
          </span>

          {/* Hào quang đặc biệt: Rồng vàng bay lượn trên đầu */}
          {activeAura.id === 'effect_golden_dragon' && (
            <span
              className="position-absolute"
              style={{
                top: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.85))',
                animation: 'petAuraSparkle 2.8s ease-in-out infinite',
              }}
            >
              <Emoji e="🐉" size={28} />
            </span>
          )}

          {/* Hào quang Toàn năng: Vòng ánh sáng cầu vồng bao quanh */}
          {activeAura.id === 'effect_almighty' && (
            <div
              className="position-absolute"
              style={{
                top: '50%',
                left: '50%',
                width: '120px',
                height: '120px',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                boxShadow: '0 0 25px rgba(255, 105, 180, 0.4), inset 0 0 20px rgba(0, 191, 255, 0.3)',
                animation: 'petRainbowPulse 3s ease-in-out infinite',
              }}
            />
          )}
        </div>
      )}

      {/* 2. Mũ đang mặc (z-index 5) */}
      {activeHat && (
        <div
          className="position-absolute"
          style={{
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <Emoji e={activeHat.emoji} size={38} />
        </div>
      )}

      {/* 3. Pet Avatar (live rig hoặc fallback ảnh tĩnh đúng cấp tiến hoá, z-index 2) */}
      <div
        className="pet-image-wrapper position-relative d-flex align-items-center justify-content-center"
        style={{ zIndex: 2, height: '140px', width: '100%' }}
      >
        <PetAvatar
          petId={pet.speciesId}
          stage={(pet.evolution || 0) + 1}
          group={species.group}
          bond={bondOf(pet.skills)}
          topSkill={topSkillOf(pet.skills)}
          mode="home"
          fallbackSrc={evo?.image}
          alt={evo?.name || pet.customName || species.name}
          className="pet-character-img"
          style={{ maxHeight: '135px', maxWidth: '140px', objectFit: 'contain' }}
        />
      </div>

      {/* 4. Trang phục đang mặc (z-index 5) */}
      {activeOutfit && (
        <div
          className="position-relative"
          style={{
            zIndex: 5,
            marginTop: '-10px',
            pointerEvents: 'none',
          }}
        >
          <Emoji e={activeOutfit.emoji} size={26} />
        </div>
      )}

      <style>{`
        @keyframes petAuraSparkle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.9; }
          50% { transform: translateY(-5px) scale(1.1); opacity: 1; }
        }
        @keyframes petGalaxySpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes petRainbowPulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes petPetalDrift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(8px) rotate(20deg); }
        }
      `}</style>
    </div>
  );
}
