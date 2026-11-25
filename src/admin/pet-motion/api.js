/**
 * API client cho trang quản trị /admin/pet-motion + helper tạo rig từ ảnh tách lớp.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const PET_MOTION_API_BASE = API_BASE;

/**
 * Chuẩn hoá URL ảnh động của API thêm hậu tố `/raw` để đường dẫn không kết thúc bằng
 * `.png` / `.webp` — tránh bị rule regex ảnh tĩnh của Nginx chặn nhầm thành 404.
 */
export function normalizeApiAssetUrl(url) {
  if (typeof url !== 'string' || !url) return '';
  if (/\/api\/(admin\/)?pet-motion\/assets\/.+\.(png|webp)$/i.test(url)) {
    return `${url}/raw`;
  }
  return url;
}

export function createPetMotionApi(token) {
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  async function requestJson(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { error: text || `HTTP ${res.status}` };
    }
    if (!res.ok) {
      const err = new Error(json?.error || `Lỗi máy chủ (${res.status})`);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json;
  }

  return {
    getOverview() {
      return requestJson('/api/admin/pet-motion/overview');
    },
    createPet(payload) {
      return requestJson('/api/admin/pet-motion/pets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    updatePet(petId, payload) {
      return requestJson(`/api/admin/pet-motion/pets/${encodeURIComponent(petId)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    deletePet(petId) {
      return requestJson(`/api/admin/pet-motion/pets/${encodeURIComponent(petId)}`, {
        method: 'DELETE',
      });
    },
    getDetail(petId, stage) {
      return requestJson(`/api/admin/pet-motion/${encodeURIComponent(petId)}/${stage}`);
    },
    saveClip({ scope_key, clip, data, expected_updated_at }) {
      return requestJson('/api/admin/pet-motion/clip', {
        method: 'PUT',
        body: JSON.stringify({ scope_key, clip, data, expected_updated_at }),
      });
    },
    deleteClip({ scope_key, clip }) {
      return requestJson('/api/admin/pet-motion/clip', {
        method: 'DELETE',
        body: JSON.stringify({ scope_key, clip }),
      });
    },
    getAffectedBySharedClip(clip) {
      return requestJson(`/api/admin/pet-motion/clip/affected?clip=${encodeURIComponent(clip)}`);
    },
    publishClip({ scope_key, clip, resetApprovals = true }) {
      return requestJson('/api/admin/pet-motion/clip/publish', {
        method: 'POST',
        body: JSON.stringify({ scope_key, clip, resetApprovals }),
      });
    },
    saveRig(petId, stage, rig, expected_updated_at) {
      return requestJson(`/api/admin/pet-motion/${encodeURIComponent(petId)}/${stage}/rig`, {
        method: 'PUT',
        body: JSON.stringify({ rig, expected_updated_at }),
      });
    },
    uploadPart(petId, stage, part, file) {
      const form = new FormData();
      form.append('file', file);
      return requestJson(
        `/api/admin/pet-motion/${encodeURIComponent(petId)}/${stage}/parts/${encodeURIComponent(part)}`,
        { method: 'POST', body: form }
      );
    },
    uploadAvatar(petId, stage, file) {
      const form = new FormData();
      form.append('file', file);
      return requestJson(
        `/api/admin/pet-motion/${encodeURIComponent(petId)}/${stage}/avatar`,
        { method: 'POST', body: form }
      );
    },
    getCustomEmojis() {
      return requestJson('/api/admin/pet-motion/emojis');
    },
    uploadCustomEmoji(file, name = '') {
      const form = new FormData();
      form.append('file', file);
      if (name) form.append('name', name);
      return requestJson('/api/admin/pet-motion/emojis', {
        method: 'POST',
        body: form,
      });
    },
    deleteCustomEmoji(file) {
      return requestJson(`/api/admin/pet-motion/emojis/${encodeURIComponent(file)}`, {
        method: 'DELETE',
      });
    },
    approveRig(petId, stage) {
      return requestJson(`/api/admin/pet-motion/${encodeURIComponent(petId)}/${stage}/approve-rig`, {
        method: 'POST',
      });
    },
    approveClip(petId, stage, { clip, approved }) {
      return requestJson(`/api/admin/pet-motion/${encodeURIComponent(petId)}/${stage}/approve`, {
        method: 'POST',
        body: JSON.stringify({ clip, approved }),
      });
    },
    getLearnerMotion(petId) {
      return requestJson(`/api/pet-motion/${encodeURIComponent(petId)}`);
    },
    /**
     * Tải ảnh bộ phận có gửi Authorization header (bắt buộc cho ảnh nháp chỉ admin).
     * Trả về { img, objectUrl } — caller cần revoke objectUrl khi dọn dẹp.
     */
    async loadImage(url, { authenticated = true } = {}) {
      const safeUrl = normalizeApiAssetUrl(url);
      const fullUrl = safeUrl.startsWith('http') ? safeUrl : `${API_BASE}${safeUrl}`;
      if (!authenticated) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ img, objectUrl: null });
          img.onerror = () => reject(new Error(`Không tải được ảnh ${url}`));
          img.src = fullUrl;
        });
      }
      const res = await fetch(fullUrl, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Không tải được ảnh (${res.status})`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ img, objectUrl });
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Ảnh hỏng: ${url}`));
        };
        img.src = objectUrl;
      });
    },
  };
}

// ── Quy cách kích thước ảnh theo thiết kế PetRig (420×460 @ 2× DPR) & GDE-PET-IMAGES ──
export const MAX_PET_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB (khớp giới hạn server)

export const STAGE_IMAGE_SPECS = Object.freeze({
  1: { stage: 1, name: 'C1 · Trứng',      recommended: 512, minEdge: 320, maxEdge: 640, targetLogicH: 255 },
  2: { stage: 2, name: 'C2 · Baby',       recommended: 512, minEdge: 360, maxEdge: 640, targetLogicH: 285 },
  3: { stage: 3, name: 'C3 · Junior',     recommended: 512, minEdge: 400, maxEdge: 700, targetLogicH: 315 },
  4: { stage: 4, name: 'C4 · Super',      recommended: 640, minEdge: 480, maxEdge: 800, targetLogicH: 345 },
  5: { stage: 5, name: 'C5 · Huyền thoại', recommended: 640, minEdge: 512, maxEdge: 800, targetLogicH: 375 },
});

export function getStageImageSpec(stage) {
  const s = Math.max(1, Math.min(5, Number(stage) || 1));
  return STAGE_IMAGE_SPECS[s];
}

export async function readImageDimensions(file) {
  const img = await readImageFromFile(file);
  return { width: img.width, height: img.height };
}

export function createBlankStudioCanvas(width = 512, height = 512) {
  const c = document.createElement('canvas');
  c.width = Math.max(16, Math.round(width));
  c.height = Math.max(16, Math.round(height));
  return c;
}

/**
 * Tải bất kỳ nguồn ảnh pet hiện có (ảnh tĩnh /assets/..., ảnh avatar/draft qua API,
 * ảnh bộ phận đang mở hoặc khung trống) sang HTMLCanvasElement sạch (không bị taint CORS)
 * để mở trong PartPaintModal cho họa sĩ tự cắt / tự vẽ lại.
 */
export async function loadAnyPetSourceToCanvas(sourceItem, api = null, targetSize = null) {
  if (!sourceItem || sourceItem.kind === 'blank') {
    const w = targetSize?.[0] || sourceItem?.width || 512;
    const h = targetSize?.[1] || sourceItem?.height || 512;
    return createBlankStudioCanvas(w, h);
  }

  let rawImg = sourceItem.img || null;
  let tempObjUrl = null;

  try {
    if (!rawImg && sourceItem.file instanceof Blob) {
      rawImg = await readImageFromFile(sourceItem.file);
    } else if (!rawImg && sourceItem.url) {
      const safeUrl = normalizeApiAssetUrl(sourceItem.url);
      if (/\/api\/admin\/pet-motion\/assets\//.test(safeUrl) && api?.loadImage) {
        const loaded = await api.loadImage(safeUrl, { authenticated: true });
        rawImg = loaded.img;
        tempObjUrl = loaded.objectUrl;
      } else {
        const fetchUrl = safeUrl.startsWith('http')
          ? safeUrl
          : safeUrl.startsWith('/api/')
          ? `${API_BASE}${safeUrl}`
          : safeUrl;
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`Không tải được ảnh nguồn (${res.status})`);
        const blob = await res.blob();
        tempObjUrl = URL.createObjectURL(blob);
        rawImg = await new Promise((resolve, reject) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = () => reject(new Error('Không giải mã được ảnh nguồn.'));
          im.src = tempObjUrl;
        });
      }
    }

    if (!rawImg) {
      return createBlankStudioCanvas(targetSize?.[0] || 512, targetSize?.[1] || 512);
    }

    const srcW = rawImg.naturalWidth || rawImg.width || 512;
    const srcH = rawImg.naturalHeight || rawImg.height || 512;

    let outW = srcW;
    let outH = srcH;
    let dx = 0;
    let dy = 0;
    let dw = srcW;
    let dh = srcH;

    if (Array.isArray(targetSize) && targetSize[0] > 0 && targetSize[1] > 0) {
      outW = Math.round(targetSize[0]);
      outH = Math.round(targetSize[1]);
      const sc = Math.min(outW / srcW, outH / srcH);
      dw = Math.max(1, Math.round(srcW * sc));
      dh = Math.max(1, Math.round(srcH * sc));
      dx = Math.round((outW - dw) / 2);
      dy = Math.round((outH - dh) / 2);
    } else if (Math.max(srcW, srcH) > 800) {
      const sc = 640 / Math.max(srcW, srcH);
      outW = Math.max(1, Math.round(srcW * sc));
      outH = Math.max(1, Math.round(srcH * sc));
      dw = outW;
      dh = outH;
    }

    const canvas = createBlankStudioCanvas(outW, outH);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(rawImg, dx, dy, dw, dh);
    return canvas;
  } finally {
    if (tempObjUrl) URL.revokeObjectURL(tempObjUrl);
  }
}

/**
 * Chuyển một nguồn ảnh hiện có của pet sang đối tượng File (PNG/WebP) để nạp vào bảng dựng Rig.
 */
export async function petSourceToFile(sourceItem, fileName = 'body.png', api = null, maxEdge = 640) {
  const targetDim = maxEdge || 512;
  const canvas = await loadAnyPetSourceToCanvas(
    sourceItem,
    api,
    sourceItem?.kind === 'blank' ? [targetDim, targetDim] : null
  );
  let outCanvas = canvas;
  const longest = Math.max(canvas.width, canvas.height);
  if (maxEdge && longest > maxEdge) {
    const sc = maxEdge / longest;
    outCanvas = createBlankStudioCanvas(Math.round(canvas.width * sc), Math.round(canvas.height * sc));
    const ctx = outCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, outCanvas.width, outCanvas.height);
  }
  const blob = await new Promise((resolve, reject) => {
    outCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Không xuất được file ảnh.'))), 'image/png');
  });
  const cleanBase = String(fileName || 'part').replace(/\.[^.]+$/, '');
  return {
    file: new File([blob], `${cleanBase}.png`, { type: 'image/png' }),
    width: outCanvas.width,
    height: outCanvas.height,
  };
}

/**
 * Thu gọn ảnh PNG/WebP quá lớn (> 2 MB hoặc quá nhiều pixel) về chuẩn WebP nền trong suốt
 * đúng cạnh dài mục tiêu (giữ nguyên tỷ lệ, không phóng to ảnh nhỏ hơn).
 */
export async function optimizePartImageFile(file, maxEdge = 640, quality = 0.92) {
  const img = await readImageFromFile(file);
  const longest = Math.max(img.width, img.height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const targetW = Math.max(1, Math.round(img.width * scale));
  const targetH = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) return resolve(b);
        canvas.toBlob(
          (b2) => (b2 ? resolve(b2) : reject(new Error('Không xuất được ảnh đã tối ưu.'))),
          'image/png'
        );
      },
      'image/webp',
      quality
    );
  });

  const ext = blob.type === 'image/webp' ? 'webp' : 'png';
  const baseName = String(file.name || 'part').replace(/\.[^.]+$/, '');
  const nextFile = new File([blob], `${baseName}.${ext}`, { type: blob.type });
  return { file: nextFile, width: targetW, height: targetH };
}

// ── Tự nhận bộ phận + tạo rig mặc định từ nhiều ảnh PNG tách lớp ────────────

const PART_ALIASES = {
  body: 'body',
  head: 'head',
  crown: 'crown',
  arml: 'armL',
  arm_l: 'armL',
  armleft: 'armL',
  armr: 'armR',
  arm_r: 'armR',
  armright: 'armR',
  front: 'front',
  fx: 'fx',
  aura: 'aura',
  eye0: 'eye0',
  eye_0: 'eye0',
  eyel: 'eye0',
  eye_l: 'eye0',
  eye1: 'eye1',
  eye_1: 'eye1',
  eyer: 'eye1',
  eye_r: 'eye1',
};

const SLOT_DEFAULTS = {
  body:  { z: 0,  kind: 'body' },
  head:  { z: 2,  kind: 'head', drive: 'head', face: true, maxRot: 90 },
  crown: { z: -2, kind: 'bend' },
  armL:  { z: -1, kind: 'arm',  drive: 'armL', maxRot: 90 },
  armR:  { z: -1, kind: 'arm',  drive: 'armR', maxRot: 90 },
  front: { z: 3,  kind: 'body' },
  fx:    { z: 3,  kind: 'float' },
  aura:  { z: 3,  kind: 'flicker' },
};

export function inferPartNameFromFile(fileName) {
  const base = String(fileName || '').replace(/\.[^.]+$/, '').trim();
  const norm = base.toLowerCase().replace(/[\s-]+/g, '_');
  if (PART_ALIASES[norm]) return PART_ALIASES[norm];
  // Nếu tên file khớp đúng chuẩn bộ phận hợp lệ (ví dụ tail, wingL) thì giữ nguyên
  if (/^[a-z][a-zA-Z0-9_]{0,30}$/.test(base)) return base;
  return null;
}

function readImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Không đọc được ảnh ${file.name}`));
    };
    img.src = url;
  });
}

function computeAlphaBBox(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  let x0 = img.width;
  let y0 = img.height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (data[(y * img.width + x) * 4 + 3] > 20) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < x0) {
    return { x0: 0, y0: 0, x1: img.width - 1, y1: img.height - 1, w: img.width, h: img.height };
  }
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Từ danh sách `{ part, file }`, đọc ảnh + tính bbox alpha để dựng rig mặc định theo mục 5.4:
 * - body z0, head z2 kind head face:true, crown z-2 kind bend, armL/armR z-1 kind arm,
 *   front z3 kind body, fx z3 kind float, aura z3 kind flicker
 * - pivot mặc định = giữa cạnh dưới vùng có hình của bộ phận đó
 * - ground = điểm thấp nhất của body
 * - size = kích thước ảnh body
 * - eyes: box = vùng có hình của eye0/eye1
 */
export async function buildDefaultRigFromFiles(partFiles) {
  const loaded = [];
  for (const item of partFiles) {
    const img = await readImageFromFile(item.file);
    const bbox = computeAlphaBBox(img);
    loaded.push({ ...item, img, bbox });
  }

  const byPart = new Map(loaded.map((x) => [x.part, x]));
  const bodyEntry = byPart.get('body') || loaded[0];
  const headEntry = byPart.get('head');

  const size = [bodyEntry.img.width, bodyEntry.img.height];
  const ground = [
    +((bodyEntry.bbox.x0 + bodyEntry.bbox.x1) / 2).toFixed(1),
    bodyEntry.bbox.y1,
  ];

  const hasHead = Boolean(headEntry);
  const slots = [];
  const eyes = [];

  for (const entry of loaded) {
    const { part, bbox } = entry;
    if (part === 'eye0' || part === 'eye1') {
      continue;
    }
    const def = SLOT_DEFAULTS[part] || { z: 1, kind: 'body' };
    const slot = {
      name: part,
      img: part,
      z: def.z,
      kind: def.kind,
    };
    if (def.drive) slot.drive = def.drive;
    if (def.maxRot) slot.maxRot = def.maxRot;
    if (def.face) slot.face = true;
    else if (part === 'body' && !hasHead) slot.face = true;

    if (['head', 'bend', 'arm'].includes(def.kind)) {
      slot.pivot = [
        +((bbox.x0 + bbox.x1) / 2).toFixed(1),
        bbox.y1,
      ];
    }
    slots.push(slot);
  }

  slots.sort((a, b) => a.z - b.z);

  for (const eyePart of ['eye0', 'eye1']) {
    const entry = byPart.get(eyePart);
    if (!entry) continue;
    const { bbox } = entry;
    eyes.push({
      c: [+(bbox.x0 + bbox.w / 2).toFixed(1), +(bbox.y0 + bbox.h / 2).toFixed(1)],
      w: bbox.w,
      h: bbox.h,
      box: [bbox.x0, bbox.y0, bbox.w, bbox.h],
    });
  }

  const refHead = headEntry ? headEntry.bbox : bodyEntry.bbox;
  const ellipse = [
    +((bodyEntry.bbox.x0 + bodyEntry.bbox.x1) / 2).toFixed(1),
    +((bodyEntry.bbox.y0 + bodyEntry.bbox.y1) / 2).toFixed(1),
    bodyEntry.bbox.w,
    bodyEntry.bbox.h,
  ];
  const headBox = [
    +((refHead.x0 + refHead.x1) / 2).toFixed(1),
    +((refHead.y0 + refHead.y1) / 2).toFixed(1),
    refHead.w,
    refHead.h,
  ];
  const headLine = headEntry ? headEntry.bbox.y1 : Math.round(bodyEntry.bbox.y0 + bodyEntry.bbox.h * 0.55);

  let mouth = null;
  if (eyes.length >= 2) {
    const mx = +((eyes[0].c[0] + eyes[1].c[0]) / 2).toFixed(1);
    const my = +(Math.max(eyes[0].c[1], eyes[1].c[1]) + Math.max(eyes[0].h, eyes[1].h) * 0.85).toFixed(1);
    mouth = [mx, my, Math.max(8, Math.round(Math.max(eyes[0].w, eyes[1].w) * 0.6))];
  }

  return {
    size,
    ground,
    slots,
    eyes,
    mouth,
    ellipse,
    headBox,
    headLine,
  };
}
