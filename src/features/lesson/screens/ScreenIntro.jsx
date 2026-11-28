import { useEffect, useCallback } from 'react';
import Icon from '../../../components/Icon';
import { SLOT_META, SCREEN_PLAY_RULES } from '../../../data/config/screens';
import { getScreenTitle } from '../../../../shared/screen-scenarios';
import { speakWord, stopSpeaking } from '../../../utils/speech';

/**
 * ScreenIntro — Màn chuyển ngắn trước mỗi màn (PHASE1 §5.3 + GEMINI-STORY-INTRO-S2 §1).
 * Hiện biểu tượng kỹ năng + tên màn (theo kịch bản vùng) + câu dẫn vi (có loa đọc) + dòng en nhỏ.
 * Chạm bất kỳ đâu để bỏ qua ngay; không cuộn ở 360×640.
 */
export default function ScreenIntro({
  screen,
  screenMeta,
  region = null,
  index,
  total,
  group,
  petLine,
  intro = null,
  muted = false,
  ttsRate = 0.85,
  onFinish,
}) {
  const slotMeta = SLOT_META[screen?.slot] || SLOT_META.intro;
  const displayTitle = getScreenTitle(screen?.code, region, screenMeta?.name || slotMeta.label);
  const playRule = SCREEN_PLAY_RULES[screen?.code] || 'Hoàn thành các lượt học trong màn này nhé!';
  const viText = intro?.vi || petLine || '';
  const enText = intro?.en || '';
  const durationMs = group === 'beginner' ? 3000 : (enText ? 2200 : 1500);

  useEffect(() => {
    const t = setTimeout(() => onFinish?.(), durationMs);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
  }, [durationMs, onFinish, screen?.code, index]);

  const handleSpeak = useCallback((e) => {
    e.stopPropagation();
    if (muted) return;
    if (enText) {
      speakWord(enText, { rate: ttsRate, lang: 'en-US' }).catch(() => {});
    } else if (viText) {
      speakWord(viText, { rate: 1.0, lang: 'vi-VN' }).catch(() => {});
    }
  }, [muted, enText, viText, ttsRate]);

  return (
    <div
      className="ss-intro-stage"
      onClick={() => onFinish?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFinish?.(); }}
      aria-label={`Chuyển sang màn ${index + 1}: ${displayTitle}. Chạm để bắt đầu ngay.`}
    >
      <div className="ss-intro-badge" style={{ background: slotMeta.color }}>
        <Icon name={slotMeta.icon} size={34} />
      </div>
      <div className="ss-intro-step">Màn {index + 1} / {total} · {slotMeta.label}</div>
      <h2 className="ss-intro-title">{displayTitle}</h2>
      {!viText && <p className="ss-intro-rule">{playRule}</p>}
      {viText && (
        <div className="ss-intro-pet-bubble">
          <div className="d-flex align-items-start gap-2 text-start">
            <span aria-hidden="true" style={{ flexShrink: 0 }}>🐮</span>
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <div>{viText}</div>
              {enText && (
                <div className="small fst-italic mt-1" style={{ color: '#7C6550', fontSize: '0.8rem' }}>
                  {enText}
                </div>
              )}
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={handleSpeak}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSpeak(e); }}
              aria-label="Nghe câu dẫn"
              title="Nghe câu dẫn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid #E5D4B3',
                color: '#4A3420',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <Icon name="sound" size={14} />
            </span>
          </div>
        </div>
      )}
      <div className="ss-intro-hint">Chạm để vào ngay</div>
    </div>
  );
}
