/**
 * Cache dữ liệu chuyển động pet đã duyệt (GET /api/pet-motion/:petId) trong bộ nhớ.
 * Tải tối đa 1 lần cho mỗi petId, không gọi API lại mỗi lần chuyển trang.
 */

const _dataCache = new Map();     // petId -> { c1..c5 }
const _inflight = new Map();      // petId -> Promise
let _cachedToken = null;

export function getMotionApiBase() {
  try {
    return import.meta.env?.VITE_API_URL || 'http://localhost:3001';
  } catch {
    return 'http://localhost:3001';
  }
}

export function invalidatePetMotionCache(petId) {
  if (petId) {
    _dataCache.delete(petId);
    _inflight.delete(petId);
  } else {
    _dataCache.clear();
    _inflight.clear();
  }
}

export function getCachedPetMotion(petId) {
  return _dataCache.has(petId) ? _dataCache.get(petId) : undefined;
}

/**
 * Tải dữ liệu đã duyệt của 1 pet (5 cấp) từ server, cache theo petId trong bộ nhớ.
 * Nếu chưa đăng nhập hoặc lỗi mạng -> trả về `{}` êm ái, không ném lỗi.
 */
export async function fetchPetMotion(
  petId,
  token,
  { fetchImpl = globalThis.fetch, apiBase = getMotionApiBase() } = {}
) {
  if (!petId || !token) return {};

  // Nếu đổi tài khoản/token thì làm mới cache
  if (_cachedToken && _cachedToken !== token) {
    invalidatePetMotionCache();
  }
  _cachedToken = token;

  if (_dataCache.has(petId)) {
    return _dataCache.get(petId);
  }
  if (_inflight.has(petId)) {
    return _inflight.get(petId);
  }

  const req = (async () => {
    try {
      const res = await fetchImpl(`${apiBase}/api/pet-motion/${encodeURIComponent(petId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return {};
      const json = await res.json();
      const normalized = json && typeof json === 'object' ? json : {};
      _dataCache.set(petId, normalized);
      return normalized;
    } catch {
      return {};
    } finally {
      _inflight.delete(petId);
    }
  })();

  _inflight.set(petId, req);
  return req;
}
