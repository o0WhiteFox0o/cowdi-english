// PetDirector — bộ điều phối biểu đạt thuần JS (không phụ thuộc React).
// Tài liệu thiết kế: docs/04-design/SDD-PET-DIRECTOR-v1.1.md
import {
  PRIORITY,
  SPEECH_COOLDOWN_MS,
  GLOBAL_SPEECH_GAP_MS,
  GLOBAL_GAP_EXEMPT_PRIORITY,
  ONCE_PER_SESSION,
  ONCE_PER_SCREEN_FOREVER,
  QUIET_HOURS,
  DEFAULT_TTL_MS,
  CTA_TTL_MS,
  TIER_MAX_BY_SCREEN,
  TIER_OVERRIDES,
  DIRECTOR_ONLY_EVENTS,
  THOUGHT_FOR,
} from './rules.js';
import { createDirectorStorage, createMemoryStorage } from './storage.js';
import { selectLine } from './lineSelector.js';
import { getLines } from '../data/pet-lines/index.js';

const RIG_ONLY_TIER1_EVENTS = new Set([
  'lesson_start',
  'question_shown',
  'mic_start',
  'mic_end',
  'pet_speak_start',
  'pet_speak_end',
]);

export function isQuietHours(now = Date.now()) {
  const hour = new Date(now).getHours();
  if (QUIET_HOURS.start > QUIET_HOURS.end) {
    return hour >= QUIET_HOURS.start || hour < QUIET_HOURS.end;
  }
  return hour >= QUIET_HOURS.start && hour < QUIET_HOURS.end;
}

export class PetDirector {
  constructor(opts = {}) {
    this.userId = opts.userId || 'guest';
    this.clock = typeof opts.clock === 'function' ? opts.clock : () => Date.now();
    this.rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
    this.linesProvider = typeof opts.linesProvider === 'function' ? opts.linesProvider : getLines;
    this.storage = opts.storage || createDirectorStorage(this.userId, opts.storageBackend || createMemoryStorage());

    this.activeSpeech = null; // { id, priority, expiresAt }
    this.lastSpeechByType = {};
    this.lastLineByEvent = {};
  }

  setUserId(userId, storageBackend) {
    const next = userId || 'guest';
    if (next === this.userId && !storageBackend) return;
    this.userId = next;
    this.storage = createDirectorStorage(next, storageBackend);
    this.activeSpeech = null;
    this.lastSpeechByType = {};
    this.lastLineByEvent = {};
  }

  clearActiveSpeech() {
    this.activeSpeech = null;
  }

  /**
   * Giữ chỗ cho Giai đoạn 3 (AI Chat) — mục 11 SDD. Không gọi API ở GĐ1–2.
   */
  beginConversation() {
    return Promise.reject(new Error('not_enabled'));
  }

  _buildVars(payload = {}, ctx = {}) {
    const vars = {
      petName: payload.petName || ctx.petName || 'Cowdi',
    };
    if (payload.word != null) vars.word = payload.word;
    if (payload.meaning != null) vars.meaning = payload.meaning;
    if (payload.lessonTitle ?? ctx.lessonTitle) vars.lessonTitle = payload.lessonTitle ?? ctx.lessonTitle;
    if (payload.count != null) vars.streak = payload.count;
    else if (payload.streak != null) vars.streak = payload.streak;
    else if (ctx.streak != null) vars.streak = ctx.streak;

    const lessonsToday = payload.lessonsToday ?? ctx.lessonsToday;
    if (typeof lessonsToday === 'number' && lessonsToday > 0) {
      vars.lessonsToday = lessonsToday;
    }
    if (typeof payload.score === 'number') vars.score = payload.score;
    if (typeof payload.total === 'number') vars.total = payload.total;

    const daysAway = payload.daysAway ?? ctx.daysAway;
    if (typeof daysAway === 'number' && Number.isFinite(daysAway)) {
      vars.daysAway = daysAway;
    }
    return vars;
  }

  _thoughtFor(type, ctx, night) {
    if (night && (type === 'mood_nudge' || type === 'page_tip')) {
      return THOUGHT_FOR.night;
    }
    if (type === 'mood_nudge') {
      if (ctx.hungry) return THOUGHT_FOR.hungry;
      if (ctx.mood === 'sick') return THOUGHT_FOR.mood_nudge_sick;
      if (ctx.mood === 'sad') return THOUGHT_FOR.mood_nudge_sad;
    }
    if (type === 'lesson_done') {
      return THOUGHT_FOR.lesson_done;
    }
    return null;
  }

  /**
   * Điều phối một sự kiện đầu vào → trả về Decision hoặc null.
   */
  dispatch(event, payload = {}, ctx = {}) {
    if (!event) return null;
    const now = this.clock();
    const screen = payload.screen || ctx.screen || null;
    const night = isQuietHours(now);

    // Xoá trạng thái bong bóng cũ nếu đã hết hạn
    if (this.activeSpeech && now >= this.activeSpeech.expiresAt) {
      this.activeSpeech = null;
    }

    // 1. Sự kiện đấu trường: gửi thẳng rig, LUÔN Tầng 1 (không bao giờ có chữ/biểu tượng)
    if (String(event).startsWith('battle_')) {
      return {
        rigEvent: event,
        rigData: payload,
        tier: 1,
        thought: null,
        speech: null,
        priority: 0,
      };
    }

    // 2. Sự kiện rig-only (không bao giờ bật bong bóng chữ)
    if (RIG_ONLY_TIER1_EVENTS.has(event)) {
      if (event === 'lesson_start' && payload.lessonId) {
        this.storage.resetSeenWords(payload.lessonId);
      }
      return {
        rigEvent: event,
        rigData: payload,
        tier: 1,
        thought: null,
        speech: null,
        priority: 0,
      };
    }

    // 3. Màn hình không có pet (Shop, Account, Admin, Leaderboard...) -> không hiện gì
    if (!screen || !(screen in TIER_MAX_BY_SCREEN)) {
      return null;
    }

    // 4. Sự kiện chuyển tiếp nội bộ (screen_enter -> page_tip hoặc mood_nudge; idle_tick -> mood_nudge)
    if (event === 'screen_enter') {
      const seenTips = this.storage.getSeenTips();
      if (!seenTips[screen]) {
        return this._evaluate('page_tip', null, payload, { ...ctx, screen }, now, night);
      }
      if (ctx.mood === 'sad' || ctx.mood === 'sick') {
        return this._evaluate('mood_nudge', null, payload, { ...ctx, screen }, now, night);
      }
      return null;
    }

    if (event === 'idle_tick') {
      if (ctx.mood === 'sad' || ctx.mood === 'sick') {
        return this._evaluate('mood_nudge', null, payload, { ...ctx, screen }, now, night);
      }
      return null;
    }

    // 5. Các sự kiện nghiệp vụ chính
    const rigEvent = DIRECTOR_ONLY_EVENTS.includes(event) ? null : event;
    return this._evaluate(event, rigEvent, payload, { ...ctx, screen }, now, night);
  }

  _evaluate(type, rigEvent, payload, ctx, now, night) {
    const screen = ctx.screen;
    const priority = PRIORITY[type] ?? 0;
    const rigData = rigEvent ? payload : undefined;

    const baseTier1 = () => ({
      rigEvent,
      rigData,
      tier: 1,
      thought: null,
      speech: null,
      priority,
    });

    // Tầng tối đa theo màn hình + ghi đè theo cặp screen:type
    let tierMax = TIER_MAX_BY_SCREEN[screen] ?? 1;
    const overrideKey = `${screen}:${type}`;
    if (overrideKey in TIER_OVERRIDES) {
      tierMax = Math.min(tierMax, TIER_OVERRIDES[overrideKey]);
    }
    if (tierMax <= 1) return baseTier1();

    // Đọc session & kiểm tra giới hạn 1 lần/phiên hoặc 1 lần/màn
    const session = this.storage.getSession(now);
    if (ONCE_PER_SESSION.includes(type)) {
      if (type === 'app_open' && session.appOpened) return baseTier1();
      if (type === 'mood_nudge' && session.moodNudged) return baseTier1();
    }
    if (ONCE_PER_SCREEN_FOREVER.includes(type)) {
      const seenTips = this.storage.getSeenTips();
      if (seenTips[screen]) return baseTier1();
    }

    // Giờ yên (21:00–06:00): mood_nudge và page_tip thành tầng 2 với thought 'zzz'
    const quietForceThought = night && (type === 'mood_nudge' || type === 'page_tip');
    if (quietForceThought) {
      tierMax = Math.min(tierMax, 2);
    }

    // Luật ngắt bong bóng đang hiện: chỉ ưu tiên CAO HƠN mới thay được
    const canInterrupt = !this.activeSpeech || priority > this.activeSpeech.priority;

    // Luật riêng answer_correct: chỉ có chữ ở lần đúng đầu tiên của mỗi từ trong bài
    let canSpeak = tierMax >= 3 && canInterrupt;
    if (type === 'answer_correct' && payload.word) {
      const lessonId = payload.lessonId || ctx.lessonId || '_default';
      if (this.storage.hasSeenWord(lessonId, payload.word)) {
        canSpeak = false;
      } else {
        this.storage.markWordSeen(lessonId, payload.word);
      }
    }

    // Cooldown theo loại sự kiện
    const typeCooldown = SPEECH_COOLDOWN_MS[type];
    if (canSpeak && typeCooldown) {
      const last = this.lastSpeechByType[type] || 0;
      if (last > 0 && now - last < typeCooldown) {
        canSpeak = false;
      }
    }

    // Giãn cách Tầng 3 toàn cục 20s (trừ loại có priority >= 50)
    if (canSpeak && priority < GLOBAL_GAP_EXEMPT_PRIORITY) {
      if (session.lastSpeechAt > 0 && now - session.lastSpeechAt < GLOBAL_SPEECH_GAP_MS) {
        canSpeak = false;
      }
    }

    // Thử chọn Tầng 3 (câu thoại từ LineDB)
    if (canSpeak) {
      const lines = this.linesProvider(ctx.petId);
      const recentLines = this.storage.getRecentLines(now);
      const vars = this._buildVars(payload, ctx);
      const picked = selectLine(lines, {
        event: type,
        petId: ctx.petId,
        screen,
        mood: ctx.mood || 'happy',
        stage: ctx.stage || 1,
        bond: ctx.bond || 0,
        group: ctx.group || 'farm',
        night,
        recentLines,
        lastLineId: this.lastLineByEvent[type] || null,
        vars,
        payload,
        rng: this.rng,
      });

      if (picked) {
        const { line, vi, en } = picked;
        const ttlMs = line.cta ? CTA_TTL_MS : DEFAULT_TTL_MS;
        this.storage.markLineUsed(line.id, now);
        this.lastLineByEvent[type] = line.id;
        this.lastSpeechByType[type] = now;
        // Sau khi khen chuỗi (streak), tính cooldown answer_correct từ lúc bong bóng streak ẩn để tránh spam chữ trong chuỗi dài
        if (type === 'streak') {
          this.lastSpeechByType.answer_correct = now + ttlMs;
        }
        this.activeSpeech = { id: line.id, priority, expiresAt: now + ttlMs };

        const sessionPatch = { lastSpeechAt: now };
        if (type === 'app_open') sessionPatch.appOpened = true;
        if (type === 'mood_nudge') sessionPatch.moodNudged = true;
        this.storage.updateSession(sessionPatch, now);

        if (type === 'page_tip') {
          this.storage.markTipSeen(screen);
        }

        return {
          rigEvent,
          rigData,
          tier: 3,
          thought: line.thought || null,
          speech: {
            id: line.id,
            vi,
            en: en || null,
            cta: line.cta || null,
            ttlMs,
          },
          priority,
        };
      }
    }

    // Hạ về Tầng 2 (biểu tượng suy nghĩ) nếu phù hợp và chưa hiện icon này trong phiên
    if (tierMax >= 2) {
      const thought = this._thoughtFor(type, ctx, night);
      if (thought && !session.shownThoughts?.[thought]) {
        const sessionPatch = { shownThoughts: { [thought]: true } };
        if (type === 'mood_nudge') sessionPatch.moodNudged = true;
        this.storage.updateSession(sessionPatch, now);
        return {
          rigEvent,
          rigData,
          tier: 2,
          thought,
          speech: null,
          priority,
        };
      }
    }

    return baseTier1();
  }
}
