import { PetAvatar, bondOf, topSkillOf } from '../../pet-rig/PetAvatar';
import { getEvolutionInfo, SHOP_ITEMS, PET_REGISTRY } from '../../data/pets';
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

  // Nền xem thử (phủ phía sau pet)
  const isBgPreview = previewItem && (previewType === 'room' || previewItem.bgStyle);
  const activeBg = isBgPreview
    ? previewItem.bgStyle
    : (pet.cosmetics?.room ? '#e8f5e9' : '#f8f9fa');

  // Hào quang xem thử (phủ quanh / trên pet qua z-index)
  const isAuraPreview = previewItem && (previewType === 'effect' || previewItem.emoji);
  const activeAura = isAuraPreview
    ? previewItem
    : (pet.cosmetics?.effect ? SHOP_ITEMS.find((i) => i.id === pet.cosmetics.effect) : null);

  // Mũ & Trang phục đang mặc
  const activeHat = pet.cosmetics?.hat ? SHOP_ITEMS.find((i) => i.id === pet.cosmetics.hat) : null;
  const activeOutfit = pet.cosmetics?.outfit ? SHOP_ITEMS.find((i) => i.id === pet.cosmetics.outfit) : null;

  return (
    <div
      className={`pet-preview-box position-relative d-flex flex-column align-items-center justify-content-center overflow-hidden ${className}`}
      style={{
        backgroundColor: activeBg,
        minHeight: `${height}px`,
        borderRadius: '16px',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
        ...style,
      }}
    >
      {/* 1. Hào quang xem thử phủ quanh/trên pet (z-index 4) */}
      {activeAura && (
        <div
          className="position-absolute w-100 h-100 pointer-events-none"
          style={{ zIndex: 4, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <span
            className="fs-2 position-absolute"
            style={{
              top: '12px',
              right: '24px',
              filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))',
              animation: 'petAuraSparkle 2s ease-in-out infinite',
            }}
          >
            <Emoji e={activeAura.emoji} size={30} />
          </span>
          <span
            className="fs-3 position-absolute opacity-75"
            style={{
              bottom: '16px',
              left: '24px',
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))',
              animation: 'petAuraSparkle 2.4s ease-in-out infinite reverse',
            }}
          >
            <Emoji e={activeAura.emoji} size={24} />
          </span>
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
      `}</style>
    </div>
  );
}
