import { useEffect } from 'react';
import Icon from '../../../components/Icon';
import { SLOT_META, SCREEN_PLAY_RULES } from '../../../data/config/screens';

/**
 * ScreenIntro — Màn chuyển 1,5 giây (Mới học 3 giây) trước mỗi màn (PHASE1 §5.3).
 * Hiện biểu tượng kỹ năng + tên màn + 1 dòng luật chơi cố định + câu pet.
 * Chạm bất kỳ đâu để bỏ qua ngay.
 */
export default function ScreenIntro({ screen, screenMeta, index, total, group, petLine, onFinish }) {
  const slotMeta = SLOT_META[screen?.slot] || SLOT_META.intro;
  const playRule = SCREEN_PLAY_RULES[screen?.code] || 'Hoàn thành các lượt học trong màn này nhé!';
  const durationMs = group === 'beginner' ? 3000 : 1500;

  useEffect(() => {
    const t = setTimeout(() => onFinish?.(), durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onFinish, screen?.code, index]);

  return (
    <div
      className="ss-intro-stage"
      onClick={() => onFinish?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFinish?.(); }}
      aria-label={`Chuyển sang màn ${index + 1}: ${screenMeta?.name || slotMeta.label}. Chạm để bắt đầu ngay.`}
    >
      <div className="ss-intro-badge" style={{ background: slotMeta.color }}>
        <Icon name={slotMeta.icon} size={34} />
      </div>
      <div className="ss-intro-step">Màn {index + 1} / {total} · {slotMeta.label}</div>
      <h2 className="ss-intro-title">{screenMeta?.name || slotMeta.label}</h2>
      <p className="ss-intro-rule">{playRule}</p>
      {petLine && (
        <div className="ss-intro-pet-bubble">
          🐮 {petLine}
        </div>
      )}
      <div className="ss-intro-hint">Chạm để vào ngay</div>
    </div>
  );
}
