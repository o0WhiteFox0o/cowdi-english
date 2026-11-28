// ============================================================
//  Pet Facing Direction — Chuẩn hoá hướng nhìn gốc & tự động lật
//  Dùng chung cho Frontend (PetAvatar, Admin) và Backend (API).
// ============================================================

export const PET_FACING_VALUES = Object.freeze(['left', 'right', 'front']);

/**
 * Hướng nhìn gốc mặc định ban đầu cho một số cấp đã biết trước khi Admin xác nhận thủ công.
 * Giá trị từ server (`facing.json` qua `/api/pet-motion/catalog`) luôn được ưu tiên ghi đè.
 */
export const DEFAULT_PET_STAGE_FACING = Object.freeze({
  'cowdi/c3': 'right',
});

export function isValidNativeFacing(value) {
  return value === 'left' || value === 'right' || value === 'front';
}

export function normalizeNativeFacing(value, fallback = 'left') {
  if (isValidNativeFacing(value)) return value;
  return isValidNativeFacing(fallback) ? fallback : 'left';
}

/**
 * Lấy thông tin hướng nhìn gốc của một pet tại cấp `stage` (1..5).
 * @param {object|null} petRecord - entry trong PET_REGISTRY (hoặc object có id & evolutions)
 * @param {number} stage - 1..5
 * @returns {{ nativeFacing: 'left'|'right'|'front', facingVerified: boolean }}
 */
export function resolvePetStageFacing(petRecord, stage = 1) {
  const clamped = Math.max(1, Math.min(5, Number(stage) || 1));
  const evo = petRecord?.evolutions?.[clamped - 1] || null;
  const petId = petRecord?.id || petRecord?.petId || '';
  const stageKey = petId ? `${petId}/c${clamped}` : '';

  if (isValidNativeFacing(evo?.nativeFacing)) {
    return {
      nativeFacing: evo.nativeFacing,
      facingVerified: Boolean(evo.facingVerified),
    };
  }
  if (isValidNativeFacing(petRecord?.nativeFacing)) {
    return {
      nativeFacing: petRecord.nativeFacing,
      facingVerified: Boolean(petRecord.facingVerified),
    };
  }
  if (stageKey && isValidNativeFacing(DEFAULT_PET_STAGE_FACING[stageKey])) {
    return {
      nativeFacing: DEFAULT_PET_STAGE_FACING[stageKey],
      facingVerified: false,
    };
  }
  return {
    nativeFacing: 'left',
    facingVerified: false,
  };
}

/**
 * Quyết định có cần lật ngang (`scaleX(-1)`) để ảnh gốc quay sang `targetFacing` hay không.
 * - `targetFacing`: `'left'` | `'right'` | `null`/`undefined` (giữ nguyên)
 * - Ảnh `'front'` (chính diện) không bao giờ lật ngang.
 */
export function shouldFlipPetHorizontal(nativeFacing, targetFacing) {
  if (targetFacing !== 'left' && targetFacing !== 'right') return false;
  const native = normalizeNativeFacing(nativeFacing, 'left');
  if (native === 'front') return false;
  return native !== targetFacing;
}

/** Ghép `scaleX(-1)` an toàn với transform sẵn có (nếu có). */
export function mergeTransformWithFlip(existingTransform, flipX) {
  const base = String(existingTransform || '').trim();
  if (!flipX) return base || undefined;
  return base ? `${base} scaleX(-1)` : 'scaleX(-1)';
}
