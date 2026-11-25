// <PathPet> & <PathPetCard> — Pet sống đứng cạnh node current trên bản đồ Lộ trình (GĐ2).
// Dùng <PetAvatar mode="home" canvasBubble={false}> + <PetThought> (Tầng 2) + Thẻ hành động đáy bản đồ.
import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PetAvatar, bondOf, topSkillOf } from '../pet-rig/PetAvatar';
import { PET_REGISTRY, getEvolutionInfo } from '../data/pets';
import { usePetDirector } from './DirectorContext';
import PetThought from './PetThought';

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E9A35" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
    </svg>
  );
}

export function PathPet({ pet, petRef, side = 'left' }) {
  const { dispatch, speech, thought } = usePetDirector();

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

  const hasCard = Boolean(speech && speech.slot === 'path');
  const activeThought = !hasCard && thought && thought.slot === 'path' ? thought.icon : null;

  return (
    <div className={`pd-path-pet ${side}`}>
      {activeThought && <PetThought icon={activeThought} className="pd-path-pet-thought" />}
      <div className="pd-path-pet-btn" aria-label={`Chạm vào ${petName}`}>
        <PetAvatar
          ref={petRef}
          petId={pet.speciesId}
          stage={(pet.evolution || 0) + 1}
          group={species?.group}
          bond={bondOf(pet.skills)}
          topSkill={topSkillOf(pet.skills)}
          mode="home"
          canvasBubble={false}
          fallbackSrc={evo?.image}
          alt={petName}
          className="pd-path-pet-avatar"
          imgClassName="pd-path-pet-avatar"
          onClip={handleClip}
        />
      </div>
    </div>
  );
}

export function PathPetCard({ petName = 'Cowdi', currentNode, onStartCheckpoint }) {
  const { speech, dismissSpeech, speakText, nextLessonHref } = usePetDirector();
  const cardRef = useRef(null);
  const openScrollYRef = useRef(0);

  const visible = Boolean(speech && speech.slot === 'path' && speech.vi);

  // Đóng thẻ khi chạm ra ngoài hoặc cuộn bản đồ (> 40px)
  useEffect(() => {
    if (!visible) return undefined;
    openScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

    const onPointerDown = (e) => {
      if (cardRef.current && cardRef.current.contains(e.target)) return;
      if (e.target.closest?.('.pd-path-pet')) return;
      dismissSpeech();
    };
    const onScroll = () => {
      if (Math.abs((window.scrollY || 0) - openScrollYRef.current) > 40) {
        dismissSpeech();
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') dismissSpeech();
    };

    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('keydown', onKeyDown);
    }, 120);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [visible, speech?.id, dismissSpeech]);

  if (!visible) return null;

  const isCheckpoint = currentNode?.type === 'checkpoint';
  const lessonHref = currentNode?.type === 'lesson'
    ? `/lessons/${currentNode.lessonId}`
    : nextLessonHref;

  return (
    <div className="pd-path-card-wrap">
      <div
        ref={cardRef}
        className="pd-path-card"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          className="pd-speech-close"
          onClick={dismissSpeech}
          aria-label="Đóng"
        >
          ×
        </button>

        <div className="pd-speech-row">
          {speech.en && (
            <button
              type="button"
              className="pd-speech-speak"
              onClick={() => speakText(speech.en)}
              aria-label={`Nghe lại ${speech.en}`}
            >
              <SpeakerIcon />
            </button>
          )}
          <div className="pd-path-card-msg">
            <b>{petName}:</b> {speech.vi}
          </div>
        </div>

        <div className="pd-path-card-actions">
          {isCheckpoint && onStartCheckpoint ? (
            <button
              type="button"
              className="pd-cta-btn pd-cta-btn--primary"
              onClick={() => {
                dismissSpeech();
                onStartCheckpoint(currentNode.unit, currentNode.isTestOut);
              }}
            >
              Học tiếp
            </button>
          ) : (
            <Link
              to={lessonHref}
              className="pd-cta-btn pd-cta-btn--primary"
              onClick={dismissSpeech}
            >
              Học tiếp
            </Link>
          )}
          {/* Nút "Nói chuyện" (Tầng 4 AI Chat) ẩn ở GĐ1–2 theo SDD mục 6.2 & 11 */}
          <button
            type="button"
            className="pd-cta-btn pd-cta-btn--ghost"
            onClick={dismissSpeech}
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}

export default PathPet;
