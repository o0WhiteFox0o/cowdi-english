/**
 * Pure logic cho F-05 Đọc tìm từ khóa / Săn chữ trong sương (PHASE4 §2 F-05).
 * - Hỗ trợ cụm nhiều từ (U5): sắp xếp highlight dài nhất trước để khớp cụm trước từ đơn.
 * - Kiểm tra highlights xuất hiện nguyên văn trong passage >= 4.
 * - Phân tách đoạn văn thành danh sách segments { type: 'text' | 'fog', text, targetKey?, highlightIndex? }.
 */

function escapeRegExp(s) {
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractValidHighlights(lesson) {
  const passage = String(lesson?.reading?.passage || '');
  const raw = Array.isArray(lesson?.reading?.highlights) ? lesson.reading.highlights : [];
  if (!passage || raw.length === 0) return [];

  const seen = new Set();
  const valid = [];
  for (const h of raw) {
    const clean = String(h || '').trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    const re = new RegExp(`\\b${escapeRegExp(clean)}\\b`, 'i');
    if (re.test(passage)) {
      seen.add(key);
      valid.push(clean);
    }
  }
  return valid;
}

export function canRunF05(lesson) {
  const valid = extractValidHighlights(lesson);
  return valid.length >= 4
    ? { ok: true, missing: [] }
    : { ok: false, missing: ['passage + ≥ 4 highlights khớp nguyên văn'] };
}

/**
 * Tách 1 dòng đoạn văn thành mảng segment, phủ sương các highlights (khớp cụm dài nhất trước).
 * Chỉ phủ sương lần xuất hiện đầu tiên của mỗi highlight để số ô sương khớp số mục cần săn.
 */
export function buildFogPassageLines(passage, highlights = []) {
  const sorted = [...highlights].sort((a, b) => b.length - a.length);
  if (sorted.length === 0) {
    return { lines: String(passage || '').split('\n').map((t) => [{ type: 'text', text: t }]), targets: [] };
  }

  const re = new RegExp(`(${sorted.map((h) => `\\b${escapeRegExp(h)}\\b`).join('|')})`, 'gi');
  const claimed = new Set();
  const targets = [];

  const lines = String(passage || '').split('\n').map((line, lineIdx) => {
    const parts = line.split(re).filter((p) => p !== '');
    return parts.map((part, partIdx) => {
      const lower = part.toLowerCase();
      const matched = sorted.find((h) => h.toLowerCase() === lower);
      if (matched && !claimed.has(lower)) {
        claimed.add(lower);
        const fogId = `fog-${targets.length}`;
        targets.push({ fogId, text: part, key: lower, canonical: matched });
        return { type: 'fog', id: `${lineIdx}-${partIdx}`, fogId, text: part, key: lower };
      }
      return { type: 'text', id: `${lineIdx}-${partIdx}`, text: part };
    });
  });

  return { lines, targets };
}
