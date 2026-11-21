// Cowdi English — Dynamic Image Overrides System
// In-Memory Cache + IndexedDB + LocalStorage (Hỗ trợ lưu ảnh dung lượng lớn không giới hạn)

const OVERRIDE_STORAGE_KEY = 'cowdi_custom_image_overrides';
const IDB_NAME = 'cowdi_app_db';
const IDB_STORE = 'image_overrides';

// Bộ nhớ cache tức thì (In-memory cache) cho giao diện phản hồi 0ms
let memoryOverrides = {};

// Khởi tạo đồng bộ từ localStorage
try {
  const raw = localStorage.getItem(OVERRIDE_STORAGE_KEY);
  if (raw) memoryOverrides = JSON.parse(raw);
} catch (e) {
  console.warn('[imageOverrides] Failed reading initial localStorage:', e);
}

// Khởi tạo IndexedDB (lưu trữ không giới hạn)
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

// Tự động nạp dữ liệu từ IndexedDB khi ứng dụng khởi động
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
          window.dispatchEvent(new CustomEvent('cowdi-image-override-changed', { detail: { sync: true } }));
        }
      }
    };
  } catch (err) {
    console.warn('[imageOverrides] IDB init sync failed:', err);
  }
})();

// Lấy toàn bộ danh sách overrides
export function getImageOverrides() {
  return { ...memoryOverrides };
}

// Lưu 1 override cho key cụ thể (Lưu cả IndexedDB lẫn LocalStorage)
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

    // 1. Lưu vào IndexedDB (bền vững, dung lượng hàng trăm MB)
    try {
      const db = await openDB();
      if (db) {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        if (!overrideData) {
          store.delete(key);
        } else {
          store.put({ id: key, data: memoryOverrides[key] });
        }
      }
    } catch (idbErr) {
      console.warn('[imageOverrides] IDB save failed:', idbErr);
    }

    // 2. Thử lưu vào localStorage (nếu vượt 5MB thì bắt lỗi nhẹ nhàng, không làm chết app)
    try {
      localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(memoryOverrides));
    } catch (lsErr) {
      console.warn('[imageOverrides] localStorage quota exceeded, safely stored in IndexedDB:', lsErr);
    }

    // 3. Bắn event để toàn bộ component lắng nghe và re-render ngay tức thì
    window.dispatchEvent(new CustomEvent('cowdi-image-override-changed', { detail: { key, overrideData } }));
    return true;
  } catch (e) {
    console.error('Failed to save image override:', e);
    return false;
  }
}

// Xóa override của 1 key
export function resetImageOverride(key) {
  return setImageOverride(key, null);
}

// Xóa toàn bộ overrides
export async function resetAllImageOverrides() {
  try {
    memoryOverrides = {};
    try {
      localStorage.removeItem(OVERRIDE_STORAGE_KEY);
    } catch (e) {}

    const db = await openDB();
    if (db) {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
    }

    window.dispatchEvent(new CustomEvent('cowdi-image-override-changed', { detail: { all: true } }));
    return true;
  } catch (e) {
    return false;
  }
}

// Ghi đè toàn bộ overrides (dùng khi Import file JSON)
export async function setAllImageOverrides(allOverrides) {
  try {
    memoryOverrides = { ...(allOverrides || {}) };
    try {
      localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(memoryOverrides));
    } catch (e) {}

    const db = await openDB();
    if (db) {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.clear();
      Object.entries(memoryOverrides).forEach(([id, data]) => {
        store.put({ id, data });
      });
    }

    window.dispatchEvent(new CustomEvent('cowdi-image-override-changed', { detail: { all: true } }));
    return true;
  } catch (e) {
    console.error('Failed to import image overrides to localStorage:', e);
    return false;
  }
}

// Hàm lấy đường dẫn ảnh hiệu dụng (trả về override nếu có, ngược lại trả về defaultUrl)
export function resolveImage(key, defaultUrl) {
  if (!key) return defaultUrl;
  if (memoryOverrides[key] && memoryOverrides[key].url) {
    return memoryOverrides[key].url;
  }
  return defaultUrl;
}

// Hàm lấy tên hiển thị hiệu dụng (hỗ trợ resolveTitle(key, defaultTitle) hoặc resolveTitle(key, lang, defaultTitle))
export function resolveTitle(key, langOrDefault, maybeDefault) {
  if (!key) return maybeDefault !== undefined ? maybeDefault : langOrDefault;
  const item = memoryOverrides[key];
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
