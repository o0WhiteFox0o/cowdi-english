/**
 * Danh mục màn thuần JS (không import React/JSX) — dùng chung cho mixer.js,
 * registry.js, unit test và script báo cáo phủ dữ liệu.
 * Chuẩn gốc: STD-SCREEN-SYSTEM-v1.0.md §2.
 */

import { listenItems, speakItems, writeItems } from './items.js';
import { isSingleSpellableWord } from './friendly/f02Logic.js';
import { canRunF05 } from './friendly/f05Logic.js';
import { getScreenTitle } from '../../../../shared/screen-scenarios.js';

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
  // 5 màn Thân thiện Đợt 3 (trạng thái mặc định trên server: 'test')
  {
    code: 'F-01',
    name: getScreenTitle('F-01'),
    level: 'friendly',
    slot: 'intro',
    phase: 3,
    canRun: (l) => need((l?.vocabulary?.length || 0) >= 4, 'vocabulary ≥ 4'),
  },
  {
    code: 'F-02',
    name: getScreenTitle('F-02'),
    level: 'friendly',
    slot: 'write',
    phase: 4,
    canRun: (l) => need((l?.vocabulary || []).filter(isSingleSpellableWord).length >= 4, '≥ 4 từ đơn 3–10 chữ'),
  },
  {
    code: 'F-03',
    name: getScreenTitle('F-03'),
    level: 'friendly',
    slot: 'listen',
    phase: 3,
    canRun: (l) => need((l?.vocabulary?.length || 0) >= 6, 'vocabulary ≥ 6'),
  },
  {
    code: 'F-04',
    name: getScreenTitle('F-04'),
    level: 'friendly',
    slot: 'speak',
    phase: 4,
    canRun: (l) => need(speakItems(l).length >= 3, 'câu nói ≥ 3'),
  },
  {
    code: 'F-05',
    name: getScreenTitle('F-05'),
    level: 'friendly',
    slot: 'read',
    phase: 4,
    canRun: (l) => canRunF05(l),
  },
  {
    code: 'F-06',
    name: getScreenTitle('F-06'),
    level: 'friendly',
    slot: 'boss',
    phase: 3,
    canRun: () => ok(),
  },
  {
    code: 'F-08',
    name: getScreenTitle('F-08'),
    level: 'friendly',
    slot: 'read',
    phase: 3,
    canRun: (l) => need((l?.vocabulary?.length || 0) >= 6, 'vocabulary ≥ 6'),
  },
  {
    code: 'F-09',
    name: getScreenTitle('F-09'),
    level: 'friendly',
    slot: 'write',
    phase: 3,
    canRun: (l) => need(writeItems(l, 0).length >= 3, 'câu 3–8 từ ≥ 3'),
  },
];

export const getScreenMeta = (code) => SCREEN_CATALOG.find((s) => s.code === code) || null;

/**
 * Danh mục đầy đủ 19 mã màn (8 T + 11 F) dùng cho Admin `/admin/screens` (PHASE2 §3.1–3.2).
 * Các màn chưa có component ở Đợt 4b vẫn hiển thị đủ metadata & kiểm tra canRun() trên dữ liệu bài.
 */
export const FULL_SCREEN_DIRECTORY = [
  ...SCREEN_CATALOG.slice(0, 2),
  {
    code: 'T-03',
    name: 'Ngữ pháp',
    level: 'focus',
    slot: null,
    fixedNote: 'Không chiếm vị trí · dùng làm mẹo pet',
    locked: true,
    canRun: (l) => need((l?.grammar?.length || 0) > 0, 'grammar ≥ 1'),
  },
  ...SCREEN_CATALOG.slice(2, 7),
  getScreenMeta('F-01'),
  getScreenMeta('F-02'),
  getScreenMeta('F-03'),
  getScreenMeta('F-04'),
  getScreenMeta('F-05'),
  getScreenMeta('F-06'),
  { code: 'F-07', name: 'Chợ nổi',            level: 'friendly', slot: 'listen', phase: 4, canRun: (l) => need((l?.vocabulary || []).filter((v) => v?.countable && (v?.image || v?.illustration)).length >= 4, '≥ 4 danh từ đếm được có hình') },
  getScreenMeta('F-08'),
  getScreenMeta('F-09'),
  { code: 'F-10', name: 'Trò chuyện Ông Tư',  level: 'friendly', slot: 'speak',  phase: 4, canRun: (l) => need((l?.dialogPrompts?.length || 0) >= 2, 'dialogPrompts ≥ 2') },
  { code: 'F-11', name: 'Đúng hay sai',       level: 'friendly', slot: 'read',   phase: 4, canRun: (l) => need((l?.trueFalse?.length || 0) >= 4, 'trueFalse ≥ 4') },
];

