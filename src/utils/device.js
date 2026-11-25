// ============================================================
// Cowdi English — Định danh thiết bị nội bộ (localStorage: cowdi_device)
// Dùng cùng User-Agent để server tính SHA-256 chống gian lận thiệp mời (FR-RWD-01).
// ============================================================

const DEVICE_KEY = 'cowdi_device';

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id || id.length < 16) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        id = crypto.randomUUID();
      } else {
        id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      }
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}
