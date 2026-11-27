import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { SCREEN_CONFIG } from '../data/config/screens';

const CACHE_KEY = 'cowdi.screenConfig';
const REFRESH_TTL_MS = 10 * 60 * 1000; // 10 phút theo PHASE2 §2.1

const FALLBACK_STATE = {
  version: null,
  etag: null,
  status: SCREEN_CONFIG.status,
  weights: SCREEN_CONFIG.weights,
  isTester: false,
  fetchedAt: 0,
  source: 'static',
};

function readCache(userId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.userId === (userId || null) && parsed.status && parsed.weights) {
      return parsed;
    }
  } catch { /* bỏ qua */ }
  return null;
}

function writeCache(userId, data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, userId: userId || null }));
  } catch { /* bỏ qua */ }
}

const ScreenConfigContext = createContext({
  config: SCREEN_CONFIG,
  isTester: false,
  version: null,
  source: 'static',
  refresh: () => Promise.resolve(),
});

/**
 * ScreenConfigProvider (GEMINI-SCREEN-SYSTEM-PHASE2 §2.1):
 * - Tải GET /api/screens/config sau khi đăng nhập (hỗ trợ ETag / 304).
 * - Cache trong bộ nhớ + localStorage (`cowdi.screenConfig`), tự làm mới khi foreground > 10 phút.
 * - Lỗi mạng / offline → dự phòng bằng SCREEN_CONFIG tĩnh, KHÔNG bao giờ chặn bài học.
 */
export function ScreenConfigProvider({ children }) {
  const { user, authFetch } = useAuth();
  const [state, setState] = useState(() => readCache(user?.id) || FALLBACK_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  const fetchConfig = useCallback(async ({ force = false } = {}) => {
    if (!user) {
      setState(FALLBACK_STATE);
      return;
    }
    const cur = stateRef.current;
    if (!force && cur.fetchedAt && Date.now() - cur.fetchedAt < REFRESH_TTL_MS && cur.source === 'server') {
      return;
    }
    try {
      const headers = {};
      if (!force && cur.etag) headers['If-None-Match'] = cur.etag;
      const res = await authFetch('/api/screens/config', { headers });
      if (res.status === 304) {
        const touched = { ...cur, fetchedAt: Date.now() };
        setState(touched);
        writeCache(user.id, touched);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data?.status && data?.weights) {
        const next = {
          version: data.version || null,
          etag: res.headers.get('etag') || null,
          status: data.status,
          weights: data.weights,
          isTester: Boolean(data.isTester),
          fetchedAt: Date.now(),
          source: 'server',
        };
        setState(next);
        writeCache(user.id, next);
      }
    } catch {
      // Lỗi mạng: giữ cache hoặc fallback tĩnh, không chặn học
    }
  }, [user, authFetch]);

  // Tải khi đổi user (đăng nhập / đăng xuất)
  useEffect(() => {
    if (!user) {
      setState(FALLBACK_STATE);
      return;
    }
    const cached = readCache(user.id);
    if (cached) setState(cached);
    fetchConfig({ force: true });
  }, [user?.id, fetchConfig]);

  // Làm mới khi app trở lại foreground nếu cache > 10 phút
  useEffect(() => {
    if (!user) return undefined;
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        fetchConfig({ force: false });
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [user, fetchConfig]);

  const value = {
    config: { status: state.status || SCREEN_CONFIG.status, weights: state.weights || SCREEN_CONFIG.weights },
    isTester: Boolean(state.isTester),
    version: state.version,
    source: state.source,
    refresh: () => fetchConfig({ force: true }),
  };

  return (
    <ScreenConfigContext.Provider value={value}>
      {children}
    </ScreenConfigContext.Provider>
  );
}

export function useScreenConfig() {
  return useContext(ScreenConfigContext);
}
