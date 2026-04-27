import { useState, useEffect } from 'react';

/**
 * PWAInstallPrompt — nút "Cài đặt ứng dụng" nổi góc dưới màn hình.
 * - Android Chrome: dùng beforeinstallprompt event
 * - iOS Safari: hiển thị hướng dẫn thủ công (Share → Add to Home Screen)
 * - Ẩn đi khi đã cài (standalone mode) hoặc user bấm "Bỏ qua"
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Không hiện nếu đang chạy standalone (đã cài rồi)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Kiểm tra iOS Safari
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // iOS không có beforeinstallprompt — hiện banner hướng dẫn sau 30s
      const dismissed = localStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 30000);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Android/Desktop Chrome
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    const key = isIOS ? 'pwa-ios-dismissed' : 'pwa-prompt-dismissed';
    localStorage.setItem(key, '1');
  };

  if (!showBanner) return null;

  if (isIOS) {
    return (
      <div style={styles.banner}>
        <span style={styles.icon}>📲</span>
        <div style={styles.text}>
          <strong>Cài Cowdi lên màn hình</strong>
          <span style={styles.sub}>
            Nhấn <strong>⬆️ Share</strong> → <strong>Add to Home Screen</strong>
          </span>
        </div>
        <button style={styles.close} onClick={handleDismiss} aria-label="Đóng">✕</button>
      </div>
    );
  }

  return (
    <div style={styles.banner}>
      <span style={styles.icon}>🐮</span>
      <div style={styles.text}>
        <strong>Cài Cowdi như app</strong>
        <span style={styles.sub}>Dùng offline, nhanh hơn, không cần browser</span>
      </div>
      <div style={styles.actions}>
        <button style={styles.installBtn} onClick={handleInstall}>Cài đặt</button>
        <button style={styles.close} onClick={handleDismiss} aria-label="Bỏ qua">✕</button>
      </div>
    </div>
  );
}

const styles = {
  banner: {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(420px, calc(100vw - 32px))',
    background: '#fff',
    border: '2px solid #FF6B9D',
    borderRadius: '16px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 8px 32px rgba(255,107,157,0.25)',
    zIndex: 9999,
    animation: 'pwaSlideUp 0.3s ease',
  },
  icon: { fontSize: '28px', flexShrink: 0 },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  },
  sub: { fontSize: '12px', color: '#666', marginTop: '2px' },
  actions: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  installBtn: {
    background: '#FF6B9D',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  close: {
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#999',
    padding: '4px',
    lineHeight: 1,
    flexShrink: 0,
  },
};
