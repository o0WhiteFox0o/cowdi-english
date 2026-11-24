// PetRig — runtime canvas cho người học.
// Chỉ phát dữ liệu đã duyệt từ server (GET /api/pet-motion/:petId), KHÔNG import pet-motion-edits.js
// và KHÔNG tự phát clip chưa duyệt từ bản gốc.
import { CLIP_META, STAGE_FACTORS, GROUP_FACTORS } from '../../shared/pet-motion.js';

const LW = 420;
const LH = 460;
const GY = 418;
const CX = 210;
const TAU = Math.PI * 2;
// Chiều cao mục tiêu (trên khung logic 420×460) theo cấp C1..C5 để trứng C1 vẫn rõ nét trong ô avatar
const TARGET = [255, 285, 315, 345, 375];
const CHN = [
  'rot', 'dx', 'dy', 'sx', 'sy', 'head', 'crown', 'cskew',
  'armL', 'armR', 'mouth', 'lookX', 'lookY', 'glow', 'eyes',
];
export const REST_POSE = Object.freeze({
  rot: 0, dx: 0, dy: 0, sx: 1, sy: 1, head: 0, crown: 0, cskew: 0,
  armL: 0, armR: 0, mouth: 0, lookX: undefined, lookY: undefined, glow: 0, eyes: 'open',
});

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const S = Math.sin;

export const PET_EVENTS = [
  'app_open', 'lesson_start', 'question_shown', 'answer_correct', 'answer_wrong', 'streak',
  'lesson_done', 'skill_level_up', 'evolve_ok', 'pet_speak_start', 'pet_speak_end',
  'mic_start', 'mic_end', 'feed', 'tap',
  'battle_start', 'battle_attack', 'battle_crit', 'battle_dodge', 'battle_hit', 'battle_win', 'battle_lose',
];

const BACKGROUND_FALLBACK_TO_IDLE = new Set([
  'prop_listening',
  'prop_speaking',
  'prop_reading',
  'prop_writing',
  'attentive',
  'battle_ready',
]);

/**
 * Thứ tự thay thế clip theo mục 4:
 * - Nếu clip đã duyệt -> phát đúng clip đó.
 * - `prop_<skill>` -> `idle` -> null (tư thế nghỉ đứng yên).
 * - `attentive` / `battle_ready` -> `idle` -> null (tư thế nghỉ đứng yên).
 * - `sleepy` / `sleep` -> null (bỏ qua).
 * - Mọi clip sự kiện khác chưa duyệt -> null (không phát, giữ nguyên clip nền).
 */
export function resolveApprovedClipName(requestedName, approvedClips) {
  if (!requestedName || !approvedClips || typeof approvedClips !== 'object') return null;
  if (approvedClips[requestedName]) return requestedName;

  if (requestedName === 'sleepy' || requestedName === 'sleep') {
    return null;
  }

  if (BACKGROUND_FALLBACK_TO_IDLE.has(requestedName)) {
    return approvedClips.idle ? 'idle' : null;
  }

  return null;
}

function val(c, tracks, t) {
  const k = tracks?.[c];
  if (!k || !k.length) return REST_POSE[c];
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

function resolveAssetUrl(url, basePath) {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  if (!basePath) return url;
  const cleanBase = basePath.replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}

export class PetRig {
  constructor(canvas, opts = {}) {
    this.cv = canvas;
    this.ctx = canvas?.getContext ? canvas.getContext('2d') : null;
    this.o = {
      basePath: '',
      motion: null, // dữ liệu đã duyệt từ GET /api/pet-motion/:petId
      petId: 'cowdi',
      stage: 1,
      group: 'farm',
      bond: 0,
      topSkill: 'reading',
      mode: 'home',
      reducedMotion:
        typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
      timeScale: 1, // >1 chỉ dùng ở tab "Xem trước khi học" (vd 10× để thử sleepy/sleep)
      onClip: null,
      onDiagnostic: null, // callback tuỳ chọn ghi nhật ký sự kiện & clip bị bỏ qua vì chưa duyệt
      ...opts,
    };

    this.motion = this.o.motion || {};
    this._loggedMissingAuto = new Set();
    this.img = {};
    this.emojiImgCache = {};
    this.fx = [];
    this.bubble = null;
    this.mic = 0;
    this.voice = 0;
    this.speaking = false;
    this.micOn = false;
    this.cur = null; // null = tư thế nghỉ đứng yên
    this.prev = null;
    this.queue = null;
    this.lastCh = { ...REST_POSE };
    this.blendT = 0;
    this.lastEvt = performance.now();
    this.blinkAt = 0;
    this.blinkUntil = 0;
    this.nextLook = 0;
    this.nextFidget = 0;
    this.taps = [];
    this.tapLock = 0;
    this.pointer = null;
    this.down = null;
    this.drag = null;
    this.fall = null;
    this.doodle = [];
    this.waitingAnswer = false;
    this.running = false;
    this.screen = null;
    this._evolveTimer = null;

    this._frame = this._frame.bind(this);
    if (this.cv?.addEventListener) this._bindPointer();
    this._ro =
      typeof ResizeObserver !== 'undefined' && this.cv
        ? new ResizeObserver(() => this._size())
        : null;
    if (this._ro && this.cv) this._ro.observe(this.cv);
  }

  // ── Truy cập dữ liệu đã duyệt theo cấp hiện tại ─────────────────
  _stageData(stage = this.o.stage) {
    return this.motion?.[`c${clamp(stage, 1, 5)}`] || null;
  }

  hasApprovedStage(stage = this.o.stage) {
    const sd = this._stageData(stage);
    return Boolean(sd && sd.rig && Array.isArray(sd.rig.slots));
  }

  _R() {
    return this._stageData()?.rig || null;
  }

  _approvedClips() {
    return this._stageData()?.clips || {};
  }

  _clip(name) {
    if (!name) return null;
    return this._approvedClips()[name] || null;
  }

  _meta(name) {
    return (name && CLIP_META[name]) || { pr: 0 };
  }

  // ── Tải ảnh từ motion.c1..c5.images đã duyệt ────────────────────
  async load(motionOverride) {
    if (motionOverride !== undefined) {
      this.motion = motionOverride || {};
      this.o.motion = this.motion;
    }

    const jobs = [];
    if (typeof Image !== 'undefined') {
      for (let k = 1; k <= 5; k++) {
        const sd = this.motion?.[`c${k}`];
        if (!sd?.rig || !sd?.images) continue;
        for (const [part, url] of Object.entries(sd.images)) {
          const fullUrl = resolveAssetUrl(url, this.o.basePath);
          jobs.push(
            new Promise((ok) => {
              const m = new Image();
              m.crossOrigin = 'anonymous';
              m.onload = ok;
              m.onerror = ok;
              m.src = fullUrl;
              this.img[`c${k}_${part}`] = m;
            })
          );
        }
      }
    }

    await Promise.all(jobs);
    this._size();
    this._enterBaseClip(true);
    if (this.hasApprovedStage()) {
      this.start();
    }
    return this;
  }

  setMotion(motion) {
    this.motion = motion || {};
    this.o.motion = this.motion;
    return this.load(this.motion);
  }

  setStage(stage) {
    this.o.stage = clamp(stage, 1, 5);
    this.cur = null;
    this.queue = null;
    if (this.hasApprovedStage()) {
      this._enterBaseClip(true);
      this.start();
    } else {
      this.stop();
    }
  }

  setMode(mode) {
    const prevMode = this.o.mode;
    this.o.mode = mode;
    this._loggedMissingAuto.clear();
    if (this.hasApprovedStage()) {
      this._enterBaseClip(true, prevMode !== mode ? `mode_${mode}` : null);
    }
  }

  setTimeScale(scale) {
    this.o.timeScale = Math.max(0.1, Number(scale) || 1);
    const now = performance.now();
    this.nextLook = now + (6000 + Math.random() * 5000) / this.o.timeScale;
    this.nextFidget = now + 14000 / this.o.timeScale;
  }

  _reportEvent(eventName, requestedClip, playedClip, extra = {}) {
    if (!this.o.onDiagnostic) return;
    this.o.onDiagnostic({
      event: eventName,
      requested: requestedClip,
      played: playedClip,
      fallback: Boolean(playedClip && requestedClip && playedClip !== requestedClip),
      skipped: Boolean(requestedClip && !playedClip),
      currentClip: this.cur ? this.cur.name : null,
      ...extra,
    });
  }

  setBond(points) {
    const prevDesired = this._desiredBaseName();
    this.o.bond = points;
    if (!this.hasApprovedStage()) return;
    const nextDesired = this._desiredBaseName();
    if (!this.cur || (this._meta(this.cur.name).pr === 0 && !['sleep', 'sleepy'].includes(this.cur.name))) {
      this._enterBaseClip(true, prevDesired !== nextDesired ? 'bond_milestone' : null);
    }
  }

  setTopSkill(skill) {
    const prevDesired = this._desiredBaseName();
    this.o.topSkill = skill;
    this.doodle = [];
    if (!this.hasApprovedStage()) return;
    const nextDesired = this._desiredBaseName();
    if (!this.cur || (this._meta(this.cur.name).pr === 0 && !['sleep', 'sleepy'].includes(this.cur.name))) {
      this._enterBaseClip(true, prevDesired !== nextDesired ? 'top_skill' : null);
    }
  }

  setMicLevel(v) {
    this.mic = clamp(v, 0, 1);
  }

  setVoiceLevel(v) {
    this.voice = clamp(v, 0, 1);
  }

  say(text, ms = 1500) {
    if (!this.hasApprovedStage()) return;
    this.bubble = { text, until: performance.now() + ms };
  }

  start() {
    if (!this.running && typeof requestAnimationFrame !== 'undefined') {
      this.running = true;
      requestAnimationFrame(this._frame);
    }
  }

  stop() {
    this.running = false;
  }

  destroy() {
    this.stop();
    clearTimeout(this._evolveTimer);
    if (this._ro) this._ro.disconnect();
    if (this._unbind) this._unbind();
  }

  // ── Clip nền & phát clip (chỉ phát clip đã duyệt) ───────────────
  _desiredBaseName() {
    if (this.o.mode === 'lesson') return 'attentive';
    if (this.o.mode === 'battle') return 'battle_ready';
    const R = this._R();
    if (this.o.bond >= 500 && R && Array.isArray(R.eyes) && R.eyes.length) {
      return `prop_${this.o.topSkill}`;
    }
    return 'idle';
  }

  _base() {
    return resolveApprovedClipName(this._desiredBaseName(), this._approvedClips());
  }

  _enterBaseClip(force = false, eventName = null) {
    const desired = this._desiredBaseName();
    const baseName = resolveApprovedClipName(desired, this._approvedClips());
    if (!baseName) {
      this.prev = this.cur ? { ch: this.lastCh } : null;
      this.blendT = performance.now();
      this.cur = null; // tư thế nghỉ đứng yên
      if (eventName) {
        this._reportEvent(eventName, desired, null, { reason: 'unapproved' });
      }
      return false;
    }
    const ok = this.play(baseName, force);
    if (eventName) {
      this._reportEvent(eventName, desired, ok ? baseName : null, ok ? {} : { reason: 'unapproved' });
    }
    return ok;
  }

  /**
   * Phát clip theo tên. Nếu clip chưa duyệt (sau khi áp dụng quy tắc thay thế cho clip nền)
   * thì KHÔNG phát và trả về false, giữ nguyên clip đang chạy.
   */
  play(name, force = false, eventName = null) {
    if (!this.hasApprovedStage()) {
      if (eventName) {
        this._reportEvent(eventName, name, null, { skipped: true, reason: 'unapproved_rig' });
      }
      return false;
    }
    const resolvedName = resolveApprovedClipName(name, this._approvedClips());
    if (!resolvedName) {
      if (eventName) {
        this._reportEvent(eventName, name, null, { reason: 'unapproved' });
      }
      return false;
    }

    const c = this._clip(resolvedName);
    if (!c) {
      if (eventName) {
        this._reportEvent(eventName, name, null, { reason: 'unapproved' });
      }
      return false;
    }

    if (this.cur && !force && this.cur.name === resolvedName && c.loop) {
      if (eventName) this._reportEvent(eventName, name, resolvedName);
      return true;
    }
    const curClip = this.cur ? this._clip(this.cur.name) : null;
    if (
      this.cur &&
      !force &&
      curClip &&
      !curClip.loop &&
      this._meta(resolvedName).pr < this._meta(this.cur.name).pr
    ) {
      this.queue = resolvedName;
      if (eventName) this._reportEvent(eventName, name, resolvedName, { queued: true });
      return true;
    }
    this.prev = this.cur ? { ch: this.lastCh } : null;
    this.blendT = performance.now();
    this.cur = { name: resolvedName, t0: performance.now() };
    if (eventName) this._reportEvent(eventName, name, resolvedName);
    return true;
  }

  // ── Sự kiện học tập ─────────────────────────────────────────────
  emit(event, data = {}) {
    if (!this.hasApprovedStage()) {
      this._reportEvent(event, null, null, { skipped: true, reason: 'unapproved_rig' });
      return;
    }
    const b = this.o.bond;
    const pos = this._fxPos();
    this.lastEvt = performance.now();
    this._loggedMissingAuto.clear();

    switch (event) {
      case 'app_open':
        if ((data.daysAway || 0) >= 1 && b >= 200) {
          this.play('greet_return', true, 'app_open');
          this.say(data.text || 'Nhớ bạn quá!');
        } else if (b >= 60) {
          this.play('wave', true, 'app_open');
        } else {
          this._reportEvent('app_open', null, null, {
            note: 'Gắn bó < 60 (cần ≥ 60 cho wave, ≥ 200 + vắng ≥ 1 ngày cho greet_return)',
          });
        }
        break;
      case 'lesson_start':
        this.o.mode = 'lesson';
        this.waitingAnswer = true;
        this._enterBaseClip(true, 'lesson_start');
        break;
      case 'question_shown':
        this.waitingAnswer = true;
        this.lastEvt = performance.now();
        this._reportEvent('question_shown', null, this.cur ? this.cur.name : null, {
          note: 'Bắt đầu đếm 8s chờ think',
        });
        break;
      case 'answer_correct':
        this.waitingAnswer = false;
        if (this.play('cheer_small', true, 'answer_correct')) {
          this.queue = 'attentive';
        }
        this._burst('spark', 5, pos);
        break;
      case 'streak':
        this.waitingAnswer = false;
        if (this.play('cheer_big', true, 'streak')) {
          this.queue = 'attentive';
        }
        this._burst('confetti', 24, pos);
        break;
      case 'answer_wrong':
        this.waitingAnswer = false;
        if (this.play('encourage', true, 'answer_wrong')) {
          this.queue = 'attentive';
        }
        this.say(data.text || 'Thử lại nhé, mình tin bạn!', 1300);
        break;
      case 'lesson_done': {
        this.o.mode = 'home';
        this.waitingAnswer = false;
        const doneClip = b >= 1200 ? 'dance' : 'cheer_big';
        if (!this.play(doneClip, true, 'lesson_done')) {
          this._enterBaseClip(true);
        }
        this._burst('confetti', 40, pos);
        if (data.text) this.say(data.text, 1800);
        break;
      }
      case 'skill_level_up':
        this.play('proud', true, 'skill_level_up');
        break;
      case 'evolve_ok':
        this.play('evolve', true, 'evolve_ok');
        clearTimeout(this._evolveTimer);
        this._evolveTimer = setTimeout(() => {
          if (data.stage) this.setStage(data.stage);
          this._burst('spark', 14, this._fxPos());
        }, 1500);
        break;
      case 'mic_start':
        this.micOn = true;
        this.play('listen', true, 'mic_start');
        break;
      case 'mic_end':
        this.micOn = false;
        this._enterBaseClip(true, 'mic_end');
        break;
      case 'pet_speak_start':
        this.speaking = true;
        this.play('talk', true, 'pet_speak_start');
        if (data.text) this.say(data.text, data.ms || 1500);
        break;
      case 'pet_speak_end':
        this.speaking = false;
        this._enterBaseClip(true, 'pet_speak_end');
        break;
      case 'feed':
        this.play('eat', true, 'feed');
        break;
      case 'battle_start':
        this.o.mode = 'battle';
        this._enterBaseClip(true, 'battle_start');
        break;
      case 'battle_attack':
        this.play('attack', true, 'battle_attack');
        break;
      case 'battle_crit':
        this.play('crit', true, 'battle_crit');
        break;
      case 'battle_dodge':
        this.play('dodge', true, 'battle_dodge');
        break;
      case 'battle_hit':
        this.play('hit', true, 'battle_hit');
        break;
      case 'battle_win':
        this.play('win', true, 'battle_win');
        break;
      case 'battle_lose':
        this.play('lose_proud', true, 'battle_lose');
        break;
      default:
        this.play(event, true, event);
    }

    if (this.o.onClip) this.o.onClip(event, this.cur ? this.cur.name : null);
  }

  _tempo() {
    return STAGE_FACTORS[clamp(this.o.stage - 1, 0, 4)][0] * (GROUP_FACTORS[this.o.group] || [1, 1])[0];
  }

  _amp() {
    return (
      STAGE_FACTORS[clamp(this.o.stage - 1, 0, 4)][1] *
      (GROUP_FACTORS[this.o.group] || [1, 1])[1] *
      (this.o.reducedMotion ? 0.4 : 1)
    );
  }

  _channels(now) {
    if (!this.cur) {
      return { ...REST_POSE, p: 0, meta: { pr: 0 } };
    }
    const c = this._clip(this.cur.name);
    if (!c) {
      this.cur = null;
      return { ...REST_POSE, p: 0, meta: { pr: 0 } };
    }
    const m = this._meta(this.cur.name);
    const el = ((now - this.cur.t0) / 1000) * this._tempo();
    if (!c.loop && el >= c.dur) {
      const queued = this.queue;
      this.queue = null;
      if (queued && this.play(queued, true)) {
        return this._channels(now);
      }
      this._enterBaseClip(true);
      if (!this.cur) return { ...REST_POSE, p: 0, meta: { pr: 0 } };
      return this._channels(now);
    }

    const t = c.loop ? el % c.dur : el;
    const p = c.dur ? t / c.dur : 0;
    const A = this._amp();
    const ch = {};
    for (const k of CHN) ch[k] = val(k, c.tracks, t);

    let lv = 1;
    if (m.level === 'mic') lv = this.mic / 0.6;
    else if (m.level === 'voice') lv = this.voice / 0.6;

    for (const k of ['rot', 'dx', 'dy', 'crown', 'cskew', 'head', 'armL', 'armR']) {
      ch[k] = (ch[k] || 0) * A * (k === 'armL' || k === 'armR' ? 1 : lv);
    }
    ch.sx = 1 + (ch.sx - 1) * A * lv;
    ch.sy = 1 + (ch.sy - 1) * A * lv;
    if (m.level) ch.mouth = clamp(ch.mouth * lv, 0, 1);
    ch.p = p;
    ch.meta = m;

    const bt = clamp((now - this.blendT) / 160, 0, 1);
    if (this.prev && bt < 1) {
      for (const k of ['sx', 'sy', 'rot', 'dx', 'dy', 'crown', 'cskew', 'head', 'armL', 'armR', 'mouth']) {
        ch[k] = lerp(this.prev.ch[k] ?? (k === 'sx' || k === 'sy' ? 1 : 0), ch[k], ease(bt));
      }
    }
    return ch;
  }

  // ── Vẽ ──────────────────────────────────────────────────────────
  _im(n) {
    return this.img[`c${this.o.stage}_${n}`];
  }

  _size() {
    if (!this.cv?.getBoundingClientRect) return;
    const r = this.cv.getBoundingClientRect();
    // Tối thiểu 2x supersampling để ảnh thu nhỏ trong ô avatar (60–220px) luôn sắc nét, không vỡ hạt
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const d = Math.max(2, Math.min(3, dpr));
    if (r.width > 0) {
      const targetW = Math.round(r.width * d);
      const targetH = Math.round(((r.width * LH) / LW) * d);
      if (this.cv.width !== targetW || this.cv.height !== targetH) {
        this.cv.width = targetW;
        this.cv.height = targetH;
      }
    }
  }

  // Kích thước vùng có hình thực tế của rig (bỏ viền trong suốt thừa trên ảnh đơn lớp như C1)
  _contentSize() {
    const R = this._R();
    const rawW = R?.size?.[0] || 200;
    const rawH = R?.size?.[1] || 200;
    if (
      R &&
      Array.isArray(R.slots) &&
      R.slots.length === 1 &&
      Array.isArray(R.ellipse) &&
      R.ellipse[2] > 20 &&
      R.ellipse[3] > 20
    ) {
      const sc = R.slots[0]?.sc || 1;
      return {
        w: Math.min(rawW, R.ellipse[2] * sc),
        h: Math.min(rawH, R.ellipse[3] * sc),
      };
    }
    return { w: rawW, h: rawH };
  }

  _scale() {
    const { w, h } = this._contentSize();
    const byH = TARGET[clamp(this.o.stage - 1, 0, 4)] / (h || 200);
    // Không vượt quá chiều rộng khung logic (chừa biên cho động tác lắc/nghiêng)
    const byW = (LW * 0.78) / (w || 200);
    return Math.min(byH, byW);
  }

  _fxPos() {
    if (!this.screen) return { x: CX, y: GY - 200 };
    return { x: this.screen.x, y: this.screen.y - this.screen.h * 0.8 };
  }

  _burst(type, n, { x, y }) {
    if (!this.hasApprovedStage()) return;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const v = (type === 'confetti' ? 220 : 120) * (0.5 + Math.random());
      this.fx.push({
        type,
        x: x + (Math.random() - 0.5) * 90,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: type === 'confetti' ? 1.4 : 1,
        age: 0,
        rot: Math.random() * 6,
        g: type === 'heart' ? -20 : type === 'confetti' ? 260 : 160,
      });
    }
  }

  _frame(now) {
    if (!this.running) return;
    requestAnimationFrame(this._frame);
    const R = this._R();
    if (!R || !this.ctx) return;

    const ctx = this.ctx;
    const scale = this._scale();
    const o = this.o;

    // Hẹn giờ tự động (chỉ phát nếu clip tương ứng đã duyệt; sleepy/sleep chưa duyệt sẽ tự bỏ qua)
    const ts = Math.max(0.1, o.timeScale || 1);
    const idleSec = ((now - this.lastEvt) / 1000) * ts;
    const cn = this.cur?.name || null;
    const curLoop = !this.cur || Boolean(this._clip(cn)?.loop);
    const tryAuto = (clipName, eventLabel, forcePlay = false) => {
      const ok = this.play(clipName, forcePlay);
      if (ok) {
        this._loggedMissingAuto.delete(clipName);
        this._reportEvent(eventLabel, clipName, clipName);
      } else if (!this._loggedMissingAuto.has(clipName)) {
        this._loggedMissingAuto.add(clipName);
        this._reportEvent(eventLabel, clipName, null, { reason: 'unapproved' });
      }
    };
    if (o.mode === 'home' && !this.drag) {
      if (idleSec > 120 && cn !== 'sleep' && curLoop) {
        tryAuto('sleep', 'auto_sleep');
      } else if (idleSec > 60 && idleSec <= 120 && !['sleepy', 'sleep'].includes(cn) && curLoop) {
        tryAuto('sleepy', 'auto_sleepy');
      } else if (idleSec < 60 && curLoop && now > this.nextLook) {
        if (o.bond >= 200 && now > this.nextFidget) {
          tryAuto('fidget', 'auto_fidget', true);
          this.nextFidget = now + 14000 / ts;
        } else if (Math.random() < 0.6) {
          tryAuto('look_around', 'auto_look_around', true);
        }
        this.nextLook = now + (6000 + Math.random() * 5000) / ts;
      }
    }
    if (o.mode === 'lesson' && this.waitingAnswer && idleSec > 8 && (cn === 'attentive' || cn === 'idle' || cn === null)) {
      tryAuto('think', 'auto_think');
    }

    if (!this.micOn) this.mic *= 0.85;
    if (!this.speaking) this.voice *= 0.8;

    const ch = this._channels(now);
    this.lastCh = ch;

    if (!this.cv.width || !this.cv.height) this._size();
    const k = (this.cv.width || LW) / LW;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, LW, LH);

    const t = now / 1000;
    const cs = this._contentSize();
    const W = cs.w * scale;
    const H = cs.h * scale;
    let ox = 0;
    let oy = 0;
    if (this.drag) {
      ox = this.drag.x - CX;
      oy = this.drag.y - GY + H * 0.35;
    } else if (this.fall) {
      const q = clamp((now - this.fall.t0) / 450, 0, 1);
      ox = this.fall.x * (1 - ease(q));
      oy = this.fall.y * (1 - q * q);
      if (q >= 1) this.fall = null;
    }

    const gx = CX + ox + ch.dx * W;
    const gy = GY + oy + ch.dy * H;
    this.screen = { x: gx, y: gy, s: scale, w: W, h: H };

    // Bóng, hào quang
    const lift = clamp(-(gy - GY) / 120, 0, 1);
    ctx.fillStyle = 'rgba(30,50,30,.22)';
    ctx.beginPath();
    ctx.ellipse(CX + ox * 0.9, GY + 4, W * 0.36 * (1 - lift * 0.4), 9 * (1 - lift * 0.4), 0, 0, TAU);
    ctx.fill();

    const glow = Math.max(ch.glow, o.bond >= 1200 && o.mode === 'home' ? 0.35 + 0.1 * S(t * 2) : 0);
    if (glow > 0) {
      const r = H * 0.75;
      const g = ctx.createRadialGradient(gx, gy - r * 0.6, r * 0.1, gx, gy - r * 0.6, r);
      g.addColorStop(0, `rgba(255,236,150,${0.55 * glow})`);
      g.addColorStop(1, 'rgba(255,236,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(gx - r, gy - r * 1.6, r * 2, r * 2);
    }

    // Pet
    const [gX, gYs] = R.ground || [(R.size?.[0] || 200) / 2, (R.size?.[1] || 200) - 1];
    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(scale, scale);
    ctx.rotate((ch.rot * Math.PI) / 180);
    ctx.scale(ch.sx, ch.sy);
    ctx.translate(-gX, -gYs);

    let lx = ch.lookX;
    let ly = ch.lookY;
    if (lx === undefined) {
      lx = 0;
      ly = ly ?? 0;
      if (o.bond >= 60 && this.pointer) {
        lx = clamp((this.pointer.x - gx) / 140, -1, 1);
        ly = clamp((this.pointer.y - (gy - H * 0.45)) / 160, -1, 1);
      }
    }
    let em = ch.eyes;
    if (em === 'open' && now < this.blinkUntil) em = 'closed';
    if (now > this.blinkAt) {
      this.blinkUntil = now + 130;
      this.blinkAt = now + 2000 + Math.random() * 4000;
    }

    for (const sl of [...(R.slots || [])].sort((a, b) => a.z - b.z)) {
      const img = this._im(sl.img);
      if (!img || !img.width) continue;
      const PV = sl.pivot;
      const off = sl.off || [0, 0];
      const sc = sl.sc || 1;
      ctx.save();
      if (sl.kind === 'bend' && PV) {
        const [px, py] = PV;
        ctx.translate(px, py);
        ctx.rotate((ch.crown * Math.PI) / 180);
        ctx.transform(1, 0, ch.cskew, 1, 0, 0);
        ctx.translate(-px, -py);
      } else if (sl.kind === 'head' && PV) {
        const [px, py] = PV;
        ctx.translate(px, py);
        ctx.rotate(((ch.crown * 0.45 + (ch.head || 0)) * Math.PI) / 180);
        ctx.translate(-px, -py);
      } else if (sl.kind === 'arm' && PV) {
        const [px, py] = PV;
        const m = sl.maxRot ?? 90;
        const v = clamp(sl.drive === 'armL' ? ch.armL : -ch.armR, -m, m);
        ctx.translate(px, py);
        ctx.rotate((v * Math.PI) / 180);
        ctx.translate(-px, -py);
      } else if (sl.kind === 'float') {
        ctx.globalAlpha = 0.85 + 0.15 * S(t * 2);
        ctx.translate(2 * S(t * 1.3), 4 * S(t * 1.8));
      } else if (sl.kind === 'flicker') {
        ctx.globalAlpha = 0.75 + 0.25 * S(t * 9) * S(t * 3.7);
        ctx.translate(gX, gYs);
        ctx.scale(1 + 0.015 * S(t * 6), 1 + 0.04 * S(t * 7.3));
        ctx.translate(-gX, -gYs + 3 * S(t * 5));
      }
      ctx.drawImage(img, off[0], off[1], img.width * sc, img.height * sc);
      if (sl.face) {
        this._eyes(R, em, lx, ly ?? 0);
        this._mouth(R, ch.mouth);
      }
      ctx.restore();
    }

    if (ch.meta.prop && R.eyes?.length) this._prop(R, ch.meta.prop, t);
    ctx.restore();

    if (ch.meta.tint) {
      const a = clamp(0.5 - ch.p, 0, 0.5);
      if (a > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = `rgba(255,70,70,${a})`;
        ctx.fillRect(0, 0, LW, LH);
        ctx.restore();
      }
    }

    // Thức ăn + hiệu ứng theo clip
    if (ch.meta.food) {
      const f = 1 - clamp((ch.p - 0.2) * 1.6, 0, 1);
      if (f > 0) {
        const fx0 = gx - W * 0.1 + f * 90;
        const fy0 = gy - H * 0.35 - f * 40;
        ctx.fillStyle = '#ff7a3d';
        ctx.beginPath();
        ctx.ellipse(fx0, fy0, 14, 9, 0.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#2f9e4f';
        ctx.beginPath();
        ctx.ellipse(fx0 + 12, fy0 - 6, 7, 3, -0.6, 0, TAU);
        ctx.fill();
      }
    }

    const top = gy - H * 0.95;
    const mid = gy - H * 0.5;
    const on = (n) =>
      (ch.meta.fx || []).some((f) => (Array.isArray(f) ? f[0] === n && ch.p >= f[1] && ch.p <= f[2] : f === n));

    if (on('z') && Math.random() < 0.02) this.fx.push({ type: 'z', x: gx + 40, y: top + 40, vx: 18, vy: -26, life: 2.2, age: 0, g: 0 });
    if (on('note') && Math.random() < 0.03) this.fx.push({ type: 'note', x: gx + (Math.random() - 0.5) * 90, y: top + 60, vx: (Math.random() - 0.5) * 20, vy: -40, life: 1.8, age: 0, g: 0 });
    if (on('crumb') && Math.random() < 0.25) this.fx.push({ type: 'crumb', x: gx + (Math.random() - 0.5) * 20, y: mid, vx: (Math.random() - 0.5) * 60, vy: 30, life: 0.6, age: 0, g: 300 });
    if (on('sun') && Math.random() < 0.2) this._burst('spark', 1, { x: gx, y: top });
    if (on('doodle') && Math.random() < 0.5) {
      this.doodle.push({ x: gx + W * 0.55 + 20 * S(t * 7), y: mid - 30 + 15 * S(t * 5.3) });
      if (this.doodle.length > 40) this.doodle.shift();
    }
    if (this.doodle.length) {
      ctx.strokeStyle = 'rgba(61,127,214,.8)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      this.doodle.forEach((d, i) => (i ? ctx.lineTo(d.x, d.y) : ctx.moveTo(d.x, d.y)));
      ctx.stroke();
      if (!on('doodle')) this.doodle.splice(0, 2);
    }
    if (on('stars')) {
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + (i * TAU) / 3;
        this._star(gx + Math.cos(a) * 45, top + 20 + Math.sin(a) * 12, 9, '#f6c343');
      }
    }
    if (on('dots')) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#cfe5d4';
      ctx.beginPath();
      ctx.roundRect(gx + 50, top - 10, 64, 34, 17);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4d6b57';
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = Math.floor(t * 3) % 4 > i ? 1 : 0.25;
        ctx.beginPath();
        ctx.arc(gx + 66 + i * 16, top + 7, 4, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (on('wave') && this.mic > 0.05) {
      ctx.strokeStyle = `rgba(47,158,79,${0.3 + 0.5 * this.mic})`;
      ctx.lineWidth = 3;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(gx - W * 0.55, mid - 20, 10 * i + this.mic * 8, -0.9, 0.9);
        ctx.stroke();
      }
    }

    // Hạt
    const dt = 1 / 60;
    this.fx = this.fx.filter((f) => (f.age += dt) < f.life);
    for (const f of this.fx) {
      f.vy += f.g * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      ctx.globalAlpha = 1 - f.age / f.life;
      if (f.type === 'spark') this._star(f.x, f.y, 8, '#f6c343');
      else if (f.type === 'heart') this._heart(f.x, f.y, 9, '#ef6f8c');
      else if (f.type === 'crumb') {
        ctx.fillStyle = '#ff9a5c';
        ctx.fillRect(f.x, f.y, 4, 4);
      } else if (f.type === 'confetti') {
        ctx.fillStyle = ['#2f9e4f', '#f6c343', '#ef6f8c', '#3d7fd6'][Math.floor(f.rot * 10) % 4];
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot + f.age * 6);
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      } else {
        ctx.fillStyle = '#4d6b57';
        ctx.font = `800 ${f.type === 'z' ? 18 + f.age * 6 : 20}px sans-serif`;
        ctx.fillText(f.type === 'z' ? 'z' : '♪', f.x, f.y);
      }
    }
    ctx.globalAlpha = 1;

    // Biểu cảm emoji nổi theo cấu hình clip đã duyệt (Unicode hoặc ảnh tự thiết kế, 100% rõ nét)
    const curClipObj = this.cur ? this._clip(this.cur.name) : null;
    if (curClipObj?.emoji?.enabled && (curClipObj.emoji.imageUrl || curClipObj.emoji.char)) {
      const em = curClipObj.emoji;
      const pos = em.pos || 'top-right';
      const ex = pos === 'top-left' ? gx - W * 0.42 : pos === 'top-center' ? gx : gx + W * 0.42;
      const bob = Math.sin(t * 4) * 4;
      const ey = Math.max(30, gy - H * 0.92 + bob);
      const elapsed = (now - this.cur.t0) / 1000;
      const pop = elapsed < 0.14 ? 0.65 + (elapsed / 0.14) * 0.35 : 1;

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000000';
      ctx.translate(ex, ey);
      ctx.scale(pop, pop);

      if (em.imageUrl && typeof Image !== 'undefined') {
        let img = this.emojiImgCache[em.imageUrl];
        if (!img) {
          img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = resolveAssetUrl(em.imageUrl, this.o.basePath);
          this.emojiImgCache[em.imageUrl] = img;
        }
        if (img.complete && img.naturalWidth > 0) {
          const maxDim = 42;
          const ratio = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
          const dw = img.naturalWidth * ratio;
          const dh = img.naturalHeight * ratio;
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        }
      } else if (em.char) {
        ctx.font = '32px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(em.char, 0, 0);
      }
      ctx.restore();
    }

    if (this.bubble && now < this.bubble.until) {
      ctx.font = '800 17px sans-serif';
      const w = ctx.measureText(this.bubble.text).width + 28;
      const bx = clamp(gx - w / 2, 8, LW - w - 8);
      const by = clamp(top - 58, 8, LH - 60);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#2f9e4f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, 38, 19);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#14321f';
      ctx.fillText(this.bubble.text, bx + 14, by + 25);
    }
  }

  _eyes(R, mode, lx, ly) {
    const ctx = this.ctx;
    (R.eyes || []).forEach((e, i) => {
      const img = this._im(`eye${i}`);
      const off = e.off || [0, 0];
      const ox = lx * e.w * 0.22 + off[0];
      const oy = ly * e.h * 0.16 + off[1];
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
        if (img && img.width) {
          ctx.drawImage(img, cx - (e.c[0] - bx) * k, cy - (e.c[1] - by) * k, bw * k, bh * k);
        }
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
          const q = a + performance.now() / 120;
          ctx.lineTo(cx + Math.cos(q) * r, cy + Math.sin(q) * r);
        }
        ctx.stroke();
      }
    });
  }

  _mouth(R, m) {
    if (m <= 0.02 || !R.mouth) return;
    const ctx = this.ctx;
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

  _prop(R, kind, t) {
    if (!R.headBox || !R.ellipse) return;
    const ctx = this.ctx;
    const [ex, ey, ew, eh] = R.headBox;
    const [bx, , bw] = R.ellipse;
    ctx.save();
    if (kind === 'phones') {
      ctx.strokeStyle = '#3a3f4a';
      ctx.lineWidth = ew * 0.05;
      ctx.beginPath();
      ctx.ellipse(ex, ey - eh * 0.05, ew * 0.47, eh * 0.46, 0, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      ctx.fillStyle = '#ef6f6c';
      [-1, 1].forEach((s) => {
        ctx.beginPath();
        ctx.ellipse(ex + s * ew * 0.47, ey + eh * 0.02, ew * 0.07, eh * 0.11, 0, 0, TAU);
        ctx.fill();
      });
    }
    if (kind === 'book') {
      const cy = R.headLine + (R.ground[1] - R.headLine) * 0.35;
      const cx = bx;
      const w = Math.min(bw * 0.62, ew * 0.7);
      const h = w * 0.42;
      ctx.fillStyle = '#3d7fd6';
      ctx.beginPath();
      ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 6);
      ctx.fill();
      ctx.fillStyle = '#fffdf5';
      ctx.fillRect(cx - w / 2 + w * 0.05, cy - h / 2 + h * 0.1, w * 0.42, h * 0.78);
      ctx.fillRect(cx + w * 0.03, cy - h / 2 + h * 0.1, w * 0.42, h * 0.78);
    }
    if (kind === 'pencil') {
      const px = bx + bw * 0.3;
      const py = R.headLine + (R.ground[1] - R.headLine) * 0.25;
      ctx.translate(px + ew * 0.12, py - eh * 0.02);
      ctx.rotate(-0.8 + 0.25 * S(t * 8));
      ctx.fillStyle = '#f6c343';
      ctx.fillRect(0, -ew * 0.025, ew * 0.28, ew * 0.05);
      ctx.fillStyle = '#e9d3b0';
      ctx.beginPath();
      ctx.moveTo(0, -ew * 0.025);
      ctx.lineTo(-ew * 0.06, 0);
      ctx.lineTo(0, ew * 0.025);
      ctx.fill();
    }
    ctx.restore();
  }

  _star(x, y, r, col) {
    const c = this.ctx;
    c.fillStyle = col;
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rr = i % 2 ? r * 0.35 : r;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.fill();
  }

  _heart(x, y, r, col) {
    const c = this.ctx;
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x, y + r * 0.9);
    c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.4);
    c.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
    c.fill();
  }

  // ── Chạm, kéo ───────────────────────────────────────────────────
  _bindPointer() {
    const cv = this.cv;
    const loc = (e) => {
      const r = cv.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * LW, y: ((e.clientY - r.top) / r.height) * LH };
    };
    const hit = (p) => {
      const s = this.screen;
      const R = this._R();
      if (!s || !R) return null;
      if (Math.abs(p.x - s.x) > s.w * 0.55 || p.y > s.y + 6 || p.y < s.y - s.h) return null;
      const ey = s.y - (R.ground[1] - (R.headLine ?? R.ground[1] * 0.5)) * s.s;
      return p.y < ey ? 'head' : 'body';
    };
    const move = (e) => {
      this.pointer = loc(e);
      if (
        this.down &&
        !this.drag &&
        this.o.mode === 'home' &&
        Math.hypot(this.pointer.x - this.down.x, this.pointer.y - this.down.y) > 8
      ) {
        this.drag = { ...this.pointer };
        cv.setPointerCapture?.(e.pointerId);
        this.play('drag', true, 'drag');
        this.lastEvt = performance.now();
        this._loggedMissingAuto.clear();
      }
      if (this.drag) this.drag = { ...this.pointer };
    };
    const leave = () => {
      if (!this.drag) this.pointer = null;
    };
    const down = (e) => {
      const p = loc(e);
      const h = hit(p);
      if (h) this.down = { ...p, h };
    };
    const up = (e) => {
      const now = performance.now();
      this.lastEvt = now;
      this._loggedMissingAuto.clear();
      if (this.drag) {
        const p = loc(e);
        this.drag = null;
        this.fall = { x: p.x - CX, y: p.y - GY + (this.screen?.h || 200) * 0.35, t0: now };
        this.play('wave', true, 'drop');
      } else if (this.down) {
        const cn = this.cur?.name;
        if (['sleep', 'sleepy'].includes(cn)) {
          this.play('wake_up', true, 'tap_wake');
        } else if (this.o.mode === 'home' && now >= this.tapLock) {
          this.taps = this.taps.filter((t) => now - t < 3000);
          this.taps.push(now);
          if (this.taps.length > 5) {
            this.taps = [];
            this.tapLock = now + 5000;
            this.play('dizzy', true, 'tap_rapid');
          } else if (this.down.h === 'head') {
            this.play('tap_head', true, 'tap_head');
            this._burst('heart', 3, this._fxPos());
          } else {
            this.play('tap_body', true, 'tap_body');
          }
          if (this.o.onClip) this.o.onClip('tap', this.cur ? this.cur.name : null);
        }
      }
      this.down = null;
    };

    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerleave', leave);
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointerup', up);
    this._unbind = () => {
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerleave', leave);
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointerup', up);
    };
  }
}
