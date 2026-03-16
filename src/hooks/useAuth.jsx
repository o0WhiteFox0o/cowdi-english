import { createContext, useContext, useState, useCallback } from 'react';
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
  const user = token ? parseJwt(token) : null;

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

  /** Gọi API backend có kèm JWT */
  const authFetch = useCallback(
    (url, options = {}) =>
      fetch(`${API}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
    [token]
  );

  return (
    <AuthContext.Provider value={{ user, token, loginWithGoogle, logout, saveToken, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
