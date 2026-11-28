import { useEffect, useId, useRef } from 'react';

/**
 * ScreenActionModal — Popup dùng chung (native <dialog> theo modern-web-guidance:
 * dialog, light-dismiss-a-dialog, prevent-page-scroll-under-modal-dialog).
 * Dùng cho: xác nhận qua màn, phản hồi khi trả lời sai, chọn ôn từ sai/đánh lại Boss —
 * không chiếm diện tích trên màn học/chơi và không đẩy layout gây cuộn trang.
 */
export default function ScreenActionModal({
  open,
  title,
  tone = 'info', // 'info' | 'success' | 'warning'
  dismissible = false,
  onDismiss,
  primaryLabel = 'Tiếp tục →',
  onPrimary,
  secondaryLabel = '',
  onSecondary,
  tertiaryLabel = '',
  onTertiary,
  children,
}) {
  const dlgRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return undefined;

    const onClose = () => {
      dlg.returnValue = '';
      if (dismissible && typeof onDismiss === 'function') onDismiss();
    };
    const onCancel = (e) => {
      if (!dismissible) e.preventDefault();
    };
    dlg.addEventListener('close', onClose);
    dlg.addEventListener('cancel', onCancel);

    // Fallback light-dismiss cho Safari (chưa hỗ trợ closedby)
    if (dismissible && !('closedBy' in HTMLDialogElement.prototype)) {
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
        dlg.removeEventListener('close', onClose);
        dlg.removeEventListener('cancel', onCancel);
        dlg.removeEventListener('pointerdown', onDown);
        dlg.removeEventListener('pointerup', onUp);
      };
    }

    return () => {
      dlg.removeEventListener('close', onClose);
      dlg.removeEventListener('cancel', onCancel);
    };
  }, [dismissible, onDismiss]);

  const toneCls = tone === 'success' ? 'is-success' : tone === 'warning' ? 'is-warning' : 'is-info';

  return (
    <dialog
      ref={dlgRef}
      className={`ss-action-modal ${toneCls}`}
      closedby={dismissible ? 'any' : 'none'}
      aria-labelledby={titleId}
    >
      <div className="ss-action-modal-head">
        <h1 id={titleId} className="ss-action-modal-title">{title}</h1>
        {dismissible && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle"
            style={{ width: 32, height: 32, padding: 0 }}
            onClick={() => dlgRef.current?.close()}
            aria-label="Đóng hộp thoại"
          >
            ✕
          </button>
        )}
      </div>

      {children && <div className="ss-action-modal-body">{children}</div>}

      <div className="ss-action-modal-actions">
        {tertiaryLabel && typeof onTertiary === 'function' && (
          <button
            type="button"
            className="btn btn-outline-secondary ss-tap-btn"
            onClick={onTertiary}
          >
            {tertiaryLabel}
          </button>
        )}
        {secondaryLabel && typeof onSecondary === 'function' && (
          <button
            type="button"
            className="btn btn-warning ss-tap-btn"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
        {primaryLabel && typeof onPrimary === 'function' && (
          <button
            type="button"
            className="btn btn-cowdi-primary ss-tap-btn"
            onClick={onPrimary}
            autoFocus
          >
            {primaryLabel}
          </button>
        )}
      </div>
    </dialog>
  );
}
