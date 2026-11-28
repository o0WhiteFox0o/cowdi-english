// Cowdi English — Dynamic Image Overrides & Server Media Sync System
// Đồng bộ ảnh tải lên từ server (/api/media/manifest) + fallback local/IndexedDB.

const OVERRIDE_STORAGE_KEY = 'cowdi_custom_image_overrides';
const IDB_NAME = 'cowdi_app_db';
const IDB_STORE = 'image_overrides';
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3001';

// Bộ nhớ cache tức thì (In-memory cache) cho giao diện phản hồi 0ms
let memoryOverrides = {};
let serverOverrides = {};
let serverSyncPromise = null;

// Khởi tạo đồng bộ từ localStorage (legacy fallback)
try {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(OVERRIDE_STORAGE_KEY);
    if (raw) memoryOverrides = JSON.parse(raw);
  }
} catch (e) {
  console.warn('[imageOverrides] Failed reading initial localStorage:', e);
}

function toAbsoluteMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/')) return `${API_BASE.replace(/\/$/, '')}${url}`;
  return url;
}

function notifyOverrideChanged(detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cowdi-image-override-changed', { detail }));
  }
}

/** Chuẩn hoá mã từ vựng sang key media ổn định (`word:hello`, `word:ice_cream`). */
export function wordMediaKey(word) {
  const slug = String(word || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug ? `word:${slug}` : '';
}

/** Tải danh sách ảnh từ server (/api/media/manifest) để mọi học sinh thấy ảnh mới nhất. */
export async function syncServerMediaOverrides(force = false) {
  if (typeof fetch === 'undefined') return serverOverrides;
  if (serverSyncPromise && !force) return serverSyncPromise;

  serverSyncPromise = fetch(`${API_BASE.replace(/\/$/, '')}/api/media/manifest`, {
    cache: 'no-cache',
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data?.overrides || typeof data.overrides !== 'object') return serverOverrides;
      const normalized = {};
      for (const [k, entry] of Object.entries(data.overrides)) {
        if (!entry?.url) continue;
        normalized[k] = {
          ...entry,
          url: toAbsoluteMediaUrl(entry.url),
          source: 'server',
        };
      }
      serverOverrides = normalized;
      notifyOverrideChanged({ serverSync: true });
      return serverOverrides;
    })
    .catch(() => serverOverrides);

  return serverSyncPromise;
}

// Tự động đồng bộ manifest ảnh server khi app khởi chạy trên trình duyệt
if (typeof window !== 'undefined') {
  syncServerMediaOverrides();
}

// Khởi tạo IndexedDB (giữ tương thích dữ liệu cục bộ cũ)
function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => resolve(null);
  });
}

if (typeof window !== 'undefined') {
  (async function initFromIDB() {
    try {
      const db = await openDB();
      if (!db) return;
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        if (items.length > 0) {
          let hasChanges = false;
          items.forEach((item) => {
            if (item && item.id && item.data) {
              memoryOverrides[item.id] = item.data;
              hasChanges = true;
            }
          });
          if (hasChanges) {
            notifyOverrideChanged({ sync: true });
          }
        }
      };
    } catch (err) {
      console.warn('[imageOverrides] IDB init sync failed:', err);
    }
  })();
}

/** Lấy toàn bộ overrides (ưu tiên ảnh lưu trên server). */
export function getImageOverrides() {
  return { ...memoryOverrides, ...serverOverrides };
}

/** Tải ảnh lên server (Admin) và cập nhật ngay vào bộ nhớ hiển thị. */
export async function uploadServerMedia(token, { key, category = 'other', file }) {
  const form = new FormData();
  form.append('key', key);
  form.append('category', category);
  form.append('file', file);

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/admin/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Lỗi tải ảnh lên server (${res.status})`);
  }
  const absEntry = {
    ...data.entry,
    url: toAbsoluteMediaUrl(data.entry.url),
    source: 'server',
  };
  serverOverrides = { ...serverOverrides, [key]: absEntry };
  notifyOverrideChanged({ key, entry: absEntry });
  return absEntry;
}

/** Xoá ảnh đã tải lên server (Admin) để quay về ảnh mặc định hoặc Emoji. */
export async function deleteServerMedia(token, key) {
  const res = await fetch(
    `${API_BASE.replace(/\/$/, '')}/api/admin/media/item?key=${encodeURIComponent(key)}`,
    {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Lỗi xoá ảnh trên server (${res.status})`);
  }
  const next = { ...serverOverrides };
  delete next[key];
  serverOverrides = next;
  delete memoryOverrides[key];
  notifyOverrideChanged({ key, deleted: true });
  return true;
}

// Lưu 1 override cục bộ (giữ tương thích cho đổi tiêu đề nhanh)
export async function setImageOverride(key, overrideData) {
  try {
    if (!overrideData) {
      delete memoryOverrides[key];
    } else {
      memoryOverrides[key] = {
        ...memoryOverrides[key],
        ...overrideData,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const db = await openDB();
      if (db) {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        if (!overrideData) store.delete(key);
        else store.put({ id: key, data: memoryOverrides[key] });
      }
    } catch (idbErr) {
      console.warn('[imageOverrides] IDB save failed:', idbErr);
    }

    try {
      localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(memoryOverrides));
    } catch { /* ignore quota */ }

    notifyOverrideChanged({ key, overrideData });
    return true;
  } catch (e) {
    console.error('Failed to save image override:', e);
    return false;
  }
}

export function resetImageOverride(key) {
  return setImageOverride(key, null);
}

export async function resetAllImageOverrides() {
  try {
    memoryOverrides = {};
    try { localStorage.removeItem(OVERRIDE_STORAGE_KEY); } catch { /* ignore */ }
    const db = await openDB();
    if (db) {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
    }
    notifyOverrideChanged({ all: true });
    return true;
  } catch {
    return false;
  }
}

export async function setAllImageOverrides(allOverrides) {
  try {
    memoryOverrides = { ...(allOverrides || {}) };
    try { localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(memoryOverrides)); } catch { /* ignore */ }
    const db = await openDB();
    if (db) {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.clear();
      Object.entries(memoryOverrides).forEach(([id, data]) => {
        store.put({ id, data });
      });
    }
    notifyOverrideChanged({ all: true });
    return true;
  } catch (e) {
    console.error('Failed to import image overrides:', e);
    return false;
  }
}

// Lấy URL ảnh hiệu dụng (ưu tiên server -> local -> defaultUrl)
export function resolveImage(key, defaultUrl) {
  if (!key) return defaultUrl;
  if (serverOverrides[key]?.url) return serverOverrides[key].url;
  if (memoryOverrides[key]?.url) return memoryOverrides[key].url;
  return defaultUrl;
}

/** Lấy ảnh flashcard của từ vựng (nếu đã có trên server), trả về null để hiện Emoji fallback. */
export function resolveWordImage(word) {
  const key = wordMediaKey(word);
  if (!key) return null;
  return resolveImage(key, null);
}

/** Lấy ảnh WebP override của Icon UI (nếu Admin đã tải lên server). */
export function resolveIconOverride(iconName) {
  if (!iconName) return null;
  return resolveImage(`icon:${iconName}`, null);
}

/** Lấy ảnh nền/vật phẩm cửa hàng (ưu tiên ảnh Admin tải lên server). */
export function resolveCosmeticImage(itemId, defaultUrl = null) {
  if (!itemId) return defaultUrl;
  return resolveImage(`cosmetic:${itemId}`, defaultUrl);
}

export function resolveTitle(key, langOrDefault, maybeDefault) {
  if (!key) return maybeDefault !== undefined ? maybeDefault : langOrDefault;
  const item = serverOverrides[key] || memoryOverrides[key];
  if (!item) return maybeDefault !== undefined ? maybeDefault : langOrDefault;

  if (maybeDefault !== undefined) {
    const lang = langOrDefault;
    if (lang === 'en' && item.titleEn) return item.titleEn;
    if (lang === 'vi' && item.titleVi) return item.titleVi;
    if (item.title) return item.title;
    return maybeDefault;
  }

  return item.title || item.titleEn || item.titleVi || langOrDefault;
}
