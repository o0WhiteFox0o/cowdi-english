import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// urlBase64 → Uint8Array (chuẩn Web Push)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export function usePush() {
  const { token } = useAuth();
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  // Kiểm tra trạng thái subscription hiện tại
  useEffect(() => {
    if (!isSupported) return;
    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setIsSubscribed(!!sub);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Trình duyệt không hỗ trợ thông báo');
      return false;
    }
    if (!token) {
      setError('Vui lòng đăng nhập để bật thông báo');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Xin quyền
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('Bạn đã từ chối quyền thông báo');
        return false;
      }

      // 2. Lấy VAPID public key
      const keyRes = await fetch(`${API}/api/push/vapid-public-key`);
      const { publicKey } = await keyRes.json();
      if (!publicKey) throw new Error('Server chưa cấu hình VAPID');

      // 3. Subscribe
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // 4. Gửi lên server
      const json = sub.toJSON();
      const res = await fetch(`${API}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error('Không lưu được subscription');

      setIsSubscribed(true);
      return true;
    } catch (e) {
      setError(e.message || 'Lỗi đăng ký thông báo');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, token]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;
    setLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        if (token) {
          await fetch(`${API}/api/push/subscribe`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint }),
          });
        }
      }
      setIsSubscribed(false);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, token]);

  const sendTest = useCallback(async () => {
    if (!token) return;
    await fetch(`${API}/api/push/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [token]);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
    sendTest,
  };
}
