// Kho câu dùng chung mọi pet — đủ số lượng tối thiểu GIAI ĐOẠN 1 (docs mục 5.2).
// Quy tắc giọng văn: docs mục 5.3. Mỗi `vi` sau khi điền biến ≤ 60 ký tự.
// Biến: {petName} {word} {meaning} {lessonTitle} {streak} {lessonsToday} {score} {total} {daysAway}
// `when` thiếu khoá nào = khớp mọi giá trị khoá đó.

const L = (id, event, vi, extra = {}) => ({ id: `common.${id}`, event, vi, when: {}, weight: 1, ...extra });

export default [
  // ── answer_correct (8) ─────────────────────────────
  L('correct.word.01', 'answer_correct', 'Đúng rồi! {word} = {meaning}.', { en: '{word}', when: { needs: ['word', 'meaning'] } }),
  L('correct.word.02', 'answer_correct', 'Chuẩn luôn! {word} là {meaning} đó.', { en: '{word}', when: { needs: ['word', 'meaning'] } }),
  L('correct.word.03', 'answer_correct', '{word} nghĩa là {meaning}. Nhớ rồi nha!', { en: '{word}', when: { needs: ['word', 'meaning'] } }),
  L('correct.word.04', 'answer_correct', 'Yay! Bạn nhớ {word} rồi!', { en: '{word}', when: { needs: ['word'] } }),
  L('correct.plain.01', 'answer_correct', 'Đúng rồi! Giỏi quá!'),
  L('correct.plain.02', 'answer_correct', 'Chính xác! {petName} vui ghê!'),
  L('correct.plain.03', 'answer_correct', 'Hay quá! Câu tiếp nha!'),
  L('correct.plain.04', 'answer_correct', 'Đúng luôn! Bạn làm nhanh ghê!'),

  // ── answer_wrong (8) ───────────────────────────────
  L('wrong.word.01', 'answer_wrong', 'Gần đúng rồi! {word} là {meaning} nha.', { en: '{word}', when: { needs: ['word', 'meaning'] } }),
  L('wrong.word.02', 'answer_wrong', 'Không sao! {word} = {meaning}. Thử lại nha!', { en: '{word}', when: { needs: ['word', 'meaning'] } }),
  L('wrong.word.03', 'answer_wrong', 'Nghe lại {word} nè, rồi thử tiếp!', { en: '{word}', when: { needs: ['word'] } }),
  L('wrong.word.04', 'answer_wrong', '{word} hơi khó ha. Mình thử lần nữa!', { en: '{word}', when: { needs: ['word'] } }),
  L('wrong.plain.01', 'answer_wrong', 'Gần đúng rồi! Thử lại nha!'),
  L('wrong.plain.02', 'answer_wrong', 'Không sao đâu, sai mới nhớ lâu!'),
  L('wrong.plain.03', 'answer_wrong', '{petName} tin bạn làm được mà!'),
  L('wrong.plain.04', 'answer_wrong', 'Bình tĩnh nè, đọc kỹ lại nha!'),

  // ── streak (6) ─────────────────────────────────────
  L('streak.3.01', 'streak', '3 câu liền! Đang vào phong độ nè!', { when: { streak: 3 } }),
  L('streak.3.02', 'streak', '3 câu đúng liên tiếp! Tuyệt!', { when: { streak: 3 } }),
  L('streak.5.01', 'streak', '5 câu liền! {petName} phục bạn luôn!', { when: { streak: 5 } }),
  L('streak.5.02', 'streak', '5 câu không trượt câu nào!', { when: { streak: 5 } }),
  L('streak.10.01', 'streak', '10 câu liền! Bạn là siêu sao!', { when: { streak: 10 } }),
  L('streak.10.02', 'streak', '10 câu liên tiếp! {petName} nhảy mừng nè!', { when: { streak: 10 } }),

  // ── lesson_done (6) ────────────────────────────────
  L('done.01', 'lesson_done', 'Xong bài "{lessonTitle}" rồi!', { when: { needs: ['lessonTitle'] } }),
  L('done.02', 'lesson_done', 'Hoàn thành! {petName} khoẻ re luôn!'),
  L('done.03', 'lesson_done', '{score}/{total} câu đúng. Giỏi quá!', { when: { needs: ['score', 'total'] } }),
  L('done.perfect.01', 'lesson_done', 'Trọn điểm! Không sai câu nào!', { when: { perfect: true } }),
  L('done.perfect.02', 'lesson_done', '{total}/{total}! {petName} tự hào về bạn!', { when: { perfect: true, needs: ['total'] } }),
  L('done.today.01', 'lesson_done', 'Hôm nay bạn học {lessonsToday} bài rồi đó!', { when: { needs: ['lessonsToday'] } }),

  // ── app_open (8) ───────────────────────────────────
  L('open.same.01', 'app_open', 'Chào bạn! Học tiếp "{lessonTitle}" nha?', { when: { daysAwayMax: 0, needs: ['lessonTitle'] }, cta: { label: 'Học tiếp', action: 'continue_lesson' } }),
  L('open.same.02', 'app_open', '{petName} sẵn sàng học cùng bạn rồi nè!', { when: { daysAwayMax: 0 } }),
  L('open.short.01', 'app_open', 'Bạn về rồi! Mình học tiếp nha?', { when: { daysAwayMin: 1, daysAwayMax: 3 }, cta: { label: 'Học tiếp', action: 'continue_lesson' } }),
  L('open.short.02', 'app_open', '{petName} để dành bài "{lessonTitle}" cho bạn nè!', { when: { daysAwayMin: 1, daysAwayMax: 3, needs: ['lessonTitle'] } }),
  L('open.long.01', 'app_open', 'A, bạn đây rồi! Vui quá!', { when: { daysAwayMin: 4 } }),
  L('open.long.02', 'app_open', 'Chào mừng trở lại! Học nhẹ 1 bài nha?', { when: { daysAwayMin: 4 }, cta: { label: 'Học tiếp', action: 'continue_lesson' } }),
  L('open.night.01', 'app_open', 'Khuya rồi, mai mình học tiếp nha.', { when: { night: true }, thought: 'zzz' }),
  L('open.night.02', 'app_open', '{petName} buồn ngủ rồi... chúc bạn ngủ ngon!', { when: { night: true }, thought: 'zzz' }),

  // ── mood_nudge (4) — KHÔNG trách, KHÔNG nói ốm/yếu ─
  L('mood.sad.01', 'mood_nudge', '{petName} hơi buồn chán, học chung 1 bài nha?', { when: { mood: ['sad'], night: false }, thought: 'book', cta: { label: 'Học tiếp', action: 'continue_lesson' } }),
  L('mood.sad.02', 'mood_nudge', 'Mình học 1 bài cho vui nha?', { when: { mood: ['sad'], night: false }, thought: 'book', cta: { label: 'Học tiếp', action: 'continue_lesson' } }),
  L('mood.sick.01', 'mood_nudge', '{petName} hơi mệt, xong 1 bài là khoẻ lại!', { when: { mood: ['sick'], night: false }, thought: 'book', cta: { label: 'Học tiếp', action: 'continue_lesson' } }),
  L('mood.sick.02', 'mood_nudge', 'Cho {petName} uống sữa bằng 1 bài học nha?', { when: { mood: ['sick'], night: false }, thought: 'milk', cta: { label: 'Học tiếp', action: 'continue_lesson' } }),

  // ── page_tip (1/màn) — chỉ màn có pet ──────────────
  L('tip.lesson', 'page_tip', 'Bấm loa để nghe {petName} đọc từ nha!', { when: { screen: ['lesson'] } }),
  L('tip.path', 'page_tip', 'Chạm vào {petName} khi cần giúp nha!', { when: { screen: ['path'] } }),
  L('tip.home', 'page_tip', 'Học xong mỗi bài, {petName} lớn thêm đó!', { when: { screen: ['home'] } }),
  L('tip.pet', 'page_tip', 'Đây là nhà của {petName}! Chạm thử nè.', { when: { screen: ['pet'] } }),

  // ── pet_tap (6) ────────────────────────────────────
  L('tap.happy.01', 'pet_tap', 'Hihi, nhột quá!', { when: { mood: ['happy'] } }),
  L('tap.happy.02', 'pet_tap', '{petName} đang ở ngay đây nè!', { when: { mood: ['happy'] } }),
  L('tap.today.01', 'pet_tap', 'Hôm nay mình học {lessonsToday} bài rồi đó!', { when: { needs: ['lessonsToday'], bondMin: 200 } }),
  L('tap.next.01', 'pet_tap', 'Bài tiếp theo là "{lessonTitle}" nè!', { when: { needs: ['lessonTitle'] }, cta: { label: 'Học tiếp', action: 'continue_lesson' } }),
  L('tap.tired.01', 'pet_tap', '{petName} hơi mệt, học 1 bài là khoẻ!', { when: { mood: ['sad', 'sick'] }, cta: { label: 'Học tiếp', action: 'continue_lesson' } }),
  L('tap.night.01', 'pet_tap', 'Zzz... mai chơi tiếp nha...', { when: { night: true }, thought: 'zzz' }),

  // ── skill_level_up / evolve_ok / feed (3 mỗi loại) ─
  L('skill.01', 'skill_level_up', 'Lên cấp rồi! Bạn tiến bộ thật đó!'),
  L('skill.02', 'skill_level_up', 'Kỹ năng mới tăng nè! Tuyệt!'),
  L('skill.03', 'skill_level_up', '{petName} mạnh hơn nhờ bạn đó!'),
  L('evolve.01', 'evolve_ok', 'Wow! {petName} lớn rồi nè!'),
  L('evolve.02', 'evolve_ok', 'Tiến hoá thành công! Cảm ơn bạn!'),
  L('evolve.03', 'evolve_ok', 'Nhìn {petName} mới nè! Đẹp không?'),
  L('feed.01', 'feed', 'Ngon quá! Cảm ơn bạn nha!'),
  L('feed.02', 'feed', 'Măm măm... no rồi!'),
  L('feed.03', 'feed', '{petName} có sức học tiếp rồi!'),
];
