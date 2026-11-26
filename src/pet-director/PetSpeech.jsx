// <PetSpeech> — bong bóng chữ DOM chuẩn font Mali, không xoay, không position: fixed.
import { Link } from 'react-router-dom';
import { usePetDirector } from './DirectorContext';

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E9A35" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
    </svg>
  );
}

export default function PetSpeech({
  speech,
  placement = 'right',
  onSpeak,
  onDismiss,
  onAction,
  className = '',
}) {
  const { speakText, dismissSpeech, nextLessonHref } = usePetDirector();
  if (!speech || !speech.vi) return null;

  const handleSpeak = () => {
    if (!speech.en) return;
    if (onSpeak) onSpeak(speech.en);
    else speakText(speech.en);
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
    else dismissSpeech();
  };

  const cta = speech.cta || null;
  const ctaTo = cta?.to || (cta?.action === 'continue_lesson' ? nextLessonHref : cta?.action === 'open_pet' ? '/pet' : null);

  return (
    <div
      className={`pd-speech pd-speech--${placement}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
    >
      {cta && (
        <button
          type="button"
          className="pd-speech-close"
          onClick={handleDismiss}
          aria-label="Đóng"
        >
          ×
        </button>
      )}

      <div className="pd-speech-row">
        {speech.en && (
          <button
            type="button"
            className="pd-speech-speak"
            onClick={handleSpeak}
            aria-label={`Nghe lại ${speech.en}`}
            title={`Nghe: ${speech.en}`}
          >
            <SpeakerIcon />
          </button>
        )}
        <p className="pd-speech-text">{speech.vi}</p>
      </div>

      {cta && (
        <div className="pd-speech-actions">
          {ctaTo ? (
            <Link
              to={ctaTo}
              className="pd-cta-btn pd-cta-btn--primary"
              onClick={() => {
                onAction?.(cta);
                handleDismiss();
              }}
            >
              {cta.label}
            </Link>
          ) : (
            <button
              type="button"
              className="pd-cta-btn pd-cta-btn--primary"
              onClick={() => {
                onAction?.(cta);
                handleDismiss();
              }}
            >
              {cta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
