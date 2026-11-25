// <PetStage> — Sân khấu đồng hành cùng Cowdi (khớp phác thảo V2).
// Desktop (≥ 992px): đứng gọn trong cột đồng hành sticky cạnh nội dung học (không kéo dài trống trải).
// Mobile (< 992px): thẻ ngang ngay phía trên bài tập (Cowdi trái, bong bóng trắng phải, cỏ cong đáy).
import { useCallback, useEffect } from 'react';
import { PetAvatar, bondOf, topSkillOf } from '../pet-rig/PetAvatar';
import { PET_REGISTRY, getEvolutionInfo } from '../data/pets';
import { usePetDirector } from './DirectorContext';
import PetSpeech from './PetSpeech';
import PetThought from './PetThought';

export default function PetStage({
  pet,
  petRef,
  mode = 'lesson',
  subtitle = '',
  streak = 0,
  compact = false,
  slot = 'lesson',
  onSpeak,
}) {
  const { register, dispatch, speech, thought } = usePetDirector();

  useEffect(() => {
    if (!pet) return undefined;
    return register(slot, petRef);
  }, [pet, slot, petRef, register]);

  const handleClip = useCallback(
    (evt) => {
      if (evt === 'tap') {
        dispatch('pet_tap');
      }
    },
    [dispatch]
  );

  if (!pet) return null;

  const species = PET_REGISTRY[pet.speciesId] || null;
  const evo = species ? getEvolutionInfo(pet.speciesId, pet.evolution) : null;
  const petName = pet.customName || species?.name || 'Cowdi';

  const activeSpeech = speech && speech.slot === slot ? speech : null;
  const activeThought = !activeSpeech && thought && thought.slot === slot ? thought.icon : null;

  return (
    <div className={`pd-stage${compact ? ' pd-stage--compact' : ''}`}>
      {/* Nền cỏ cong + 3 hạt trang trí nhẹ theo phác thảo V2 */}
      <div className="pd-stage-grass" aria-hidden="true" />
      <span className="pd-stage-deco pd-stage-deco--a" aria-hidden="true" />
      <span className="pd-stage-deco pd-stage-deco--b" aria-hidden="true" />
      <span className="pd-stage-deco pd-stage-deco--c" aria-hidden="true" />

      {streak >= 2 && (
        <span className="pd-stage-streak" aria-label={`Chuỗi ${streak} câu đúng liên tiếp`}>
          {streak} câu liền
        </span>
      )}

      {/* Vùng thoại (trên Desktop nằm trên đầu Cowdi, trên Mobile nằm bên phải Cowdi) */}
      <div className="pd-stage-speech-zone">
        {activeSpeech ? (
          <PetSpeech speech={activeSpeech} placement="right" onSpeak={onSpeak} />
        ) : subtitle ? (
          <div className="pd-stage-hint-pill">{subtitle}</div>
        ) : null}
      </div>

      {/* Nhân vật Pet sống động đứng trên dải cỏ */}
      <div className="pd-stage-avatar-wrap">
        {activeThought && <PetThought icon={activeThought} className="pd-stage-thought" />}
        <PetAvatar
          ref={petRef}
          petId={pet.speciesId}
          stage={(pet.evolution || 0) + 1}
          group={species?.group}
          bond={bondOf(pet.skills)}
          topSkill={topSkillOf(pet.skills)}
          mode={mode}
          canvasBubble={false}
          fallbackSrc={evo?.image}
          alt={petName}
          className="pd-stage-avatar"
          imgClassName="pd-stage-avatar pd-stage-avatar--img"
          onClip={handleClip}
        />
      </div>
    </div>
  );
}
