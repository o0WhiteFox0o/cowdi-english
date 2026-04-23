import { createContext, useContext, useState, useCallback } from 'react';
import { useSound } from '../../hooks/useSound';

const ToastContext = createContext(null);

const TYPE_CLASS = {
  success: 'bg-success',
  danger:  'bg-danger',
  warning: 'bg-warning text-dark',
  info:    'bg-info',
};

const TYPE_SOUND = {
  success: 'toastSuccess',
  danger:  'toastError',
  warning: 'toastWarning',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { play } = useSound();

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    const snd = TYPE_SOUND[type];
    if (snd) play(snd);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, [play]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container-fixed">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center text-white border-0 mb-2 ${TYPE_CLASS[t.type] || 'bg-dark'}`}
            role="alert"
            aria-live="assertive"
          >
            <div className="d-flex">
              <div className="toast-body fw-bold">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

