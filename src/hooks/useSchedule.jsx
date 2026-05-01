import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DEFAULT_SCHEDULE = {
  enabled: false,
  daysOfWeek: [1, 2, 3, 4, 5],
  timeLocal: '19:00',
  timezone:
    (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) ||
    'Asia/Ho_Chi_Minh',
  message: '',
};

/**
 * Hook quản lý lịch học của user (tạo / sửa / lưu lên server).
 * Trả về { schedule, loading, saving, error, save }.
 */
export function useSchedule() {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load từ server khi có token
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/schedule`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Không tải được lịch học');
        const data = await res.json();
        if (!cancelled) {
          setSchedule({
            ...DEFAULT_SCHEDULE,
            ...data,
            // Nếu server chưa có timezone hợp lệ → dùng TZ trình duyệt
            timezone: data.timezone || DEFAULT_SCHEDULE.timezone,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const save = useCallback(
    async (partial) => {
      if (!token) {
        setError('Vui lòng đăng nhập');
        return false;
      }
      const next = { ...schedule, ...partial };
      // Luôn gửi timezone hiện tại của trình duyệt để server biết user đang ở đâu
      next.timezone =
        partial.timezone ||
        (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) ||
        next.timezone;
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`${API}/api/schedule`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(next),
        });
        if (!res.ok) throw new Error('Không lưu được lịch học');
        const saved = await res.json();
        setSchedule({ ...next, ...saved });
        return true;
      } catch (e) {
        setError(e.message || 'Lỗi lưu lịch');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [token, schedule]
  );

  return { schedule, loading, saving, error, save };
}
