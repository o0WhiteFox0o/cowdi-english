import { createContext, useContext, useEffect } from 'react';
import Icon from '../../../../components/Icon';
import { SLOT_META } from '../../../../data/config/screens';
import PetLine from './PetLine';
import './friendly.css';

/**
 * Context nối câu hướng dẫn của màn Thân thiện (F-01..F-11) lên Pet bên trái (PetStage)
 * trên màn hình ngang/desktop, để tránh lặp 2 pet cùng lúc.
 */
export const ScreenPetGuideContext = createContext(null);

/**
 * FriendlyFrame — Khung chung cho các màn Thân thiện.
 * - Màn hình điện thoại: hiện PetLine gọn ở chân màn.
 * - Màn hình ngang (có PetStage bên trái): Pet bên trái nói petText, PetLine bên dưới tự ẩn bằng CSS.
 */
export default function FriendlyFrame({
  skill = 'intro',
  title,
  code,
  counter,
  extraRight = null,
  showGrammarButton = false,
  onOpenGrammar,
  petText,
  petTone = 'neutral',
  children,
}) {
  const meta = SLOT_META[skill] || SLOT_META.intro;
  const setPetGuide = useContext(ScreenPetGuideContext);

  useEffect(() => {
    if (!setPetGuide) return undefined;
    setPetGuide({ text: petText || '', tone: petTone || 'neutral' });
    return () => setPetGuide(null);
  }, [setPetGuide, petText, petTone]);

  return (
    <div className="ff-shell">
      <div className="ff-header">
        <div className="ff-chip-group">
          <span className="ff-skill-chip" style={{ background: meta.color }}>
            <Icon name={meta.icon} size={14} /> {meta.label}
          </span>
          <span className="ff-title">{title}</span>
          {code && <span className="ff-code">{code}</span>}
        </div>
        <div className="ff-header-right">
          {showGrammarButton && typeof onOpenGrammar === 'function' && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
              style={{ fontSize: '0.74rem', minHeight: 30 }}
              onClick={onOpenGrammar}
            >
              📖 Ngữ pháp
            </button>
          )}
          {extraRight}
          {counter && <span className="ff-counter">{counter}</span>}
        </div>
      </div>

      <div className="ff-body">
        {children}
      </div>

      <PetLine text={petText} tone={petTone} />
    </div>
  );
}
