// <PetStage> — Sân khấu pet trong bài học & luyện tập (thay .study-pet-dock).
// Hỗ trợ 2 mật độ: standard (học từ/flashcard/PictureLesson) và compact (Quiz — bảo toàn Zero-Scroll Quiz).
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
  maxWidth,
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
    <div
      className={`pd-stage${compact ? ' pd-stage--compact' : ''}`}
      style={maxWidth ? { maxWidth, marginInline: 'auto' } : undefined}
    >
      <div className="pd-stage-grass" aria-hidden="true" />

      {streak >= 2 && (
        <span className="pd-stage-streak" aria-label={`Chuỗi ${streak} câu đúng liên tiếp`}>
          {streak} câu liền
        </span>
      )}

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

      <div className="pd-stage-right">
        {activeSpeech ? (
          <PetSpeech speech={activeSpeech} placement="right" onSpeak={onSpeak} />
        ) : (
          <div className="pd-stage-idle">
            <div className="pd-stage-name">{petName} đang học cùng bạn</div>
            {subtitle && <div className="pd-stage-sub">{subtitle}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
