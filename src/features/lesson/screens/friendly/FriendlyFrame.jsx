import Icon from '../../../../components/Icon';
import { SLOT_META } from '../../../../data/config/screens';
import PetLine from './PetLine';
import './friendly.css';

/**
 * FriendlyFrame — Khung chung cho 5 màn Thân thiện (PHASE3 §1).
 * Nhãn kỹ năng dưới RouteHeader + vùng nội dung flex:1 min-height:0 + PetLine 72px ở chân màn.
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
              className="btn btn-sm btn-outline-secondary rounded-pill"
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
