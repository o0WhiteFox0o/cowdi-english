/**
 * Pure logic cho F-10 Hội thoại phản xạ / Trò chuyện với Ông Tư (PHASE4 §2 F-10, Q3, Q5).
 * Chấm tất định hoàn toàn phía client — KHÔNG gọi AI:
 * - Đạt nếu (a) chứa MỌI keywords của prompt, HOẶC (b) trùng ≥ 60% số từ với một câu trong answers[].
 * - Nhóm Mới học (beginner): không chấm, nói mic hoặc chạm trả lời đều qua.
 * - Không có mic: chạm chọn câu trả lời → qua màn, KHÔNG ghi skillsHit.speak (Q3).
 */

const CONTRACTIONS = [
  [/\bi'm\b/g, 'i am'],
  [/\byou're\b/g, 'you are'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\bhe's\b/g, 'he is'],
  [/\bshe's\b/g, 'she is'],
  [/\bit's\b/g, 'it is'],
  [/\bthat's\b/g, 'that is'],
  [/\bwhat's\b/g, 'what is'],
  [/\bthere's\b/g, 'there is'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bi've\b/g, 'i have'],
  [/\bi'll\b/g, 'i will'],
];

export function normalizeDialogText(text) {
  let s = String(text || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'");
  for (const [re, rep] of CONTRACTIONS) {
    s = s.replace(re, rep);
  }
  return s
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeDialog(text) {
  const norm = normalizeDialogText(text);
  return norm ? norm.split(' ') : [];
}

export function canRunF10(lesson) {
  const list = Array.isArray(lesson?.dialogPrompts) ? lesson.dialogPrompts : [];
  return list.length >= 2
    ? { ok: true, missing: [] }
    : { ok: false, missing: ['dialogPrompts ≥ 2 lượt hội thoại'] };
}

/**
 * Chấm một lượt trả lời trong F-10 (test Q3 & Q5).
 */
export function evaluateDialogReply({
  spoken = '',
  prompt,
  group = 'intermediate',
  micUsed = true,
}) {
  if (!micUsed) {
    return { passed: true, recordSkillHit: false, reason: 'nomic_tap', overlap: 1 };
  }
  if (group === 'beginner') {
    return { passed: true, recordSkillHit: true, reason: 'beginner', overlap: 1 };
  }

  const spokenTokens = tokenizeDialog(spoken);
  if (spokenTokens.length === 0) {
    return { passed: false, recordSkillHit: false, reason: 'empty', overlap: 0 };
  }
  const spokenSet = new Set(spokenTokens);

  // (a) Chứa MỌI keywords của prompt
  const kws = Array.isArray(prompt?.keywords) ? prompt.keywords : [];
  if (kws.length > 0) {
    const allKwMatched = kws.every((kw) => {
      const kwTokens = tokenizeDialog(kw);
      return kwTokens.length > 0 && kwTokens.every((t) => spokenSet.has(t));
    });
    if (allKwMatched) {
      return { passed: true, recordSkillHit: true, reason: 'keywords', overlap: 1 };
    }
  }

  // (b) Trùng >= 60% số từ với ít nhất một câu trong answers[]
  const answers = Array.isArray(prompt?.answers) ? prompt.answers : [];
  let bestOverlap = 0;
  for (const ans of answers) {
    const ansTokens = tokenizeDialog(ans?.en || '');
    if (ansTokens.length === 0) continue;
    const matched = ansTokens.filter((t) => spokenSet.has(t)).length;
    const ratio = matched / ansTokens.length;
    if (ratio > bestOverlap) bestOverlap = ratio;
  }

  if (bestOverlap >= 0.6) {
    return { passed: true, recordSkillHit: true, reason: 'overlap', overlap: bestOverlap };
  }

  return { passed: false, recordSkillHit: false, reason: 'miss', overlap: bestOverlap };
}
