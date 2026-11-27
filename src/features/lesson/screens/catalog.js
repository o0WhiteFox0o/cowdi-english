/**
 * Danh mục màn thuần JS (không import React/JSX) — dùng chung cho mixer.js,
 * registry.js, unit test và script báo cáo phủ dữ liệu.
 * Chuẩn gốc: STD-SCREEN-SYSTEM-v1.0.md §2.
 */

import { listenItems, speakItems, writeItems } from './items.js';

export const SLOTS = ['intro', 'listen', 'speak', 'read', 'write', 'boss'];

const ok = () => ({ ok: true, missing: [] });
const need = (cond, label) => (cond ? ok() : { ok: false, missing: [label] });

/**
 * Danh mục màn hoạt động trong Đợt 1 (7 màn Tập trung; T-03 không chiếm vị trí).
 * Các màn F-xx sẽ được thêm vào đây ở Đợt 3 & 4.
 */
export const SCREEN_CATALOG = [
  {
    code: 'T-01',
    name: 'Từ vựng',
    level: 'focus',
    slot: 'intro',
    canRun: (l) => need((l?.vocabulary?.length || 0) >= 4, 'vocabulary ≥ 4'),
  },
  {
    code: 'T-02',
    name: 'Flashcard',
    level: 'focus',
    slot: 'intro',
    canRun: (l) => need((l?.vocabulary?.length || 0) >= 4, 'vocabulary ≥ 4'),
  },
  {
    code: 'T-04',
    name: 'Đoạn văn',
    level: 'focus',
    slot: 'read',
    canRun: (l) => need(Boolean(l?.reading?.passage), 'reading.passage'),
  },
  {
    code: 'T-05',
    name: 'Nghe câu',
    level: 'focus',
    slot: 'listen',
    canRun: (l) => need(listenItems(l).length >= 3, 'câu nghe ≥ 3'),
  },
  {
    code: 'T-06',
    name: 'Nói theo',
    level: 'focus',
    slot: 'speak',
    canRun: (l) => need(speakItems(l).length >= 3, 'câu nói ≥ 3'),
  },
  {
    code: 'T-07',
    name: 'Quiz',
    level: 'focus',
    slot: 'boss',
    canRun: () => ok(),
  },
  {
    code: 'T-08',
    name: 'Viết câu',
    level: 'focus',
    slot: 'write',
    canRun: (l) => need(writeItems(l, 0).length >= 3, 'câu 3–8 từ ≥ 3'),
  },
];

export const getScreenMeta = (code) => SCREEN_CATALOG.find((s) => s.code === code) || null;
