/**
 * Pure logic helpers for F-04 (Luyện nói vượt chướng ngại / Gọi pet vượt suối).
 * Tách khỏi JSX để test Node (Q3) chạy trực tiếp không cần compiler.
 */

/**
 * Đánh giá một lượt nói trong F-04 (PHASE4 §2 F-04, test Q3 + điều chỉnh Sonny 28/11):
 * - Không có mic / bị từ chối mic → chế độ "Nghe và nhắc lại": vẫn qua màn, KHÔNG ghi skillsHit.speak.
 * - Nhóm Mới học (beginner): không chấm điểm — nói qua mic hoặc bấm "Con đã nói" đều qua.
 * - Trung bình (intermediate): đạt khi >= 50%.
 * - Luyện thi (exam): đạt khi >= 70%.
 */
export function evaluateSpeakAttempt({ group = 'intermediate', score = 0, micUsed = true }) {
  if (!micUsed) {
    return { passed: true, recordSkillHit: false };
  }
  if (group === 'beginner') {
    return { passed: true, recordSkillHit: true };
  }
  const threshold = group === 'exam' ? 70 : 50;
  const ok = Number(score) >= threshold;
  return { passed: ok, recordSkillHit: ok };
}

/**
 * Quyết định có hiện nút bật mic thủ công không:
 * Chỉ hiện khi trình duyệt chặn tự mở mic sau đếm 3-2-1 (`phase === 'blocked'`).
 */
export function shouldShowManualMicButton(phase) {
  return phase === 'blocked';
}
