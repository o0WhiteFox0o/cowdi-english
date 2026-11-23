import crypto from 'node:crypto';
import path from 'node:path';
import { PET_BATTLE_DATA } from '../../shared/game-config.js';
import { CLIPS } from '../../shared/pet-motion.js';

export const ALL_PET_IDS = Object.keys(PET_BATTLE_DATA);
export const VALID_PET_IDS = new Set(ALL_PET_IDS);
export const ALL_CLIP_NAMES = Object.keys(CLIPS);
export const VALID_CLIPS = new Set(ALL_CLIP_NAMES);

export const VALID_TRACK_CHANNELS = new Set([
  'rot', 'dx', 'dy', 'sx', 'sy', 'head', 'crown', 'cskew',
  'armL', 'armR', 'mouth', 'lookX', 'lookY', 'glow', 'eyes',
]);

export const STANDARD_PARTS = new Set([
  'body', 'head', 'crown', 'armL', 'armR', 'front', 'fx', 'aura', 'eye0', 'eye1',
]);
export const PART_NAME_RE = /^[a-z][a-zA-Z0-9_]{0,30}$/;
export const HASHED_IMAGE_FILE_RE = /^[a-z][a-zA-Z0-9_]{0,30}-[0-9a-f]{8}\.(png|webp)$/;
export const EMOJI_FILE_RE = /^[a-z0-9_-]{1,40}-[0-9a-f]{8}\.(png|webp)$/;
export const EMOJI_URL_RE = /^\/api\/pet-motion\/assets\/emojis\/[a-z0-9_-]{1,40}-[0-9a-f]{8}\.(png|webp)$/;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Kiểm tra chữ ký file thật (magic bytes) — KHÔNG tin Content-Type hay đuôi file.
 * Chỉ chấp nhận PNG hoặc WebP.
 */
export function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.subarray(0, 8).equals(PNG_MAGIC)) {
    return { ext: '.png', mime: 'image/png' };
  }

  // WebP: "RIFF" (0..3) + size (4..7) + "WEBP" (8..11)
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { ext: '.webp', mime: 'image/webp' };
  }

  return null;
}

export function sha1Short(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 8);
}

export function validatePetId(petId) {
  return typeof petId === 'string' && VALID_PET_IDS.has(petId);
}

export function parseStage(stage) {
  const raw = String(stage ?? '').trim();
  const match = raw.match(/^c?([1-5])$/);
  return match ? Number(match[1]) : null;
}

export function validatePartName(part) {
  return typeof part === 'string' && (STANDARD_PARTS.has(part) || PART_NAME_RE.test(part));
}

export function validateClipName(clip) {
  return typeof clip === 'string' && VALID_CLIPS.has(clip);
}

/**
 * scope_key hợp lệ: '' (bản chung) hoặc '<petId>/c<1-5>'
 */
export function validateScopeKey(scopeKey) {
  if (scopeKey === '') return true;
  if (typeof scopeKey !== 'string') return false;
  const match = scopeKey.match(/^([a-z0-9_]+)\/c([1-5])$/);
  if (!match) return false;
  return VALID_PET_IDS.has(match[1]);
}

export function parseScopePetId(scopeKey) {
  if (!scopeKey) return null;
  const idx = scopeKey.indexOf('/');
  return idx > 0 ? scopeKey.slice(0, idx) : null;
}

export function validateClipData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Dữ liệu clip phải là object hợp lệ.';
  }
  if (typeof data.dur !== 'number' || !Number.isFinite(data.dur) || data.dur <= 0 || data.dur > 30) {
    return 'Thời lượng clip (dur) phải là số dương (≤ 30 giây).';
  }
  if (typeof data.loop !== 'boolean') {
    return 'Trường loop phải là true/false.';
  }
  if (!data.tracks || typeof data.tracks !== 'object' || Array.isArray(data.tracks)) {
    return 'Thiếu hoặc sai định dạng tracks.';
  }
  for (const [channel, keys] of Object.entries(data.tracks)) {
    if (!VALID_TRACK_CHANNELS.has(channel)) {
      return `Kênh động tác không hợp lệ: ${channel}`;
    }
    if (!Array.isArray(keys)) {
      return `Kênh ${channel} phải là mảng keyframe.`;
    }
    for (const kf of keys) {
      if (!Array.isArray(kf) || kf.length < 2 || typeof kf[0] !== 'number' || !Number.isFinite(kf[0])) {
        return `Keyframe trong kênh ${channel} không hợp lệ.`;
      }
      if (channel === 'eyes') {
        if (typeof kf[1] !== 'string') return 'Giá trị kênh eyes phải là chuỗi.';
      } else if (typeof kf[1] !== 'number' || !Number.isFinite(kf[1])) {
        return `Giá trị keyframe trong kênh ${channel} phải là số.`;
      }
      if (kf[2] !== undefined && !['smooth', 'linear', 'step'].includes(kf[2])) {
        return `Kiểu nội suy không hợp lệ trong kênh ${channel}: ${kf[2]}`;
      }
    }
  }
  if (data.emoji !== undefined && data.emoji !== null) {
    if (typeof data.emoji !== 'object' || Array.isArray(data.emoji)) {
      return 'Trường emoji phải là object hợp lệ.';
    }
    if (typeof data.emoji.enabled !== 'boolean') {
      return 'emoji.enabled phải là true/false.';
    }
    if (data.emoji.char !== undefined && data.emoji.char !== null && (typeof data.emoji.char !== 'string' || data.emoji.char.length > 16)) {
      return 'emoji.char phải là chuỗi tối đa 16 ký tự.';
    }
    if (data.emoji.imageUrl !== undefined && data.emoji.imageUrl !== null && data.emoji.imageUrl !== '') {
      if (typeof data.emoji.imageUrl !== 'string' || !EMOJI_URL_RE.test(data.emoji.imageUrl)) {
        return 'emoji.imageUrl không hợp lệ.';
      }
    }
    if (data.emoji.pos !== undefined && !['top-right', 'top-center', 'top-left'].includes(data.emoji.pos)) {
      return 'emoji.pos không hợp lệ.';
    }
  }
  return null;
}

export function validateRigData(rig) {
  if (!rig || typeof rig !== 'object' || Array.isArray(rig)) {
    return 'Dữ liệu rig phải là object hợp lệ.';
  }
  if (rig.slots !== undefined && !Array.isArray(rig.slots)) {
    return 'rig.slots phải là mảng.';
  }
  if (rig.eyes !== undefined && !Array.isArray(rig.eyes)) {
    return 'rig.eyes phải là mảng.';
  }
  return null;
}

/**
 * Tương thích cả MySQL 8 (JSON -> object) lẫn MariaDB 10.4 (JSON -> string).
 */
export function parseJsonCol(val, fallback = null) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return val;
}

export function toIsoTimestamp(val) {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function timestampsMatch(a, b) {
  const isoA = toIsoTimestamp(a);
  const isoB = toIsoTimestamp(b);
  if (!isoA || !isoB) return false;
  // MySQL TIMESTAMP mặc định chính xác tới giây
  return Math.floor(new Date(isoA).getTime() / 1000) === Math.floor(new Date(isoB).getTime() / 1000);
}

/**
 * Giải đường dẫn an toàn bên trong thư mục lưu trữ (chặn path traversal).
 */
export function resolveSafeStoragePath(storageRoot, ...segments) {
  const rootResolved = path.resolve(storageRoot);
  const target = path.resolve(rootResolved, ...segments);
  if (target !== rootResolved && !target.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return target;
}

export function buildImageUrls(imagesMap, urlPrefix) {
  const result = {};
  if (!imagesMap || typeof imagesMap !== 'object') return result;
  for (const [part, relPath] of Object.entries(imagesMap)) {
    if (typeof relPath === 'string' && relPath) {
      result[part] = `${urlPrefix}/${relPath}`;
    }
  }
  return result;
}

/**
 * Quy tắc duyệt (mục 3):
 * Người học thấy động tác X của pet P cấp N khi và chỉ khi:
 * 1. pet_rigs['P/cN'].status === 'approved' và có published_rig + published_images
 * 2. pet_motion_approvals['P/cN', X].approved === 1
 * 3. Thứ tự ưu tiên keyframe:
 *    - published_json của scope 'P/cN' nếu có
 *    - nếu không thì published_json của scope '' nếu có
 *    - nếu không thì CLIPS[X] gốc trong shared/pet-motion.js
 */
export function resolveApprovedPetMotion({
  petId,
  rigRows = [],
  approvalRows = [],
  clipRows = [],
  baseClips = CLIPS,
  assetUrlPrefix = '/api/pet-motion/assets',
}) {
  const globalPublished = new Map();
  const stagePublished = new Map(); // petStage -> Map(clip -> published_json)

  for (const row of clipRows) {
    const pub = parseJsonCol(row.published_json, null);
    if (!pub) continue;
    if (row.scope_key === '') {
      globalPublished.set(row.clip, pub);
    } else {
      let m = stagePublished.get(row.scope_key);
      if (!m) {
        m = new Map();
        stagePublished.set(row.scope_key, m);
      }
      m.set(row.clip, pub);
    }
  }

  const approvalsByStage = new Map();
  for (const row of approvalRows) {
    if (!row.approved) continue;
    let list = approvalsByStage.get(row.pet_stage);
    if (!list) {
      list = [];
      approvalsByStage.set(row.pet_stage, list);
    }
    list.push(row.clip);
  }

  const output = {};

  for (const rigRow of rigRows) {
    if (rigRow.status !== 'approved') continue;
    const publishedRig = parseJsonCol(rigRow.published_rig, null);
    const publishedImages = parseJsonCol(rigRow.published_images, null);
    if (!publishedRig || !publishedImages) continue;

    const petStage = rigRow.pet_stage;
    if (!petStage.startsWith(`${petId}/c`)) continue;
    const stageKey = petStage.slice(petId.length + 1); // 'c1'..'c5'

    const approvedClips = approvalsByStage.get(petStage) || [];
    const overrideMap = stagePublished.get(petStage);
    const clips = {};

    for (const clipName of approvedClips) {
      const resolved =
        (overrideMap && overrideMap.get(clipName)) ||
        globalPublished.get(clipName) ||
        baseClips[clipName] ||
        null;
      if (resolved) {
        clips[clipName] = resolved;
      }
    }

    output[stageKey] = {
      rig: publishedRig,
      images: buildImageUrls(publishedImages, assetUrlPrefix),
      clips,
    };
  }

  return output;
}

/**
 * Cache phía server cho API GET /api/pet-motion/:petId.
 */
export function createMotionCache() {
  const store = new Map();
  return {
    get(petId) {
      return store.get(petId);
    },
    has(petId) {
      return store.has(petId);
    },
    set(petId, value) {
      store.set(petId, value);
    },
    invalidate(petId) {
      if (petId) store.delete(petId);
    },
    invalidateAll() {
      store.clear();
    },
    size() {
      return store.size;
    },
  };
}
