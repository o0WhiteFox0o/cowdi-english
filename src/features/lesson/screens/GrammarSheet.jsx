import { useEffect, useRef } from 'react';
import Icon from '../../../components/Icon';
import { speakWord } from '../../../utils/speech';

/**
 * GrammarSheet — Bottom sheet "Xem ngữ pháp" (thay thế màn T-03 riêng, STD Q10 & PHASE1 §7).
 * Dùng native <dialog> mở bằng showModal(), closedby="any" + fallback pointer-outside cho Safari,
 * hỗ trợ vuốt xuống hoặc bấm ✕ để đóng; cuộn bên trong sheet, không cuộn nền.
 */
export default function GrammarSheet({ open, onClose, lesson }) {
  const dialogRef = useRef(null);
  const touchStartYRef = useRef(null);
  const grammars = lesson?.grammar || [];

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  // Fallback light-dismiss cho trình duyệt chưa hỗ trợ closedby="any" (Safari)
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return undefined;
    const onNativeClose = () => {
      dlg.returnValue = '';
      onClose?.();
    };
    dlg.addEventListener('close', onNativeClose);

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e) => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onDown = (e) => { pressedOutside = isOutside(e); };
      const onUp = (e) => { if (pressedOutside && isOutside(e)) dlg.close(); };
      dlg.addEventListener('pointerdown', onDown);
      dlg.addEventListener('pointerup', onUp);
      return () => {
        dlg.removeEventListener('close', onNativeClose);
        dlg.removeEventListener('pointerdown', onDown);
        dlg.removeEventListener('pointerup', onUp);
      };
    }
    return () => dlg.removeEventListener('close', onNativeClose);
  }, [onClose]);

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches?.[0]?.clientY ?? null;
  };
  const handleTouchEnd = (e) => {
    if (touchStartYRef.current == null) return;
    const endY = e.changedTouches?.[0]?.clientY ?? touchStartYRef.current;
    if (endY - touchStartYRef.current > 65) {
      dialogRef.current?.close();
    }
    touchStartYRef.current = null;
  };

  return (
    <dialog
      ref={dialogRef}
      className="ss-grammar-sheet"
      closedby="any"
      aria-labelledby="ss-grammar-sheet-title"
    >
      <div
        className="ss-grammar-sheet-handle"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <span className="ss-sheet-pill" aria-hidden="true" />
      </div>

      <div className="ss-grammar-sheet-head">
        <h1 id="ss-grammar-sheet-title" className="ss-sheet-title">
          <Icon name="book" size={18} /> Ngữ pháp bài học
        </h1>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary ss-tap-btn"
          onClick={() => dialogRef.current?.close()}
          aria-label="Đóng bảng ngữ pháp"
          autoFocus
        >
          ✕
        </button>
      </div>

      <div className="ss-grammar-sheet-body">
        {grammars.length === 0 ? (
          <p className="text-muted small mb-0">Bài này không có mục ngữ pháp riêng.</p>
        ) : (
          grammars.map((g, i) => (
            <div key={i} className="card shadow-sm mb-3">
              <div className="card-body py-2 px-3">
                <h6 className="fw-bold text-cowdi-primary mb-1">{g.title}</h6>
                <p className="text-muted small mb-2">{g.explanation}</p>
                <div className="d-flex flex-column gap-1 mb-2">
                  {(g.examples || []).slice(0, 2).map((ex, j) => (
                    <div key={j} className="bg-light rounded p-2 small">
                      <div className="fw-bold d-flex align-items-center justify-content-between gap-2">
                        <span>{ex.en}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => speakWord(ex.en).catch(() => {})}
                          aria-label="Nghe ví dụ"
                        >
                          <Icon name="sound" size={13} />
                        </button>
                      </div>
                      <div className="text-muted fst-italic">→ {ex.vi}</div>
                    </div>
                  ))}
                </div>
                {Array.isArray(g.mistakes) && g.mistakes.length > 0 && (
                  <div className="alert alert-warning py-2 px-2 mb-0 small">
                    <div className="fw-bold mb-1">⚠️ Lỗi thường gặp</div>
                    {g.mistakes.map((m, mi) => (
                      <div key={mi}>
                        <span className="text-danger text-decoration-line-through me-2">✗ {m.wrong}</span>
                        <span className="text-success fw-bold">✓ {m.right}</span>
                        {m.note && <div className="text-muted">{m.note}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </dialog>
  );
}
