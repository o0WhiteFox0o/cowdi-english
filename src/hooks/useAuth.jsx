import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JWT_KEY = 'cowdi_jwt';
const API     = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    // Decode UTF-8 (hỗ trợ tiếng Việt)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

function loadToken() {
  const t = localStorage.getItem(JWT_KEY);
  return isTokenValid(t) ? t : null;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(loadToken);
  const [serverIsAdmin, setServerIsAdmin] = useState(null);
  const rawUser = token ? parseJwt(token) : null;
  const jwtIsAdmin = Boolean(rawUser?.is_admin || rawUser?.isAdmin);
  const isAdmin = serverIsAdmin !== null ? serverIsAdmin : jwtIsAdmin;
  const user = rawUser ? { ...rawUser, isAdmin, is_admin: isAdmin ? 1 : 0 } : null;

  // Đồng bộ quyền quản trị thật từ DB (/api/me) để không bị kẹt 403 do JWT cũ
  useEffect(() => {
    if (!token) {
      setServerIsAdmin(null);
      return undefined;
    }
    let active = true;
    fetch(`${API}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (active && me && typeof me.isAdmin === 'boolean') {
          setServerIsAdmin(me.isAdmin);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [token]);

  const saveToken = useCallback((newToken) => {
    localStorage.setItem(JWT_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(JWT_KEY);
    setToken(null);
    // Redirect về trang chủ sau khi đăng xuất
    window.location.href = '/';
  }, []);

  /** Redirect tới Google OAuth (server sẽ xử lý flow) */
  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API}/auth/google`;
  }, []);

  /** Gọi API backend có kèm JWT & múi giờ IANA */
  const authFetch = useCallback(
    (url, options = {}) => {
      let tz = 'Asia/Ho_Chi_Minh';
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch {}
      return fetch(`${API}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Timezone': tz,
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ user, isAdmin, token, loginWithGoogle, logout, saveToken, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
