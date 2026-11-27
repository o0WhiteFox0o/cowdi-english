import { usePet } from '../../../../hooks/usePet';
import { PET_REGISTRY, getEvolutionInfo } from '../../../../data/pets';

/**
 * PetLine — chân màn cao cố định 72px cho màn Thân thiện (PHASE3 §1).
 * Hiển thị pet thu gọn + bong bóng 1–2 dòng từ Director/mẹo bài.
 */
export default function PetLine({ text, tone = 'neutral' }) {
  const { getActivePetWithDecay } = usePet();
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getEvolutionInfo(activePet.speciesId, activePet.evolution) : null;
  const imgSrc = evo?.image || '/assets/images/logo/MiniLogoCowdi.svg';
  const name = activePet?.customName || species?.name || 'Cowdi';

  const borderColor = tone === 'good'
    ? '#86EFAC'
    : tone === 'hint'
      ? '#FCD34D'
      : '#F0E2C4';

  return (
    <div className="ff-petline" style={{ borderColor }} role="status" aria-live="polite">
      <div className="ff-petline-avatar">
        <img src={imgSrc} alt={name} />
      </div>
      <div className="ff-petline-bubble">
        {text || `${name} đang cổ vũ bạn đấy!`}
      </div>
    </div>
  );
}
