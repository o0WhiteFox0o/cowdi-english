/**
 * Engine chỉnh động tác pet (tách từ public/pet-editor/index.html, bỏ localStorage/IndexedDB,
 * kết nối trực tiếp API server + hỗ trợ chế độ Xem như người học và phát thử 1 vòng 1× khi duyệt).
 */
import { CLIPS, STAGE_FACTORS, GROUP_FACTORS } from '../../../shared/pet-motion.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TAU = Math.PI * 2;
const TARGET = [140, 200, 255, 315, 375];

export const CHANNELS_SPEC = {
  rot:   [-30, 30, 0, '°'],
  dx:    [-0.3, 0.3, 0, ''],
  dy:    [-0.5, 0.2, 0, ''],
  sx:    [0.6, 1.4, 1, '×'],
  sy:    [0.6, 1.4, 1, '×'],
  head:  [-30, 30, 0, '°'],
  crown: [-40, 40, 0, '°'],
  cskew: [-0.3, 0.3, 0, ''],
  armL:  [-60, 120, 0, '°'],
  armR:  [-60, 120, 0, '°'],
  mouth: [0, 1, 0, ''],
  lookX: [-1, 1, 0, ''],
  lookY: [-1, 1, 0, ''],
  glow:  [0, 1, 0, ''],
  eyes:  ['open', 'closed', 'happy', 'half', 'wide', 'spiral'],
};

const CHN = Object.keys(CHANNELS_SPEC);

const CHANNEL_LABELS = {
  rot:   { vi: 'Nghiêng thân',  tip: 'Xoay nghiêng toàn bộ pet (độ °)' },
  dx:    { vi: 'Dịch ngang',    tip: 'Di chuyển pet sang trái / phải' },
  dy:    { vi: 'Nhún lên/xuống',tip: 'Nhảy lên (âm) hoặc nhún xuống (dương)' },
  sx:    { vi: 'Phình ngang',   tip: 'Co giãn chiều rộng thân (1.00× = mặc định)' },
  sy:    { vi: 'Kéo cao/lùn',   tip: 'Co giãn chiều cao thân (1.00× = mặc định)' },
  head:  { vi: 'Gật / lắc đầu', tip: 'Xoay đầu quanh cổ (độ °)' },
  crown: { vi: 'Lắc chỏm/tai',  tip: 'Nghiêng chỏm lá, tai hoặc sừng (độ °)' },
  cskew: { vi: 'Uốn chỏm',      tip: 'Độ uốn cong mềm của chỏm lá / tai' },
  armL:  { vi: 'Tay trái',      tip: 'Vung tay trái (độ °)' },
  armR:  { vi: 'Tay phải',      tip: 'Vung tay phải (độ °)' },
  mouth: { vi: 'Độ mở miệng',   tip: '0 = khép miệng · 1 = mở to' },
  lookX: { vi: 'Mắt trái/phải', tip: 'Hướng liếc mắt ngang (-1 trái .. +1 phải)' },
  lookY: { vi: 'Mắt lên/xuống', tip: 'Hướng nhìn dọc (-1 lên .. +1 xuống)' },
  glow:  { vi: 'Phát sáng',     tip: 'Hào quang sáng quanh pet (0..1)' },
  eyes:  { vi: 'Biểu cảm mắt',  tip: 'Kiểu mắt: mở, nhắm, cười, lim dim, tròn xoe, chóng mặt' },
};

const EYE_LABELS = {
  open:   'Mở bình thường (open)',
  closed: 'Nhắm mắt (closed)',
  happy:  'Cười híp mắt (happy)',
  half:   'Lim dim / buồn ngủ (half)',
  wide:   'Tròn xoe ngạc nhiên (wide)',
  spiral: 'Chóng mặt (spiral)',
};

const PART_LABELS = {
  body: 'Thân',
  head: 'Đầu',
  crown: 'Chỏm',
  armL: 'Tay trái',
  armR: 'Tay phải',
  front: 'Lớp trước',
  fx: 'Hiệu ứng trôi',
  aura: 'Hào quang',
  eye0: 'Mắt 1',
  eye1: 'Mắt 2',
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

function computeImageBBox(img) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const { data } = g.getImageData(0, 0, img.width, img.height);
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

function val(c, tr, t) {
  const k = tr?.[c];
  if (!k || !k.length) return c === 'eyes' ? 'open' : CHANNELS_SPEC[c][2];
  if (t <= k[0][0]) return k[0][1];
  const last = k[k.length - 1];
  if (t >= last[0]) return last[1];
  let i = 0;
  while (i < k.length - 1 && k[i + 1][0] <= t) i++;
  const a = k[i];
  const b = k[i + 1];
  if (c === 'eyes' || a[2] === 'step') return a[1];
  const u = (t - a[0]) / (b[0] - a[0]);
  return a[1] + (b[1] - a[1]) * (a[2] === 'linear' ? u : (1 - Math.cos(u * Math.PI)) / 2);
}

function keyTimes(cl) {
  const s = new Set();
  for (const c in cl.tracks) {
    for (const k of cl.tracks[c]) s.add(+k[0].toFixed(3));
  }
  return [...s].sort((a, b) => a - b);
}

/**
 * Khởi tạo bàn dựng canvas + timeline + bảng kênh + khung Hình bộ phận trên `rootEl`.
 */
export function initEditor(rootEl, api, opts = {}) {
  const $ = (role) => rootEl.querySelector(`[data-pm="${role}"]`);
  const cv = $('cv');
  const ctx = cv.getContext('2d');
  const tl = $('tl');
  const tctx = tl.getContext('2d');
  const chansEl = $('chans');
  const partsEl = $('parts');
  const numsEl = $('nums');

  const LW = 640;
  const LH = 480;
  const GY = 430;
  const CX = 320;
  const LBL = 116;
  const ROW = 22;
  const TL_HEADER = 22;
  const inkColor = getComputedStyle(rootEl).color || '#14321f';

  const state = {
    petId: opts.petId || 'bamboo',
    petLabel: opts.petLabel || 'Bamboo',
    group: opts.group || 'farm',
    stage: opts.stage || 3, // 1..5
    clip: opts.clip || 'cheer_small',
    scope: 'one', // 'all' | 'one'
    rig: null,
    images: {},       // part -> HTMLImageElement
    imageUrls: {},    // part -> url
    objectUrls: [],   // object URLs cần revoke
    alphaCache: {},
    sharedClips: {},  // clip -> { draft, published, status, updatedAt, ... }
    overrideClips: {},// clip -> { draft, published, status, updatedAt, ... }
    rigUpdatedAt: null,
    time: 0,
    playing: true,
    speed: 1,
    selCh: 'armR',
    selKey: null,
    onion: false,
    useTempo: false,
    dmode: 'pose',    // 'pose' | 'move' | 'pivot'
    selPart: 'body',
    learnerPreview: false,
    learnerStageData: null, // { rig, images, clips } từ GET /api/pet-motion/:petId
    learnerImages: {},
    learnerObjectUrls: [],
    emojiImgCache: {}, // imageUrl -> HTMLImageElement
    previewOnce: null, // { resolve, startTime } khi bấm duyệt chạy 1 vòng 1×
    destroyed: false,
  };

  let hitInfo = [];
  let pivots = {};
  let dragging = null;
  let tlDrag = null;
  let rafId = null;
  let lastFrame = performance.now();
  let saveClipTimer = null;
  let saveRigTimer = null;
  let pendingClipSave = null;
  let pendingRigSave = false;
  let loadSeq = 0;

  const petStageKey = () => `${state.petId}/c${state.stage}`;
  const groupFactor = () => GROUP_FACTORS[state.group] || [1, 1];
  const stageIdx = () => clamp(state.stage - 1, 0, 4);

  function notifySave(status, detail) {
    opts.onSaveState?.(status, detail);
  }

  function toast(msg) {
    opts.onToast?.(msg);
  }

  function revokeUrls(list) {
    for (const u of list) {
      if (u) URL.revokeObjectURL(u);
    }
    list.length = 0;
  }

  function currentRig() {
    if (state.learnerPreview) {
      return state.learnerStageData?.rig || null;
    }
    return state.rig;
  }

  function currentImg(part) {
    if (state.learnerPreview) {
      return state.learnerImages[part] || null;
    }
    return state.images[part] || null;
  }

  function getClip() {
    if (state.learnerPreview) {
      const approved = state.learnerStageData?.clips?.[state.clip];
      if (approved) return approved;
      // Chưa duyệt clip này: đứng yên tư thế nghỉ (không phát clip chưa duyệt)
      return { dur: 1, loop: true, tracks: {} };
    }
    const ov = state.overrideClips[state.clip]?.draft;
    const sh = state.sharedClips[state.clip]?.draft;
    if (state.scope === 'one' && ov) return ov;
    if (state.scope === 'all' && sh) return sh;
    if (state.scope === 'one') return sh || CLIPS[state.clip];
    return CLIPS[state.clip];
  }

  function editableClip() {
    if (state.scope === 'one') {
      if (!state.overrideClips[state.clip]) {
        state.overrideClips[state.clip] = {
          draft: structuredClone(getClip()),
          published: null,
          status: 'draft',
          hasUnpublishedChanges: true,
          updatedAt: null,
        };
      }
      return state.overrideClips[state.clip].draft;
    }
    if (!state.sharedClips[state.clip]) {
      state.sharedClips[state.clip] = {
        draft: structuredClone(getClip()),
        published: null,
        status: 'draft',
        hasUnpublishedChanges: true,
        updatedAt: null,
      };
    }
    return state.sharedClips[state.clip].draft;
  }

  function channelsAt(cl, t) {
    const o = {};
    for (const c of CHN) o[c] = val(c, cl.tracks, t);
    if (state.useTempo || state.learnerPreview) {
      const A = STAGE_FACTORS[stageIdx()][1] * groupFactor()[1];
      for (const c of ['rot', 'dx', 'dy', 'crown', 'cskew', 'head', 'armL', 'armR']) o[c] *= A;
      o.sx = 1 + (o.sx - 1) * A;
      o.sy = 1 + (o.sy - 1) * A;
    }
    return o;
  }

  // ── Debounced save lên server (800 ms) ─────────────────────────
  async function flushClipSave({ force = false } = {}) {
    if (!pendingClipSave) return;
    const { scopeKey, clipName, data, expectedUpdatedAt } = pendingClipSave;
    pendingClipSave = null;
    clearTimeout(saveClipTimer);
    saveClipTimer = null;

    notifySave('saving', { kind: 'clip', scopeKey, clipName });
    try {
      const res = await api.saveClip({
        scope_key: scopeKey,
        clip: clipName,
        data,
        expected_updated_at: force ? undefined : expectedUpdatedAt,
      });
      const bucket = scopeKey === '' ? state.sharedClips : state.overrideClips;
      if (bucket[clipName]) {
        bucket[clipName].updatedAt = res.updatedAt;
        bucket[clipName].status = res.status;
        bucket[clipName].hasUnpublishedChanges = true;
      }
      notifySave('saved', { kind: 'clip', at: new Date() });
      opts.onDataMutated?.({ kind: 'clip', scopeKey, clipName, updatedAt: res.updatedAt });
    } catch (err) {
      if (err.status === 409) {
        notifySave('conflict', {
          kind: 'clip',
          scopeKey,
          clipName,
          message: err.message,
          retryForce: () => {
            pendingClipSave = { scopeKey, clipName, data, expectedUpdatedAt: undefined };
            return flushClipSave({ force: true });
          },
        });
      } else {
        notifySave('error', {
          kind: 'clip',
          message: err.message,
          retry: () => {
            pendingClipSave = { scopeKey, clipName, data, expectedUpdatedAt };
            return flushClipSave();
          },
        });
      }
    }
  }

  function scheduleClipSave() {
    if (state.learnerPreview) return;
    const scopeKey = state.scope === 'one' ? petStageKey() : '';
    const clipName = state.clip;
    const bucket = scopeKey === '' ? state.sharedClips : state.overrideClips;
    const entry = bucket[clipName];
    if (!entry?.draft) return;

    pendingClipSave = {
      scopeKey,
      clipName,
      data: structuredClone(entry.draft),
      expectedUpdatedAt: entry.updatedAt || undefined,
    };
    notifySave('dirty', { kind: 'clip' });
    clearTimeout(saveClipTimer);
    saveClipTimer = setTimeout(() => { flushClipSave(); }, 800);
  }

  async function flushRigSave({ force = false } = {}) {
    if (!pendingRigSave || !state.rig) return;
    pendingRigSave = false;
    clearTimeout(saveRigTimer);
    saveRigTimer = null;

    const rigCopy = structuredClone(state.rig);
    const expected = force ? undefined : (state.rigUpdatedAt || undefined);
    notifySave('saving', { kind: 'rig' });
    try {
      const res = await api.saveRig(state.petId, state.stage, rigCopy, expected);
      state.rigUpdatedAt = res.updatedAt;
      notifySave('saved', { kind: 'rig', at: new Date() });
      opts.onDataMutated?.({ kind: 'rig', updatedAt: res.updatedAt });
    } catch (err) {
      if (err.status === 409) {
        notifySave('conflict', {
          kind: 'rig',
          message: err.message,
          retryForce: () => {
            pendingRigSave = true;
            return flushRigSave({ force: true });
          },
        });
      } else {
        notifySave('error', {
          kind: 'rig',
          message: err.message,
          retry: () => {
            pendingRigSave = true;
            return flushRigSave();
          },
        });
      }
    }
  }

  function scheduleRigSave() {
    if (state.learnerPreview || !state.rig) return;
    pendingRigSave = true;
    notifySave('dirty', { kind: 'rig' });
    clearTimeout(saveRigTimer);
    saveRigTimer = setTimeout(() => { flushRigSave(); }, 800);
  }

  // ── Rig helpers (off, sc, pivot lưu trực tiếp trên slot / eye) ──
  function findSlot(part) {
    return currentRig()?.slots?.find((s) => s.img === part) || null;
  }
  function findEye(part) {
    if (!part.startsWith('eye')) return null;
    const idx = Number(part.slice(3));
    return currentRig()?.eyes?.[idx] || null;
  }
  function offOf(part) {
    const sl = findSlot(part);
    if (sl) return sl.off || [0, 0];
    const ey = findEye(part);
    if (ey) return ey.off || [0, 0];
    return [0, 0];
  }
  function scaleOf(part) {
    const sl = findSlot(part);
    return sl?.sc || 1;
  }

  function alphaAt(part, x, y) {
    const cacheKey = `${state.learnerPreview ? 'pub' : 'draft'}_${part}`;
    let A = state.alphaCache[cacheKey];
    if (!A) {
      const m = currentImg(part);
      if (!m || !m.width) return 0;
      const c = document.createElement('canvas');
      c.width = m.width;
      c.height = m.height;
      const g = c.getContext('2d');
      g.drawImage(m, 0, 0);
      A = state.alphaCache[cacheKey] = {
        w: m.width,
        h: m.height,
        d: g.getImageData(0, 0, m.width, m.height).data,
      };
    }
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= A.w || iy >= A.h) return 0;
    return A.d[(iy * A.w + ix) * 4 + 3];
  }

  // ── Render pet ─────────────────────────────────────────────────
  function eyeDraw(R, mode, lx, ly) {
    (R.eyes || []).forEach((e, i) => {
      const img = currentImg(`eye${i}`);
      const [eox, eoy] = e.off || [0, 0];
      const ox = lx * e.w * 0.22 + eox;
      const oy = ly * e.h * 0.16 + eoy;
      const cx = e.c[0] + ox;
      const cy = e.c[1] + oy;
      const w = e.w;
      const h = e.h;
      const lw = Math.max(2.2, w * 0.16);
      const [bx, by, bw, bh] = e.box;
      ctx.strokeStyle = '#2a1a14';
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      if (mode === 'open' || mode === 'wide') {
        const k = mode === 'wide' ? 1.18 : 1;
        if (img && img.width) ctx.drawImage(img, cx - (e.c[0] - bx) * k, cy - (e.c[1] - by) * k, bw * k, bh * k);
      } else if (mode === 'half') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - w, cy - h * 0.05, w * 2, h);
        ctx.clip();
        if (img && img.width) ctx.drawImage(img, bx + ox, by + oy, bw, bh);
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.55, cy - h * 0.05);
        ctx.lineTo(cx + w * 0.55, cy - h * 0.05);
        ctx.stroke();
      } else if (mode === 'closed') {
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.5, cy);
        ctx.quadraticCurveTo(cx, cy + h * 0.35, cx + w * 0.5, cy);
        ctx.stroke();
      } else if (mode === 'happy') {
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.5, cy + h * 0.12);
        ctx.quadraticCurveTo(cx, cy - h * 0.55, cx + w * 0.5, cy + h * 0.12);
        ctx.stroke();
      } else if (mode === 'spiral') {
        ctx.lineWidth = lw * 0.7;
        ctx.beginPath();
        for (let a = 0; a < TAU * 2.2; a += 0.2) {
          const r = (w * 0.5 * a) / (TAU * 2.2);
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.stroke();
      }
    });
  }

  function mouthDraw(R, m) {
    if (m <= 0.02 || !R.mouth) return;
    const [cx, cy, w] = R.mouth;
    const h = w * 1.1 * m;
    ctx.fillStyle = '#5a2a22';
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * (0.6 + 0.4 * m), Math.max(1.5, h), 0, 0, TAU);
    ctx.fill();
    if (m > 0.4) {
      ctx.fillStyle = '#f29aa6';
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.45, w * 0.45, h * 0.4, 0, 0, Math.PI);
      ctx.fill();
    }
  }

  function drawPet(R, ch, alpha, record) {
    const scale = (TARGET[stageIdx()] / (R.size?.[1] || 200)) * 1.15;
    const [gX, gYs] = R.ground || [(R.size?.[0] || 200) / 2, (R.size?.[1] || 200) - 1];
    const gx = CX + ch.dx * (R.size?.[0] || 200) * scale;
    const gy = GY + ch.dy * (R.size?.[1] || 200) * scale;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (alpha === 1) {
      ctx.fillStyle = 'rgba(30,50,30,.2)';
      ctx.beginPath();
      ctx.ellipse(CX, GY + 4, (R.size?.[0] || 200) * scale * 0.36, 9, 0, 0, TAU);
      ctx.fill();
    }
    if (ch.glow > 0 && alpha === 1) {
      const r = (R.size?.[1] || 200) * scale * 0.75;
      const g = ctx.createRadialGradient(gx, gy - r * 0.6, r * 0.1, gx, gy - r * 0.6, r);
      g.addColorStop(0, `rgba(255,236,150,${0.55 * ch.glow})`);
      g.addColorStop(1, 'rgba(255,236,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(gx - r, gy - r * 1.6, r * 2, r * 2);
    }

    ctx.translate(gx, gy);
    ctx.scale(scale, scale);
    ctx.rotate((ch.rot * Math.PI) / 180);
    ctx.scale(ch.sx, ch.sy);
    ctx.translate(-gX, -gYs);

    if (record) {
      hitInfo = [];
      pivots = { rot: ctx.getTransform().transformPoint(new DOMPoint(gX, gYs)) };
    }

    for (const sl of [...(R.slots || [])].sort((a, b) => a.z - b.z)) {
      const img = currentImg(sl.img);
      if (!img || !img.width) continue;
      ctx.save();
      let drive = null;
      const PV = sl.pivot;
      const pm = ctx.getTransform();

      if (sl.kind === 'bend' && PV) {
        const [px, py] = PV;
        drive = 'crown';
        if (record) pivots.crown = pm.transformPoint(new DOMPoint(px, py));
        ctx.translate(px, py);
        ctx.rotate((ch.crown * Math.PI) / 180);
        ctx.transform(1, 0, ch.cskew, 1, 0, 0);
        ctx.translate(-px, -py);
      } else if (sl.kind === 'head' && PV) {
        const [px, py] = PV;
        drive = 'head';
        if (record) pivots.head = pm.transformPoint(new DOMPoint(px, py));
        ctx.translate(px, py);
        ctx.rotate(((ch.crown * 0.45 + ch.head) * Math.PI) / 180);
        ctx.translate(-px, -py);
      } else if (sl.kind === 'arm' && PV) {
        const [px, py] = PV;
        const maxRot = sl.maxRot ?? 90;
        const v = clamp(sl.drive === 'armL' ? ch.armL : -ch.armR, -maxRot, maxRot);
        drive = sl.drive;
        if (record) pivots[sl.drive] = pm.transformPoint(new DOMPoint(px, py));
        ctx.translate(px, py);
        ctx.rotate((v * Math.PI) / 180);
        ctx.translate(-px, -py);
      } else if (sl.kind === 'body') {
        drive = 'body';
      }

      const [ofx, ofy] = sl.off || [0, 0];
      const sc = sl.sc || 1;
      ctx.drawImage(img, ofx, ofy, img.width * sc, img.height * sc);

      if (record) {
        hitInfo.push({
          img: sl.img,
          drive: drive || sl.img,
          z: sl.z,
          m: ctx.getTransform(),
          pm,
          off: [ofx, ofy],
          sc,
          hasPivot: Boolean(sl.pivot),
        });
      }
      if (sl.face) {
        eyeDraw(R, ch.eyes, ch.lookX, ch.lookY);
        mouthDraw(R, ch.mouth);
      }
      ctx.restore();
    }
    ctx.restore();

    // Biểu cảm emoji nổi (Unicode hoặc ảnh tự thiết kế PNG/WebP — 100% rõ nét, không mờ)
    if (alpha === 1 && state._currentEmoji?.enabled && (state._currentEmoji?.imageUrl || state._currentEmoji?.char)) {
      const em = state._currentEmoji;
      const petH = (R.size?.[1] || 200) * scale;
      const petW = (R.size?.[0] || 200) * scale;
      const pos = em.pos || 'top-right';
      const ex = pos === 'top-left' ? gx - petW * 0.42 : pos === 'top-center' ? gx : gx + petW * 0.42;
      const bob = Math.sin(state.time * Math.PI * 2) * 5;
      const ey = Math.max(40, gy - petH * 0.92 + bob);
      const pop = state.time < 0.14 ? 0.65 + (state.time / 0.14) * 0.35 : 1;

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000000';
      ctx.translate(ex, ey);
      ctx.scale(pop, pop);

      if (em.imageUrl) {
        let img = state.emojiImgCache[em.imageUrl];
        if (!img) {
          img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = em.imageUrl.startsWith('http')
            ? em.imageUrl
            : `${opts.apiBase || ''}${em.imageUrl}`;
          state.emojiImgCache[em.imageUrl] = img;
        }
        if (img.complete && img.naturalWidth > 0) {
          const maxDim = 48;
          const ratio = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
          const dw = img.naturalWidth * ratio;
          const dh = img.naturalHeight * ratio;
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        }
      } else if (em.char) {
        ctx.font = '36px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(em.char, 0, 0);
      }
      ctx.restore();
    }
  }

  // ── Timeline draw ──────────────────────────────────────────────
  function tlX(t, cl) {
    const W = tl.clientWidth || 400;
    return LBL + ((W - LBL - 14) * t) / (cl.dur || 1);
  }

  function drawTL(cl) {
    const d = window.devicePixelRatio || 1;
    const W = tl.clientWidth;
    const H = tl.clientHeight;
    if (!W || !H) return;
    if (tl.width !== Math.round(W * d) || tl.height !== Math.round(H * d)) {
      tl.width = Math.round(W * d);
      tl.height = Math.round(H * d);
    }
    const g = tctx;
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, W, H);
    const ink = inkColor;
    g.font = '11.5px system-ui,-apple-system,sans-serif';

    for (let s = 0; s <= cl.dur + 1e-6; s += 0.1) {
      const x = tlX(s, cl);
      const major = Math.abs(s - Math.round(s * 2) / 2) < 1e-6;
      g.fillStyle = major ? 'rgba(120,140,125,.45)' : 'rgba(120,140,125,.14)';
      g.fillRect(x, 0, 1, H);
      if (major) {
        g.fillStyle = ink;
        g.globalAlpha = 0.65;
        g.fillText(`${s.toFixed(1)}s`, x + 2, 14);
        g.globalAlpha = 1;
      }
    }

    // Vạch phân cách giữa cột tên kênh và vùng keyframe
    g.fillStyle = 'rgba(120,140,125,.28)';
    g.fillRect(LBL - 4, 0, 1, H);
    g.fillRect(0, TL_HEADER - 1, W, 1);

    CHN.forEach((c, i) => {
      const y = TL_HEADER + i * ROW;
      if (c === state.selCh) {
        g.fillStyle = 'rgba(47,158,79,.16)';
        g.fillRect(0, y, W, ROW);
      } else if (i % 2 === 1) {
        g.fillStyle = 'rgba(20,50,31,.025)';
        g.fillRect(0, y, W, ROW);
      }
      const hasTrack = Boolean(cl.tracks[c]?.length);
      g.fillStyle = c === state.selCh ? '#1d6f35' : ink;
      g.font = c === state.selCh ? '700 11.5px system-ui,-apple-system,sans-serif' : '500 11.5px system-ui,-apple-system,sans-serif';
      g.globalAlpha = hasTrack || c === state.selCh ? 1 : 0.48;
      g.fillText(CHANNEL_LABELS[c]?.vi || c, 6, y + 15);
      g.globalAlpha = 1;

      const k = cl.tracks[c] || [];
      if (k.length > 1 && c !== 'eyes') {
        g.strokeStyle = 'rgba(224,145,47,.62)';
        g.lineWidth = 1.6;
        g.beginPath();
        const [a, b] = CHANNELS_SPEC[c];
        const x0 = tlX(0, cl);
        const x1 = tlX(cl.dur, cl);
        for (let x = x0; x <= x1; x += 2) {
          const t = ((x - LBL) / (W - LBL - 14)) * cl.dur;
          const v = val(c, cl.tracks, t);
          const yy = y + ROW - 4 - ((v - a) / (b - a)) * (ROW - 8);
          if (x === x0) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        g.stroke();
      }
      for (const kk of k) {
        const x = tlX(kk[0], cl);
        const sel = state.selKey && state.selKey.c === c && Math.abs(state.selKey.t - kk[0]) < 1e-4;
        const atHead = Math.abs(kk[0] - state.time) < 0.014;
        g.save();
        g.translate(x, y + ROW / 2);
        g.rotate(Math.PI / 4);
        const sz = sel ? 6.2 : 5.2;
        g.fillStyle = sel ? '#d63031' : atHead ? '#ff9f1c' : '#e0912f';
        g.strokeStyle = '#ffffff';
        g.lineWidth = 1.4;
        g.fillRect(-sz, -sz, sz * 2, sz * 2);
        g.strokeRect(-sz, -sz, sz * 2, sz * 2);
        g.restore();
      }
    });

    const px = tlX(state.time, cl);
    g.fillStyle = '#2f9e4f';
    g.fillRect(px - 1, 0, 2, H);
    // Đầu mũi tên nhỏ của đầu đọc phía trên
    g.beginPath();
    g.moveTo(px - 5, 0);
    g.lineTo(px + 5, 0);
    g.lineTo(px, 7);
    g.closePath();
    g.fill();
  }

  // ── Channel controls (1 dòng = đúng 26px khớp hàng 1-1 với dòng thời gian) ──
  chansEl.innerHTML = CHN.map((c) => {
    const meta = CHANNEL_LABELS[c] || { vi: c, tip: '' };
    const ctrl =
      c === 'eyes'
        ? `<select data-in="eyes" aria-label="${meta.vi}">${CHANNELS_SPEC.eyes
            .map((o) => `<option value="${o}">${EYE_LABELS[o] || o}</option>`)
            .join('')}</select>`
        : `<input type="range" data-in="${c}" min="${CHANNELS_SPEC[c][0]}" max="${CHANNELS_SPEC[c][1]}" step="${(CHANNELS_SPEC[c][1] - CHANNELS_SPEC[c][0]) / 400}" aria-label="${meta.vi}">`;
    return `<div class="pm-ch" data-c="${c}" title="${meta.tip} (${c})">
      <span class="pm-ch-name">${meta.vi}</span>
      ${ctrl}
      <span class="v" data-v="${c}"></span>
      <button type="button" class="pm-key-btn" data-ktog="${c}" title="Đặt hoặc xoá keyframe tại thời điểm hiện tại">◇</button>
    </div>`;
  }).join('');

  // Cache tham chiếu DOM để tránh query & tránh ghi đè DOM khi giá trị không đổi (hết giật khi chạy)
  const chanRows = [...chansEl.children].map((d) => ({
    d,
    c: d.dataset.c,
    inp: d.querySelector('[data-in]'),
    v: d.querySelector('.v'),
    kbtn: d.querySelector('[data-ktog]'),
    lastVal: null,
    lastOnKey: null,
    lastSel: null,
    lastDis: null,
  }));
  const easeEl = $('ease');
  const delBtn = $('delK');
  const tlDelBtn = $('tlDelK');
  const tlAddBtn = $('tlAddK');
  const tlClearChBtn = $('tlClearCh');
  const keyInfoEl = $('keyInfo');
  let lastKeyInfoText = '';
  let lastKeyInfoHas = null;

  function findKeyNearTime(cl, c, t = state.time, tol = 0.015) {
    return (cl.tracks[c] || []).find((k) => Math.abs(k[0] - t) < tol) || null;
  }

  function resolveActiveKeyTarget(cl) {
    if (state.selKey) {
      const k = (cl.tracks[state.selKey.c] || []).find((kk) => Math.abs(kk[0] - state.selKey.t) < 1e-4);
      if (k) return { c: state.selKey.c, t: k[0], key: k };
    }
    const atHead = findKeyNearTime(cl, state.selCh, state.time, 0.018);
    if (atHead) return { c: state.selCh, t: atHead[0], key: atHead };
    return null;
  }

  function updateChans(cl, ch) {
    for (const row of chanRows) {
      const { d, c, inp, v, kbtn } = row;
      const isSel = c === state.selCh;
      if (row.lastSel !== isSel) {
        d.classList.toggle('sel', isSel);
        row.lastSel = isSel;
      }
      const dis = state.learnerPreview;
      if (row.lastDis !== dis) {
        inp.disabled = dis;
        if (kbtn) kbtn.disabled = dis;
        row.lastDis = dis;
      }
      if (document.activeElement !== inp && String(inp.value) !== String(ch[c])) {
        inp.value = ch[c];
      }
      const onKey = Boolean(findKeyNearTime(cl, c, state.time, 0.015));
      const valText =
        c === 'eyes'
          ? onKey
            ? 'key'
            : '—'
          : (+ch[c]).toFixed(c.match(/^(rot|head|crown|armL|armR)$/) ? 1 : 2) + CHANNELS_SPEC[c][3];
      if (row.lastVal !== valText) {
        v.textContent = valText;
        row.lastVal = valText;
      }
      if (row.lastOnKey !== onKey) {
        v.classList.toggle('k', onKey);
        if (kbtn) {
          kbtn.classList.toggle('on', onKey);
          kbtn.textContent = onKey ? '◆' : '◇';
        }
        row.lastOnKey = onKey;
      }
    }

    const activeTarget = resolveActiveKeyTarget(cl);
    const disNoTarget = state.learnerPreview || !activeTarget;
    if (easeEl) {
      if (easeEl.disabled !== disNoTarget) easeEl.disabled = disNoTarget;
      if (activeTarget && document.activeElement !== easeEl) {
        const easeVal = activeTarget.key[2] || 'smooth';
        if (easeEl.value !== easeVal) easeEl.value = easeVal;
      }
    }
    if (delBtn && delBtn.disabled !== disNoTarget) delBtn.disabled = disNoTarget;
    if (tlDelBtn && tlDelBtn.disabled !== disNoTarget) tlDelBtn.disabled = disNoTarget;
    if (tlAddBtn && tlAddBtn.disabled !== state.learnerPreview) tlAddBtn.disabled = state.learnerPreview;
    if (tlClearChBtn) {
      const clearDis = state.learnerPreview || !(cl.tracks[state.selCh]?.length);
      if (tlClearChBtn.disabled !== clearDis) tlClearChBtn.disabled = clearDis;
    }
    if (keyInfoEl) {
      const chName = CHANNEL_LABELS[state.selCh]?.vi || state.selCh;
      const hasKey = Boolean(activeTarget);
      const nextText = activeTarget
        ? `◆ ${CHANNEL_LABELS[activeTarget.c]?.vi || activeTarget.c} (${activeTarget.c}) · ${activeTarget.t.toFixed(2)}s`
        : `${chName} (${state.selCh}) · ${state.time.toFixed(2)}s`;
      if (lastKeyInfoText !== nextText) {
        keyInfoEl.textContent = nextText;
        lastKeyInfoText = nextText;
      }
      if (lastKeyInfoHas !== hasKey) {
        keyInfoEl.classList.toggle('has-key', hasKey);
        lastKeyInfoHas = hasKey;
      }
    }
  }

  function setKey(c, v, t = state.time, { saveNow = true } = {}) {
    if (state.learnerPreview) return;
    const C = editableClip();
    const tr = (C.tracks[c] ??= []);
    const tt = +t.toFixed(3);
    let k = tr.find((kk) => Math.abs(kk[0] - tt) < 0.015);
    if (k) k[1] = v;
    else {
      k = [tt, v, c === 'eyes' ? 'step' : 'smooth'];
      tr.push(k);
      tr.sort((a, b) => a[0] - b[0]);
      if (C.loop && tr.length === 1 && tt > 0) {
        tr.unshift([0, v, k[2]]);
        tr.push([C.dur, v, k[2]]);
      }
    }
    if (C.loop) {
      const f = tr[0];
      const l = tr[tr.length - 1];
      if (Math.abs(k[0]) < 1e-3 && Math.abs(l[0] - C.dur) < 1e-3) l[1] = v;
      if (Math.abs(k[0] - C.dur) < 1e-3 && Math.abs(f[0]) < 1e-3) f[1] = v;
    }
    state.selKey = { c, t: k[0] };
    if (saveNow) scheduleClipSave();
  }

  function deleteKeyExact(c, t) {
    if (state.learnerPreview) return false;
    const C = editableClip();
    const tr = C.tracks[c] || [];
    const i = tr.findIndex((k) => Math.abs(k[0] - t) < 0.015);
    if (i < 0) return false;
    tr.splice(i, 1);
    if (!tr.length) delete C.tracks[c];
    if (state.selKey && state.selKey.c === c && Math.abs(state.selKey.t - t) < 0.015) {
      state.selKey = null;
    }
    scheduleClipSave();
    return true;
  }

  function delKey() {
    if (state.learnerPreview) return;
    const target = resolveActiveKeyTarget(getClip());
    if (!target) {
      toast('Chưa có keyframe nào được chọn hoặc đứng dưới đầu đọc để xoá.');
      return;
    }
    if (deleteKeyExact(target.c, target.t)) {
      toast(`Đã xoá key "${CHANNEL_LABELS[target.c]?.vi || target.c}" tại ${target.t.toFixed(2)}s.`);
    }
  }

  // ── Parts panel ────────────────────────────────────────────────
  function partNames() {
    const R = currentRig();
    if (!R) return [];
    // Sắp xếp bộ phận từ trên cùng (z cao nhất / vẽ đè lên trước) xuống dưới cùng (z thấp nhất)
    const sortedSlots = [...(R.slots || [])].sort((a, b) => (b.z ?? 0) - (a.z ?? 0));
    return [...sortedSlots.map((s) => s.img), ...(R.eyes || []).map((_, i) => `eye${i}`)];
  }

  function drawThumb(canvas, part) {
    const m = currentImg(part);
    const g = canvas.getContext('2d');
    canvas.width = 96;
    canvas.height = 96;
    g.clearRect(0, 0, 96, 96);
    if (!m || !m.width) return;

    alphaAt(part, 0, 0);
    const cacheKey = `${state.learnerPreview ? 'pub' : 'draft'}_${part}`;
    const A = state.alphaCache[cacheKey];
    if (!A) return;
    let x0 = A.w;
    let y0 = A.h;
    let x1 = 0;
    let y1 = 0;
    for (let y = 0; y < A.h; y += 2) {
      for (let x = 0; x < A.w; x += 2) {
        if (A.d[(y * A.w + x) * 4 + 3] > 20) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 <= x0) {
      x0 = 0;
      y0 = 0;
      x1 = A.w;
      y1 = A.h;
    }
    const w = x1 - x0 + 2;
    const h = y1 - y0 + 2;
    const k = Math.min(88 / w, 88 / h);
    g.drawImage(m, x0, y0, w, h, 48 - (w * k) / 2, 48 - (h * k) / 2, w * k, h * k);
  }

  function renderNums() {
    const R = currentRig();
    if (!R) {
      numsEl.innerHTML = '';
      return;
    }
    const n = state.selPart;
    const sl = findSlot(n);
    const pv = sl?.pivot;
    const o = offOf(n);
    const dis = state.learnerPreview ? 'disabled' : '';
    numsEl.innerHTML =
      `<label>Dời X (px)<input type="number" step="0.5" data-k="ox" value="${o[0]}" ${dis}></label>` +
      `<label>Dời Y (px)<input type="number" step="0.5" data-k="oy" value="${o[1]}" ${dis}></label>` +
      (n.startsWith('eye')
        ? ''
        : `<label>Tỉ lệ<input type="number" step="0.01" min="0.1" data-k="sc" value="${(+scaleOf(n)).toFixed(3)}" ${dis}></label>` +
          `<label title="Số càng lớn bộ phận càng nổi lên trên (vd: body = 0, tay = 1 sẽ nằm trên thân)">Lớp vẽ (z)<input type="number" step="1" data-k="z" value="${sl?.z ?? 0}" ${dis}></label>`) +
      (pv
        ? `<label>Điểm xoay X<input type="number" step="0.5" data-k="px" value="${pv[0]}" ${dis}></label>` +
          `<label>Điểm xoay Y<input type="number" step="0.5" data-k="py" value="${pv[1]}" ${dis}></label>`
        : '');
  }

  function renderParts() {
    const R = currentRig();
    const titleEl = $('partsTitle');
    if (titleEl) titleEl.textContent = `Hình bộ phận · ${state.petLabel} C${state.stage}`;
    if (!R) {
      partsEl.innerHTML = '';
      numsEl.innerHTML = '';
      return;
    }
    const names = partNames();
    const slotCount = (R.slots || []).length;
    if (!names.includes(state.selPart)) state.selPart = names[0] || 'body';

    partsEl.innerHTML = names
      .map((n, idx) => {
        const m = currentImg(n);
        const dim = m && m.width ? `${m.width}×${m.height}` : 'chưa có ảnh';
        const isEye = n.startsWith('eye');
        const sl = isEye ? null : findSlot(n);
        const zTag = isEye ? 'mắt' : `z:${sl?.z ?? 0}`;
        const canRemove = !state.learnerPreview && (isEye || slotCount > 1);
        const canReorder = !state.learnerPreview && !isEye && slotCount > 1;
        const isTop = idx === 0;
        const isBottom = idx >= slotCount - 1;
        return `<div class="pm-part${n === state.selPart ? ' sel' : ''}" data-p="${n}">
          <canvas aria-hidden="true"></canvas>
          <div class="nm">${PART_LABELS[n] || n}<small>${n} · ${dim} · <b>${zTag}</b></small></div>
          <div class="pm-row" style="gap:3px">
            ${
              canReorder
                ? `<button type="button" class="pm-btn pm-z-btn" data-zup="${n}" ${isTop ? 'disabled' : ''} title="Đưa lên trên (vẽ đè lên bộ phận bên dưới)">▲</button>` +
                  `<button type="button" class="pm-btn pm-z-btn" data-zdown="${n}" ${isBottom ? 'disabled' : ''} title="Đưa xuống dưới (nằm sau bộ phận bên trên)">▼</button>`
                : ''
            }
            ${
              state.learnerPreview
                ? ''
                : `${
                    m && m.width
                      ? `<button type="button" class="pm-btn" style="min-height:30px;padding:2px 7px;font-size:0.76rem" data-edit="${n}" title="Vẽ / tẩy trực tiếp lên ảnh bộ phận">✏️ Sửa</button>`
                      : `<button type="button" class="pm-btn warn" style="min-height:30px;padding:2px 7px;font-size:0.75rem" data-from-pet="${n}" title="Lấy ảnh hiện có của pet đưa vào Studio để tự cắt / vẽ lại bộ phận này">✂️ Lấy ảnh pet</button>`
                  }<label class="pm-file-btn" style="min-height:30px;padding:2px 8px;font-size:0.76rem">Thay hình<input type="file" accept="image/png,image/webp" hidden data-f="${n}"></label>`
            }
            ${
              canRemove
                ? `<button type="button" class="pm-btn" style="min-height:30px;padding:2px 7px;font-size:0.76rem" data-rm="${n}" title="Xoá bộ phận khỏi rig">✕</button>`
                : ''
            }
          </div>
        </div>`;
      })
      .join('');

    [...partsEl.children].forEach((d) => drawThumb(d.querySelector('canvas'), d.dataset.p));
    renderNums();
  }

  function syncPlay() {
    const btn = $('play');
    if (!btn) return;
    btn.textContent = state.playing ? 'Dừng' : 'Chạy';
    btn.classList.toggle('primary', state.playing);
  }

  function syncClipUI() {
    const cl = getClip();
    const durEl = $('dur');
    const loopEl = $('loop');
    if (durEl) {
      durEl.value = cl.dur;
      durEl.disabled = state.learnerPreview;
    }
    if (loopEl) {
      loopEl.setAttribute('aria-pressed', String(Boolean(cl.loop)));
      loopEl.disabled = state.learnerPreview;
    }
    const scopeAll = $('scopeAll');
    const scopeOne = $('scopeOne');
    if (scopeAll) scopeAll.setAttribute('aria-pressed', String(state.scope === 'all'));
    if (scopeOne) scopeOne.setAttribute('aria-pressed', String(state.scope === 'one'));
  }

  function setDragMode(m) {
    state.dmode = m;
    $('mPose')?.setAttribute('aria-pressed', String(m === 'pose'));
    $('mMove')?.setAttribute('aria-pressed', String(m === 'move'));
    $('mPivot')?.setAttribute('aria-pressed', String(m === 'pivot'));
    cv.style.cursor = state.learnerPreview ? 'default' : m === 'pose' ? 'crosshair' : 'move';
  }

  // ── Animation loop ─────────────────────────────────────────────
  function frame(now) {
    if (state.destroyed) return;
    rafId = requestAnimationFrame(frame);

    const dt = Math.min(0.1, (now - lastFrame) / 1000);
    lastFrame = now;

    const R = currentRig();
    const cl = getClip();

    if (state.previewOnce) {
      state.time += dt; // luôn chạy tốc độ 1× khi xem trước duyệt
      if (state.time >= cl.dur) {
        state.time = cl.dur;
        const done = state.previewOnce.resolve;
        state.previewOnce = null;
        state.playing = false;
        syncPlay();
        done?.();
      }
    } else if (state.playing && !dragging) {
      const tempoMult = state.useTempo || state.learnerPreview ? STAGE_FACTORS[stageIdx()][0] * groupFactor()[0] : 1;
      state.time += dt * state.speed * tempoMult;
      if (state.time > cl.dur) state.time = cl.loop ? state.time % cl.dur : 0;
    }
    state.time = clamp(state.time, 0, cl.dur);

    if (cv.width === 0 || cv.height === 0) {
      sizeCanvas();
    }
    const cw = cv.width || LW;
    const chPx = cv.height || LH;
    const k = Math.min(cw / LW, chPx / LH);
    const ox = (cw - LW * k) / 2;
    const oy = (chPx - LH * k) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, chPx);
    ctx.setTransform(k, 0, 0, k, ox, oy);
    ctx.fillStyle = 'rgba(185,143,99,.45)';
    ctx.beginPath();
    ctx.ellipse(CX, GY + 46, 380, 62, 0, 0, TAU);
    ctx.fill();

    if (R) {
      if (state.onion && !state.learnerPreview) {
        const ts = keyTimes(cl);
        const pv = [...ts].reverse().find((t) => t < state.time - 1e-3);
        const nx = ts.find((t) => t > state.time + 1e-3);
        if (pv !== undefined) drawPet(R, channelsAt(cl, pv), 0.22, false);
        if (nx !== undefined) drawPet(R, channelsAt(cl, nx), 0.22, false);
      }
      const ch = channelsAt(cl, state.time);
      state._currentEmoji = cl.emoji || null;
      drawPet(R, ch, 1, true);

      if (!state.learnerPreview) {
        let pk = ['armL', 'armR', 'head', 'crown'].includes(state.selCh)
          ? state.selCh
          : ['rot', 'sx', 'sy', 'dx', 'dy'].includes(state.selCh)
          ? 'rot'
          : null;
        if (state.dmode !== 'pose') {
          const sl = findSlot(state.selPart);
          pk = sl && sl.pivot ? (sl.kind === 'bend' ? 'crown' : sl.kind === 'head' ? 'head' : sl.drive) : null;
        }
        const pp = pk && pivots[pk];
        if (pp) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = '#e0912f';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2 * k;
          ctx.beginPath();
          ctx.arc(pp.x, pp.y, 7 * k, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }
      updateChans(cl, ch);
    }

    const timeEl = $('time');
    if (timeEl) timeEl.textContent = `${state.time.toFixed(2)} / ${cl.dur.toFixed(2)} s`;
    drawTL(cl);
  }

  // ── Event listeners ────────────────────────────────────────────
  function localPt(e) {
    const r = cv.getBoundingClientRect();
    const d = cv.width / r.width;
    return { x: (e.clientX - r.left) * d, y: (e.clientY - r.top) * d };
  }

  const onCvDown = (e) => {
    if (state.learnerPreview || !currentRig()) return;
    const p = localPt(e);
    let hit = null;
    for (const h of [...hitInfo].sort((a, b) => b.z - a.z)) {
      const q = h.m.inverse().transformPoint(new DOMPoint(p.x, p.y));
      if (alphaAt(h.img, (q.x - h.off[0]) / h.sc, (q.y - h.off[1]) / h.sc) > 40) {
        hit = h;
        break;
      }
    }
    if (state.dmode !== 'pose') {
      const h = hitInfo.find((x) => x.img === state.selPart) || hit;
      if (!h) return;
      state.selPart = h.img;
      renderParts();
      const q = (state.dmode === 'pivot' ? h.pm : h.m).inverse().transformPoint(new DOMPoint(p.x, p.y));
      const sl = findSlot(h.img);
      if (state.dmode === 'pivot' && !(sl && sl.pivot)) {
        toast('Bộ phận này không có điểm xoay');
        return;
      }
      dragging = {
        edit: state.dmode,
        h,
        q0: q,
        v0: state.dmode === 'pivot' ? [...sl.pivot] : [...offOf(h.img)],
      };
      cv.setPointerCapture(e.pointerId);
      state.playing = false;
      syncPlay();
      return;
    }
    if (!hit || !['body', 'head', 'crown', 'armL', 'armR'].includes(hit.drive)) return;
    state.selPart = hit.img;
    renderParts();
    const c = hit.drive === 'body' ? (['rot', 'dx', 'dy', 'sx', 'sy'].includes(state.selCh) ? state.selCh : 'rot') : hit.drive;
    state.selCh = c;
    state.playing = false;
    syncPlay();
    const cl = getClip();
    const pk = ['armL', 'armR', 'head', 'crown'].includes(c) ? c : 'rot';
    const pv = pivots[pk];
    if (!pv) return;
    dragging = {
      c,
      p0: p,
      v0: val(c, cl.tracks, state.time),
      a0: Math.atan2(p.y - pv.y, p.x - pv.x),
      pv,
    };
    cv.setPointerCapture(e.pointerId);
  };

  const onCvMove = (e) => {
    if (!dragging || state.learnerPreview) return;
    const p = localPt(e);
    if (dragging.edit) {
      const { h, q0, v0, edit } = dragging;
      const q = (edit === 'pivot' ? h.pm : h.m).inverse().transformPoint(new DOMPoint(p.x, p.y));
      const nv = [+(v0[0] + q.x - q0.x).toFixed(1), +(v0[1] + q.y - q0.y).toFixed(1)];
      const sl = findSlot(h.img);
      const ey = findEye(h.img);
      if (edit === 'pivot' && sl) sl.pivot = nv;
      else if (sl) sl.off = nv;
      else if (ey) ey.off = nv;
      renderNums();
      return;
    }
    const { c, p0, v0, a0, pv } = dragging;
    const k = Math.min((cv.width || LW) / LW, (cv.height || LH) / LH);
    const R = currentRig();
    let v;
    if (['armL', 'armR', 'head', 'crown', 'rot'].includes(c)) {
      let da = ((Math.atan2(p.y - pv.y, p.x - pv.x) - a0) * 180) / Math.PI;
      da = ((da + 540) % 360) - 180;
      v = v0 + (c === 'armR' ? -da : da);
    } else if (c === 'dx' || c === 'dy') {
      const sc = (TARGET[stageIdx()] / R.size[1]) * 1.15 * k;
      v = v0 + (c === 'dx' ? (p.x - p0.x) / (R.size[0] * sc) : (p.y - p0.y) / (R.size[1] * sc));
    } else if (c === 'sx' || c === 'sy') {
      v = v0 + (c === 'sx' ? p.x - p0.x : -(p.y - p0.y)) / (200 * k);
    } else return;
    const [a, b] = CHANNELS_SPEC[c];
    v = +clamp(v, a, b).toFixed(3);
    setKey(c, v, state.time, { saveNow: false });
  };

  const onCvUp = () => {
    if (!dragging) return;
    if (dragging.edit) scheduleRigSave();
    else scheduleClipSave();
    dragging = null;
  };

  const onTlDown = (e) => {
    if (e.button === 2) return; // chuột phải xử lý riêng trong onTlContextMenu
    const cl = getClip();
    const r = tl.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const row = Math.floor((y - TL_HEADER) / ROW);
    const c = CHN[row];
    if (c && x < LBL) {
      state.selCh = c;
      const atHead = findKeyNearTime(cl, c, state.time, 0.018);
      state.selKey = atHead ? { c, t: atHead[0] } : null;
      return;
    }
    if (c && !state.learnerPreview) {
      // Vùng bấm rộng 13px giúp chọn/kéo keyframe dễ dàng
      const k = (cl.tracks[c] || []).find((kk) => Math.abs(tlX(kk[0], cl) - x) < 13);
      if (k) {
        state.selCh = c;
        state.selKey = { c, t: k[0] };
        state.time = k[0];
        state.playing = false;
        syncPlay();
        tlDrag = { c, t0: k[0] };
        tl.setPointerCapture(e.pointerId);
        return;
      }
    }
    if (c) state.selCh = c;
    state.time = clamp(((x - LBL) / (r.width - LBL - 14)) * cl.dur, 0, cl.dur);
    state.playing = false;
    syncPlay();
    const near = c ? findKeyNearTime(cl, c, state.time, 0.015) : null;
    state.selKey = near ? { c, t: near[0] } : null;
    tlDrag = { seek: true };
    tl.setPointerCapture(e.pointerId);
  };

  const onTlContextMenu = (e) => {
    e.preventDefault();
    if (state.learnerPreview) return;
    const cl = getClip();
    const r = tl.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const row = Math.floor((y - TL_HEADER) / ROW);
    const c = CHN[row];
    if (!c || x < LBL) return;
    const k = (cl.tracks[c] || []).find((kk) => Math.abs(tlX(kk[0], cl) - x) < 14);
    if (k && deleteKeyExact(c, k[0])) {
      toast(`Đã xoá key "${CHANNEL_LABELS[c]?.vi || c}" tại ${k[0].toFixed(2)}s.`);
    }
  };

  const onTlMove = (e) => {
    if (!tlDrag) return;
    const cl = getClip();
    const r = tl.getBoundingClientRect();
    const x = e.clientX - r.left;
    const t = clamp(((x - LBL) / (r.width - LBL - 14)) * cl.dur, 0, cl.dur);
    if (tlDrag.seek) {
      state.time = t;
      return;
    }
    const C = editableClip();
    const k = (C.tracks[tlDrag.c] || []).find((kk) => Math.abs(kk[0] - state.selKey.t) < 1e-4);
    if (!k) return;
    k[0] = +t.toFixed(3);
    state.selKey.t = k[0];
    state.time = k[0];
    C.tracks[tlDrag.c].sort((a, b) => a[0] - b[0]);
  };

  const onTlUp = () => {
    if (tlDrag && !tlDrag.seek) scheduleClipSave();
    tlDrag = null;
  };

  const onTlDblClick = (e) => {
    if (state.learnerPreview) return;
    const cl = getClip();
    const r = tl.getBoundingClientRect();
    const row = Math.floor((e.clientY - r.top - TL_HEADER) / ROW);
    const c = CHN[row];
    if (!c) return;
    const t = clamp(((e.clientX - r.left - LBL) / (r.width - LBL - 14)) * cl.dur, 0, cl.dur);
    state.time = t;
    setKey(c, val(c, cl.tracks, t));
    state.selCh = c;
    toast(`Đã đặt key "${CHANNEL_LABELS[c]?.vi || c}" tại ${t.toFixed(2)}s.`);
  };

  const onChansInput = (e) => {
    if (state.learnerPreview) return;
    const c = e.target.dataset.in;
    if (!c) return;
    state.selCh = c;
    state.playing = false;
    syncPlay();
    setKey(c, c === 'eyes' ? e.target.value : +(+e.target.value).toFixed(3));
  };

  const onChansClick = (e) => {
    const kbtn = e.target.closest('[data-ktog]');
    if (!kbtn || state.learnerPreview) return;
    e.stopPropagation();
    const c = kbtn.dataset.ktog;
    state.selCh = c;
    state.playing = false;
    syncPlay();
    const cl = getClip();
    const existing = findKeyNearTime(cl, c, state.time, 0.015);
    if (existing) {
      if (deleteKeyExact(c, existing[0])) {
        toast(`Đã xoá key "${CHANNEL_LABELS[c]?.vi || c}" tại ${existing[0].toFixed(2)}s.`);
      }
    } else {
      setKey(c, val(c, cl.tracks, state.time));
      toast(`Đã đặt key "${CHANNEL_LABELS[c]?.vi || c}" tại ${state.time.toFixed(2)}s.`);
    }
  };

  const onChansDown = (e) => {
    const d = e.target.closest('.pm-ch');
    if (d) state.selCh = d.dataset.c;
  };

  const onNumsChange = (e) => {
    if (state.learnerPreview) return;
    const k = e.target.dataset.k;
    if (!k) return;
    const v = +e.target.value;
    const sl = findSlot(state.selPart);
    const ey = findEye(state.selPart);
    if (k === 'ox' || k === 'oy') {
      const target = sl || ey;
      if (!target) return;
      target.off = target.off ? [...target.off] : [0, 0];
      target.off[k === 'ox' ? 0 : 1] = v;
    } else if (k === 'sc' && sl) {
      sl.sc = clamp(v || 1, 0.1, 5);
    } else if (k === 'z' && sl) {
      sl.z = Number.isFinite(v) ? Math.round(v) : 0;
      renderParts();
    } else if ((k === 'px' || k === 'py') && sl?.pivot) {
      sl.pivot = [...sl.pivot];
      sl.pivot[k === 'px' ? 0 : 1] = v;
    }
    scheduleRigSave();
  };

  function moveSlotLayer(part, dir) {
    // dir = +1 -> đưa lên trên (tăng z); dir = -1 -> đưa xuống dưới (giảm z)
    if (state.learnerPreview || !state.rig || !Array.isArray(state.rig.slots)) return;
    // Sắp theo z tăng dần (dưới -> trên) để đổi vị trí rõ ràng từng nấc
    const ordered = [...state.rig.slots].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
    const idx = ordered.findIndex((s) => s.img === part);
    const targetIdx = idx + dir;
    if (idx < 0 || targetIdx < 0 || targetIdx >= ordered.length) return;
    [ordered[idx], ordered[targetIdx]] = [ordered[targetIdx], ordered[idx]];
    // Chuẩn hoá lại z nguyên liên tiếp (giữ body = 0 làm mốc nếu có)
    const bodyIdx = ordered.findIndex((s) => s.name === 'body' || s.img === 'body');
    const base = bodyIdx >= 0 ? bodyIdx : 0;
    ordered.forEach((s, i) => {
      s.z = i - base;
    });
    state.rig.slots = ordered;
    state.selPart = part;
    renderParts();
    scheduleRigSave();
    const sl = findSlot(part);
    toast(
      dir > 0
        ? `Đã đưa "${PART_LABELS[part] || part}" lên trên (z = ${sl?.z ?? 0}).`
        : `Đã đưa "${PART_LABELS[part] || part}" xuống dưới (z = ${sl?.z ?? 0}).`
    );
  }

  function buildReferenceLayersFor(part) {
    if (!state.rig || String(part).startsWith('eye')) return [];
    const targetSlot = findSlot(part);
    const targetOff = targetSlot?.off || [0, 0];
    const targetSc = targetSlot?.sc || 1;
    return [...(state.rig.slots || [])]
      .sort((a, b) => a.z - b.z)
      .filter((s) => s.img !== part && state.images[s.img]?.width)
      .map((s) => {
        const sOff = s.off || [0, 0];
        const sSc = s.sc || 1;
        return {
          name: s.img,
          img: state.images[s.img],
          z: s.z,
          off: [(sOff[0] - targetOff[0]) / targetSc, (sOff[1] - targetOff[1]) / targetSc],
          sc: sSc / targetSc,
        };
      });
  }

  const onPartsClick = (e) => {
    const zUpBtn = e.target.closest('[data-zup]');
    if (zUpBtn) {
      e.stopPropagation();
      moveSlotLayer(zUpBtn.dataset.zup, 1);
      return;
    }
    const zDownBtn = e.target.closest('[data-zdown]');
    if (zDownBtn) {
      e.stopPropagation();
      moveSlotLayer(zDownBtn.dataset.zdown, -1);
      return;
    }
    const rmBtn = e.target.closest('[data-rm]');
    if (rmBtn && !state.learnerPreview && state.rig) {
      const part = rmBtn.dataset.rm;
      if (part.startsWith('eye')) {
        const idx = Number(part.slice(3));
        if (Array.isArray(state.rig.eyes) && idx >= 0 && idx < state.rig.eyes.length) {
          state.rig.eyes.splice(idx, 1);
          delete state.images[part];
          delete state.alphaCache[`draft_${part}`];
          renderParts();
          scheduleRigSave();
          opts.onPartsChanged?.();
          toast(`Đã bỏ ${part} khỏi rig.`);
        }
      } else if ((state.rig.slots?.length || 0) > 1) {
        state.rig.slots = state.rig.slots.filter((s) => s.img !== part);
        delete state.images[part];
        delete state.alphaCache[`draft_${part}`];
        if (state.selPart === part) state.selPart = state.rig.slots[0]?.img || 'body';
        renderParts();
        scheduleRigSave();
        opts.onPartsChanged?.();
        toast(`Đã bỏ bộ phận "${part}" khỏi rig.`);
      }
      return;
    }
    const fromPetBtn = e.target.closest('[data-from-pet]');
    if (fromPetBtn && !state.learnerPreview && state.rig) {
      e.stopPropagation();
      const part = fromPetBtn.dataset.fromPet;
      if (!part) return;
      state.selPart = part;
      renderParts();
      opts.onSuggestFromPet?.({
        part,
        partLabel: PART_LABELS[part] || part,
        petLabel: state.petLabel,
        stage: state.stage,
        targetSize: state.rig?.size || null,
        referenceLayers: buildReferenceLayersFor(part),
        isExistingSlot: true,
      });
      return;
    }
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn && !state.learnerPreview && state.rig) {
      e.stopPropagation();
      const part = editBtn.dataset.edit;
      const img = state.images[part];
      if (!part || !img || !img.width) return;
      state.selPart = part;
      renderParts();
      opts.onEditPart?.({
        part,
        partLabel: PART_LABELS[part] || part,
        petLabel: state.petLabel,
        stage: state.stage,
        image: img,
        referenceLayers: buildReferenceLayersFor(part),
      });
      return;
    }
    const d = e.target.closest('.pm-part');
    if (!d || e.target.closest('label')) return;
    state.selPart = d.dataset.p;
    renderParts();
  };

  const uploadAndReplacePart = async (part, file) => {
    if (!part || !file || state.learnerPreview) return false;
    const prevImg = state.images[part];
    notifySave('saving', { kind: 'part', part });
    try {
      const up = await api.uploadPart(state.petId, state.stage, part, file);
      state.rigUpdatedAt = up.updatedAt;
      state.imageUrls[part] = up.url;
      const { img, objectUrl } = await api.loadImage(up.url, { authenticated: true });
      state.objectUrls.push(objectUrl);
      state.images[part] = img;
      delete state.alphaCache[`draft_${part}`];

      // Nếu kích thước ảnh mới khác ảnh cũ, tự tính sc để khớp khung
      const sl = findSlot(part);
      if (sl && prevImg && prevImg.width && img.width && prevImg.width !== img.width) {
        sl.sc = +((prevImg.width * (sl.sc || 1)) / img.width).toFixed(4);
        scheduleRigSave();
        toast(`Đã thay ${part} (${img.width}×${img.height}) và tự chỉnh tỉ lệ khớp khung cũ.`);
      } else {
        toast(`Đã lưu ảnh ${PART_LABELS[part] || part} (${part}) lên server.`);
      }
      state.selPart = part;
      renderParts();
      notifySave('saved', { kind: 'part', at: new Date() });
      opts.onDataMutated?.({ kind: 'part', part, url: up.url, updatedAt: up.updatedAt });
      opts.onPartsChanged?.();
      return true;
    } catch (err) {
      notifySave('error', { kind: 'part', message: err.message });
      toast(err.message || 'Lỗi tải ảnh lên.');
      return false;
    }
  };

  const onPartsChange = async (e) => {
    const part = e.target.dataset.f;
    const file = e.target.files?.[0];
    if (!part || !file || state.learnerPreview) return;
    e.target.value = '';
    await uploadAndReplacePart(part, file);
  };

  const onKeyDown = (e) => {
    if (e.target.matches('input,select,textarea')) return;
    if (e.key === ' ') {
      e.preventDefault();
      state.playing = !state.playing;
      syncPlay();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      delKey();
    }
  };

  // Bind toolbar buttons
  const bindClick = (role, fn) => {
    const el = $(role);
    if (el) el.addEventListener('click', fn);
    return () => el && el.removeEventListener('click', fn);
  };
  const bindChange = (role, fn) => {
    const el = $(role);
    if (el) el.addEventListener('change', fn);
    return () => el && el.removeEventListener('change', fn);
  };

  const cleanups = [
    bindClick('play', () => { state.playing = !state.playing; syncPlay(); }),
    bindChange('speed', (e) => { state.speed = +e.target.value; }),
    bindClick('onion', (e) => { state.onion = !state.onion; e.currentTarget.setAttribute('aria-pressed', String(state.onion)); }),
    bindClick('tempo', (e) => { state.useTempo = !state.useTempo; e.currentTarget.setAttribute('aria-pressed', String(state.useTempo)); }),
    bindClick('prevK', () => {
      const ts = keyTimes(getClip()).reverse().find((t) => t < state.time - 1e-3);
      state.time = ts ?? 0;
      state.playing = false;
      syncPlay();
    }),
    bindClick('nextK', () => {
      const cl = getClip();
      const ts = keyTimes(cl).find((t) => t > state.time + 1e-3);
      state.time = ts ?? cl.dur;
      state.playing = false;
      syncPlay();
    }),
    bindChange('ease', (e) => {
      if (state.learnerPreview) return;
      const target = resolveActiveKeyTarget(getClip());
      if (!target) return;
      const C = editableClip();
      const k = (C.tracks[target.c] || []).find((kk) => Math.abs(kk[0] - target.t) < 1e-4);
      if (k) {
        k[2] = e.target.value;
        scheduleClipSave();
      }
    }),
    bindClick('delK', delKey),
    bindClick('tlDelK', delKey),
    bindClick('tlAddK', () => {
      if (state.learnerPreview) return;
      const cl = getClip();
      const c = state.selCh || 'rot';
      state.playing = false;
      syncPlay();
      setKey(c, val(c, cl.tracks, state.time));
      toast(`Đã đặt key "${CHANNEL_LABELS[c]?.vi || c}" tại ${state.time.toFixed(2)}s.`);
    }),
    bindClick('tlClearCh', () => {
      if (state.learnerPreview) return;
      const c = state.selCh || 'rot';
      const C = editableClip();
      if (!C.tracks[c]?.length) return;
      delete C.tracks[c];
      if (state.selKey?.c === c) state.selKey = null;
      scheduleClipSave();
      toast(`Đã xoá toàn bộ key của kênh "${CHANNEL_LABELS[c]?.vi || c}".`);
    }),
    bindClick('keyAll', () => {
      if (state.learnerPreview) return;
      const cl = getClip();
      const ch = channelsAt(cl, state.time);
      for (const c of CHN) if (cl.tracks[c]) setKey(c, ch[c], state.time, { saveNow: false });
      scheduleClipSave();
      toast('Đã đặt key cho mọi kênh đang dùng');
    }),
    bindChange('dur', (e) => {
      if (state.learnerPreview) return;
      const C = editableClip();
      const nd = clamp(+e.target.value || C.dur, 0.2, 10);
      const f = nd / C.dur;
      for (const c in C.tracks) for (const k of C.tracks[c]) k[0] = +(k[0] * f).toFixed(3);
      C.dur = nd;
      scheduleClipSave();
    }),
    bindClick('loop', () => {
      if (state.learnerPreview) return;
      const C = editableClip();
      C.loop = !C.loop;
      syncClipUI();
      scheduleClipSave();
    }),
    bindClick('scopeAll', () => { state.scope = 'all'; syncClipUI(); opts.onScopeChange?.('all'); opts.onEmojiChange?.(getClip().emoji || null); }),
    bindClick('scopeOne', () => { state.scope = 'one'; syncClipUI(); opts.onScopeChange?.('one'); opts.onEmojiChange?.(getClip().emoji || null); }),
    bindClick('mPose', () => setDragMode('pose')),
    bindClick('mMove', () => setDragMode('move')),
    bindClick('mPivot', () => setDragMode('pivot')),
    bindClick('resetClip', async () => {
      if (state.learnerPreview) return;
      const scopeKey = state.scope === 'one' ? petStageKey() : '';
      notifySave('saving', { kind: 'clip' });
      try {
        await api.deleteClip({ scope_key: scopeKey, clip: state.clip });
        if (scopeKey === '') delete state.sharedClips[state.clip];
        else delete state.overrideClips[state.clip];
        state.selKey = null;
        syncClipUI();
        notifySave('saved', { kind: 'clip', at: new Date() });
        opts.onDataMutated?.({ kind: 'clip_reset', scopeKey, clipName: state.clip });
        toast('Đã đưa động tác về bản gốc.');
      } catch (err) {
        notifySave('error', { kind: 'clip', message: err.message });
        toast(err.message);
      }
    }),
  ];

  cv.addEventListener('pointerdown', onCvDown);
  cv.addEventListener('pointermove', onCvMove);
  cv.addEventListener('pointerup', onCvUp);
  tl.addEventListener('pointerdown', onTlDown);
  tl.addEventListener('pointermove', onTlMove);
  tl.addEventListener('pointerup', onTlUp);
  tl.addEventListener('dblclick', onTlDblClick);
  tl.addEventListener('contextmenu', onTlContextMenu);
  chansEl.addEventListener('input', onChansInput);
  chansEl.addEventListener('pointerdown', onChansDown);
  chansEl.addEventListener('click', onChansClick);
  numsEl.addEventListener('change', onNumsChange);
  partsEl.addEventListener('click', onPartsClick);
  partsEl.addEventListener('change', onPartsChange);
  window.addEventListener('keydown', onKeyDown);

  function sizeCanvas() {
    const r = cv.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    if (r.width > 0 && r.height > 0) {
      cv.width = Math.round(r.width * d);
      cv.height = Math.round(r.height * d);
    }
  }
  const ro = new ResizeObserver(sizeCanvas);
  ro.observe(cv);
  sizeCanvas();

  rafId = requestAnimationFrame(frame);

  // ── Public controller API cho PetMotionPage.jsx ────────────────
  return {
    async loadStageData({ petId, petLabel, group, stage, detail }) {
      const seq = ++loadSeq;
      await flushClipSave();
      await flushRigSave();
      if (state.destroyed || seq !== loadSeq) return;

      const nextUrls = { ...(detail.rig.draftImageUrls || {}) };
      const nextImages = {};
      const nextObjectUrls = [];

      // Tải sẵn toàn bộ ảnh mới TRƯỚC khi đổi state.images và revoke ảnh cũ (tránh nhấp nháy / mất hình)
      await Promise.all(
        Object.entries(nextUrls).map(async ([part, url]) => {
          try {
            const { img, objectUrl } = await api.loadImage(url, { authenticated: true });
            nextObjectUrls.push(objectUrl);
            nextImages[part] = img;
          } catch (err) {
            console.warn('[PetMotionEditor] không tải được ảnh nháp', part, err);
          }
        })
      );

      if (state.destroyed || seq !== loadSeq) {
        revokeUrls(nextObjectUrls);
        return;
      }

      const prevObjectUrls = state.objectUrls;
      state.objectUrls = nextObjectUrls;
      state.images = nextImages;
      state.imageUrls = nextUrls;
      state.alphaCache = {};
      state.petId = petId;
      state.petLabel = petLabel;
      state.group = group;
      state.stage = stage;
      state.rig = detail.rig.draftRig ? structuredClone(detail.rig.draftRig) : null;
      state.rigUpdatedAt = detail.rig.updatedAt || null;
      state.sharedClips = structuredClone(detail.clips.shared || {});
      state.overrideClips = structuredClone(detail.clips.override || {});
      state.selKey = null;
      state.time = 0;
      state.scope = state.overrideClips[state.clip] ? 'one' : state.scope;

      revokeUrls(prevObjectUrls);
      syncPlay();
      syncClipUI();
      renderParts();
      sizeCanvas();
      opts.onEmojiChange?.(getClip().emoji || null);
      opts.onPartsChanged?.();
    },

    getMissingParts() {
      const names = partNames();
      return names
        .filter((n) => !state.images[n]?.width)
        .map((n) => ({ part: n, label: PART_LABELS[n] || n }));
    },

    hasPartSlot(partName) {
      if (!state.rig) return false;
      if (String(partName).startsWith('eye')) {
        const idx = Number(String(partName).slice(3));
        return Array.isArray(state.rig.eyes) && idx >= 0 && idx < state.rig.eyes.length;
      }
      return Boolean((state.rig.slots || []).find((s) => s.img === partName));
    },

    getLoadedPartSources() {
      const out = [];
      for (const n of partNames()) {
        const img = state.images[n];
        if (img?.width) {
          out.push({
            id: `rig-part-${n}`,
            label: `Lớp đang có trong rig: ${PART_LABELS[n] || n} (${n} · ${img.width}×${img.height}px)`,
            shortLabel: `Rig ${n}`,
            img,
          });
        }
      }
      return out;
    },

    buildReferenceLayersFor(partName) {
      return buildReferenceLayersFor(partName);
    },

    replacePartFile(part, file) {
      return uploadAndReplacePart(part, file);
    },

    /**
     * Thêm bộ phận mới (hoặc thay ảnh bộ phận đã có) vào rig hiện tại và tự lưu rig lên server.
     */
    async addPart(partName, file) {
      if (state.learnerPreview || !state.rig || !partName || !file) return false;
      notifySave('saving', { kind: 'part', part: partName });
      try {
        let uploadFile = file;
        let precomputedEyeBBox = null;

        // Nếu họa sĩ tách eye0/eye1 trực tiếp từ khung ảnh gốc lớn (vd 512×512),
        // tự động ghi nhớ toạ độ mắt trên khung lớn rồi crop gọn file mắt trước khi tải lên
        // để eyeDraw vẽ đúng kích thước & vị trí trên khuôn mặt.
        if (partName === 'eye0' || partName === 'eye1') {
          const tmpUrl = URL.createObjectURL(file);
          try {
            const tmpImg = await new Promise((resolve, reject) => {
              const im = new Image();
              im.onload = () => resolve(im);
              im.onerror = reject;
              im.src = tmpUrl;
            });
            const rawBBox = computeImageBBox(tmpImg);
            const rigW = state.rig.size?.[0] || tmpImg.width;
            if (tmpImg.width >= rigW * 0.75 && rawBBox.w < tmpImg.width * 0.65 && rawBBox.h < tmpImg.height * 0.65) {
              precomputedEyeBBox = rawBBox;
              const cropCv = document.createElement('canvas');
              cropCv.width = Math.max(1, rawBBox.w);
              cropCv.height = Math.max(1, rawBBox.h);
              cropCv
                .getContext('2d')
                .drawImage(
                  tmpImg,
                  rawBBox.x0,
                  rawBBox.y0,
                  rawBBox.w,
                  rawBBox.h,
                  0,
                  0,
                  rawBBox.w,
                  rawBBox.h
                );
              const croppedBlob = await new Promise((res) => cropCv.toBlob(res, 'image/png'));
              if (croppedBlob) {
                uploadFile = new File([croppedBlob], `${partName}.png`, { type: 'image/png' });
              }
            }
          } finally {
            URL.revokeObjectURL(tmpUrl);
          }
        }

        const up = await api.uploadPart(state.petId, state.stage, partName, uploadFile);
        state.rigUpdatedAt = up.updatedAt;
        state.imageUrls[partName] = up.url;
        const { img, objectUrl } = await api.loadImage(up.url, { authenticated: true });
        state.objectUrls.push(objectUrl);
        state.images[partName] = img;
        delete state.alphaCache[`draft_${partName}`];

        const bbox = precomputedEyeBBox || computeImageBBox(img);

        if (partName === 'eye0' || partName === 'eye1') {
          const idx = partName === 'eye0' ? 0 : 1;
          state.rig.eyes = Array.isArray(state.rig.eyes) ? state.rig.eyes : [];
          while (state.rig.eyes.length <= idx) {
            state.rig.eyes.push({ c: [0, 0], w: 12, h: 12, box: [0, 0, 12, 12] });
          }
          state.rig.eyes[idx] = {
            c: [+(bbox.x0 + bbox.w / 2).toFixed(1), +(bbox.y0 + bbox.h / 2).toFixed(1)],
            w: bbox.w,
            h: bbox.h,
            box: [bbox.x0, bbox.y0, bbox.w, bbox.h],
          };
        } else {
          state.rig.slots = Array.isArray(state.rig.slots) ? state.rig.slots : [];
          const exists = state.rig.slots.find((s) => s.img === partName);
          if (!exists) {
            const def = SLOT_DEFAULTS[partName] || { z: 1, kind: 'body' };
            const slot = { name: partName, img: partName, z: def.z, kind: def.kind };
            if (def.drive) slot.drive = def.drive;
            if (def.maxRot) slot.maxRot = def.maxRot;
            if (def.face) {
              // Nếu thêm head thì chuyển face sang head
              state.rig.slots.forEach((s) => { if (s.name === 'body') s.face = false; });
              slot.face = true;
            }
            if (['head', 'bend', 'arm'].includes(def.kind)) {
              slot.pivot = [+((bbox.x0 + bbox.x1) / 2).toFixed(1), bbox.y1];
            }
            state.rig.slots.push(slot);
            state.rig.slots.sort((a, b) => a.z - b.z);
          }
        }

        state.selPart = partName;
        renderParts();
        pendingRigSave = true;
        await flushRigSave();
        toast(`Đã thêm bộ phận "${partName}" vào rig.`);
        opts.onDataMutated?.({ kind: 'part', part: partName, url: up.url, updatedAt: state.rigUpdatedAt });
        opts.onPartsChanged?.();
        return true;
      } catch (err) {
        notifySave('error', { kind: 'part', message: err.message });
        toast(err.message || 'Lỗi thêm bộ phận.');
        return false;
      }
    },

    setClip(clipName) {
      flushClipSave();
      state.clip = clipName;
      state.time = 0;
      state.selKey = null;
      state.playing = true;
      state.scope = state.overrideClips[clipName] ? 'one' : state.scope;
      syncPlay();
      syncClipUI();
      opts.onScopeChange?.(state.scope);
      opts.onEmojiChange?.(getClip().emoji || null);
    },

    setScope(s) {
      state.scope = s;
      syncClipUI();
      opts.onEmojiChange?.(getClip().emoji || null);
    },

    getEmoji() {
      return getClip().emoji || null;
    },

    setEmoji(emojiCfg) {
      if (state.learnerPreview) return;
      const C = editableClip();
      if (!emojiCfg || !emojiCfg.enabled) {
        C.emoji = {
          enabled: false,
          char: emojiCfg?.char ?? C.emoji?.char ?? '✨',
          imageUrl: emojiCfg?.imageUrl ?? C.emoji?.imageUrl ?? '',
          pos: emojiCfg?.pos || C.emoji?.pos || 'top-right',
        };
      } else {
        C.emoji = {
          enabled: true,
          char: emojiCfg.imageUrl ? '' : String(emojiCfg.char || '✨').slice(0, 16),
          imageUrl: emojiCfg.imageUrl || '',
          pos: ['top-right', 'top-center', 'top-left'].includes(emojiCfg.pos)
            ? emojiCfg.pos
            : 'top-right',
        };
      }
      opts.onEmojiChange?.(C.emoji);
      scheduleClipSave();
    },

    async setLearnerPreview(enabled, learnerData) {
      const nextLearnerImages = {};
      const nextLearnerUrls = [];
      let nextStageObj = null;

      if (enabled && learnerData) {
        nextStageObj = learnerData[`c${state.stage}`] || null;
        if (nextStageObj?.images) {
          await Promise.all(
            Object.entries(nextStageObj.images).map(async ([part, url]) => {
              try {
                const { img, objectUrl } = await api.loadImage(url, { authenticated: false });
                if (objectUrl) nextLearnerUrls.push(objectUrl);
                nextLearnerImages[part] = img;
              } catch (err) {
                console.warn('[PetMotionEditor] không tải được ảnh xuất bản', part, err);
              }
            })
          );
        }
      }

      const prevLearnerUrls = state.learnerObjectUrls;
      state.learnerPreview = enabled;
      state.learnerStageData = nextStageObj;
      state.learnerImages = nextLearnerImages;
      state.learnerObjectUrls = nextLearnerUrls;
      state.alphaCache = {};
      revokeUrls(prevLearnerUrls);

      setDragMode(state.dmode);
      syncClipUI();
      renderParts();
      sizeCanvas();
    },

    /**
     * Chạy động tác hiện tại đúng 1 vòng ở tốc độ 1× rồi resolve (dùng trước khi xác nhận duyệt).
     */
    playOnceAt1x() {
      return new Promise((resolve) => {
        state.time = 0;
        state.playing = false;
        syncPlay();
        state.previewOnce = { resolve };
      });
    },

    async flushAll() {
      await flushClipSave();
      await flushRigSave();
    },

    exportBackupJson() {
      return JSON.stringify(
        {
          version: 2,
          exportedAt: new Date().toISOString(),
          petStage: petStageKey(),
          rig: state.rig,
          sharedClips: Object.fromEntries(
            Object.entries(state.sharedClips).map(([k, v]) => [k, v.draft])
          ),
          overrideClips: Object.fromEntries(
            Object.entries(state.overrideClips).map(([k, v]) => [k, v.draft])
          ),
        },
        null,
        2
      );
    },

    destroy() {
      state.destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(saveClipTimer);
      clearTimeout(saveRigTimer);
      ro.disconnect();
      revokeUrls(state.objectUrls);
      revokeUrls(state.learnerObjectUrls);
      cv.removeEventListener('pointerdown', onCvDown);
      cv.removeEventListener('pointermove', onCvMove);
      cv.removeEventListener('pointerup', onCvUp);
      tl.removeEventListener('pointerdown', onTlDown);
      tl.removeEventListener('pointermove', onTlMove);
      tl.removeEventListener('pointerup', onTlUp);
      tl.removeEventListener('dblclick', onTlDblClick);
      tl.removeEventListener('contextmenu', onTlContextMenu);
      chansEl.removeEventListener('input', onChansInput);
      chansEl.removeEventListener('pointerdown', onChansDown);
      chansEl.removeEventListener('click', onChansClick);
      numsEl.removeEventListener('change', onNumsChange);
      partsEl.removeEventListener('click', onPartsClick);
      partsEl.removeEventListener('change', onPartsChange);
      window.removeEventListener('keydown', onKeyDown);
      cleanups.forEach((fn) => fn());
    },
  };
}
