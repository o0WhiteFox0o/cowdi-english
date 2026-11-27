import Icon from '../../../components/Icon';
import { SLOT_META } from '../../../data/config/screens';

/**
 * RouteHeader — Thanh vòng kỹ năng trên cùng trong ScreenHost (PHASE1 §5.2).
 * ✕ · một vòng tròn biểu tượng kỹ năng cho mỗi màn trong screens · ⏸
 * Kèm dòng nhãn kỹ năng + "Màn x/n" + nút "Xem ngữ pháp" (khi đang ở màn Viết).
 */
export default function RouteHeader({
  screens = [],
  currentIndex = 0,
  currentScreenMeta,
  paused,
  onRequestExit,
  onTogglePause,
  showGrammarButton,
  onOpenGrammar,
}) {
  const curSlot = screens[currentIndex]?.slot;
  const curMeta = SLOT_META[curSlot] || SLOT_META.intro;

  return (
    <header className="ss-route-header">
      <div className="ss-route-top">
        <button
          type="button"
          className="ss-icon-btn"
          onClick={onRequestExit}
          aria-label="Thoát bài học"
        >
          ✕
        </button>

        <nav className="ss-circles" aria-label="Tiến độ các màn học">
          {screens.map((sc, i) => {
            const meta = SLOT_META[sc.slot] || SLOT_META.intro;
            const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
            const stateVi = state === 'done' ? 'đã xong' : state === 'current' ? 'đang học' : 'chưa tới';
            return (
              <div
                key={`${sc.slot}-${i}`}
                className={`ss-circle is-${state}`}
                style={{ '--slot-color': meta.color }}
                aria-label={`Màn ${i + 1}, ${meta.label}, ${stateVi}`}
                title={`Màn ${i + 1}: ${meta.label} (${sc.code})`}
              >
                <Icon name={meta.icon} size={state === 'current' ? 16 : 13} />
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          className="ss-icon-btn"
          onClick={onTogglePause}
          aria-label={paused ? 'Tiếp tục' : 'Tạm dừng'}
        >
          {paused ? '▶' : '⏸'}
        </button>
      </div>

      <div className="ss-route-sub">
        <div className="ss-route-label">
          <span className="ss-skill-chip" style={{ background: curMeta.color }}>
            {curMeta.label.toUpperCase()}
          </span>
          <span className="ss-screen-name">
            {currentScreenMeta?.name || curMeta.label} · Màn {currentIndex + 1}/{screens.length}
          </span>
        </div>

        {showGrammarButton && (
          <button
            type="button"
            className="ss-grammar-btn"
            onClick={onOpenGrammar}
            aria-label="Xem ngữ pháp"
            title="Xem bảng tóm tắt ngữ pháp"
          >
            <Icon name="book" size={16} />
            <span>Ngữ pháp</span>
          </button>
        )}
      </div>
    </header>
  );
}
