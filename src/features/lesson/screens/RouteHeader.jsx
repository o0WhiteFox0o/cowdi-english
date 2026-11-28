import Icon from '../../../components/Icon';
import Emoji from '../../../components/Emoji';
import { SLOT_META } from '../../../data/config/screens';

/**
 * RouteHeader — Thanh vòng kỹ năng theo cấu trúc 6 màn, đặt gọn trong card Cowdi quen thuộc.
 */
export default function RouteHeader({
  lesson,
  screens = [],
  currentIndex = 0,
  currentScreenMeta,
  currentTitle = '',
  paused,
  onRequestExit,
  onTogglePause,
  showGrammarButton,
  onOpenGrammar,
}) {
  const curSlot = screens[currentIndex]?.slot;
  const curMeta = SLOT_META[curSlot] || SLOT_META.intro;

  return (
    <div className="card shadow-sm mb-3 ss-route-card">
      {lesson?.level && <div className={`card-header-level ${lesson.level}`} />}
      <div className="card-body py-2 px-3">
        <div className="ss-route-top">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm ss-icon-btn"
            onClick={onRequestExit}
            aria-label="Thoát bài học"
            title="Thoát ra lộ trình"
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
            className="btn btn-outline-secondary btn-sm ss-icon-btn"
            onClick={onTogglePause}
            aria-label={paused ? 'Tiếp tục' : 'Tạm dừng'}
            title={paused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {paused ? '▶' : '⏸'}
          </button>
        </div>

        <div className="ss-route-sub">
          <div className="ss-route-label">
            {lesson?.icon && <Emoji e={lesson.icon} size={20} />}
            <span className="ss-skill-chip" style={{ background: curMeta.color }}>
              {curMeta.label.toUpperCase()}
            </span>
            <span className="ss-screen-name">
              {currentTitle || currentScreenMeta?.name || curMeta.label} · Màn {currentIndex + 1}/{screens.length}
              {lesson?.title ? ` · ${lesson.title}` : ''}
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
      </div>
    </div>
  );
}
