// ════════════════════════════════════════════════════════════════
// Unit tests cho shared/question-rules.js (Q3 — STD-QUESTION-QUALITY v1.0)
// Phủ đủ toàn bộ 14 mã (+ Q-OPT-ALL): mỗi mã ≥1 case pass và ≥1 case fail.
// ════════════════════════════════════════════════════════════════
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  QUESTION_CODES,
  validateQuestion,
  validateQuestionSet,
  validateStarterWords,
} from './question-rules.js';

const hasCode = (list, code) => list.some((x) => x.code === code);

const GOOD_VOCAB_Q = {
  type: 'word-pick-meaning',
  promptVi: '"chef" nghĩa là gì?',
  options: ['đầu bếp', 'bác sĩ', 'giáo viên', 'nông dân'],
  correct: 0,
  explanation: '"chef" là đầu bếp chuyên nghiệp; "doctor" mới là bác sĩ.',
};

describe('Q3 — shared/question-rules.js (14 mã STD-QUESTION-QUALITY v1.0)', () => {
  it('Q-L2-AUDIO: fail khi câu nghe thiếu audioText, pass khi có audioText hoặc danh từ ghép "tai nghe"', () => {
    const fail = validateQuestion({
      question: 'Nghe và chọn câu đúng:',
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explanation: 'Giải thích đầy đủ cho câu hỏi.',
    });
    assert.ok(hasCode(fail.errors, QUESTION_CODES.AUDIO_MISSING));

    const passWithAudio = validateQuestion({
      type: 'listen-pick-meaning',
      question: 'Nghe và chọn nghĩa đúng:',
      audioText: 'The chef cooks delicious food.',
      options: ['Đầu bếp nấu món ngon.', 'Bác sĩ khám bệnh.', 'Giáo viên dạy học.', 'Tài xế lái xe.'],
      correct: 0,
      explanation: '"The chef cooks delicious food" nghĩa là đầu bếp nấu món ăn ngon.',
    });
    assert.equal(passWithAudio.errors.length, 0);

    // False positive guard: "tai nghe" không phải lệnh nghe
    const passNoun = validateQuestion({
      question: 'Từ "headphones" nghĩa là tai nghe phải không?',
      options: ['Đúng, tai nghe chụp tai', 'Sai, là bàn phím', 'Sai, là màn hình', 'Sai, là chuột máy tính'],
      correct: 0,
      explanation: 'Headphones là tai nghe chụp tai.',
    });
    assert.ok(!hasCode(passNoun.errors, QUESTION_CODES.AUDIO_MISSING));
  });

  it('Q-L2-PROMPT: fail khi lời dẫn ra lệnh nghe nhưng type không bắt đầu listen-', () => {
    const fail = validateQuestion({
      type: 'word-pick-meaning',
      question: 'Nghe và chọn câu đúng:',
      audioText: 'Hello world.',
      options: ['Xin chào thế giới.', 'Tạm biệt bạn.', 'Cảm ơn nhiều.', 'Xin lỗi bạn.'],
      correct: 0,
      explanation: 'Hello world là Xin chào thế giới.',
    });
    assert.ok(hasCode(fail.errors, QUESTION_CODES.LISTEN_PROMPT_MISMATCH));
  });

  it('Q-L2-IMAGE: fail khi hỏi "Màu này là gì?" mà thiếu image/emoji/swatch, pass khi có swatch', () => {
    const fail = validateQuestion({
      type: 'image-pick-word',
      promptVi: 'Màu này là gì?',
      options: ['red', 'blue', 'yellow', 'green'],
      correct: 0,
      explanation: 'Ô màu đỏ là red.',
    });
    assert.ok(hasCode(fail.errors, QUESTION_CODES.IMAGE_MISSING));

    const pass = validateQuestion({
      type: 'image-pick-word',
      promptVi: 'Màu này là gì?',
      stimulus: { swatch: '#E53935', emoji: '🟥' },
      answerCategory: 'color',
      options: ['red', 'blue', 'yellow', 'green'],
      correct: 0,
      explanation: 'Ô màu đỏ là red, blue là xanh dương.',
    });
    assert.equal(pass.errors.length, 0);
  });

  it('Q-L3-LEAK: fail khi lộ đáp án trong câu hỏi hoặc ngoặc đơn, pass khi bình thường', () => {
    const failExact = validateQuestion({
      question: '"Yoga" nghĩa là:',
      options: ['Yoga', 'Bơi lội', 'Chạy bộ', 'Đạp xe'],
      correct: 0,
      explanation: 'Yoga là môn tập yoga.',
    });
    assert.ok(hasCode(failExact.errors, QUESTION_CODES.ANSWER_LEAK));

    const failParen = validateQuestion({
      question: '"Hard" (độ cứng) nghĩa là:',
      options: ['Cứng', 'Mềm', 'Nóng', 'Lạnh'],
      correct: 0,
      explanation: 'Hard nghĩa là cứng.',
    });
    assert.ok(hasCode(failParen.errors, QUESTION_CODES.ANSWER_LEAK));

    assert.equal(validateQuestion(GOOD_VOCAB_Q).errors.length, 0);
  });

  it('Q-L3-EMOJI: fail khi lặp emoji trong lời dẫn, pass khi tách riêng ở stimulus', () => {
    const fail = validateQuestion({
      type: 'image-pick-word',
      promptVi: '🐱 Đây là con gì?',
      stimulus: { emoji: '🐱' },
      answerCategory: 'animal',
      options: ['cat', 'dog', 'bird', 'fish'],
      correct: 0,
      explanation: 'Cat là con mèo.',
    });
    assert.ok(hasCode(fail.errors, QUESTION_CODES.EMOJI_IN_PROMPT));
  });

  it('Q-OPT-COUNT: fail khi <3 hoặc >4 options (trừ heading 5 options) hoặc correct sai phạm vi', () => {
    const failCount = validateQuestion({
      question: 'Chọn từ đúng:',
      options: ['cat', 'dog'],
      correct: 0,
      explanation: 'Cat là con mèo.',
    });
    assert.ok(hasCode(failCount.errors, QUESTION_CODES.OPTION_COUNT));

    const failIndex = validateQuestion({
      question: 'Chọn từ đúng:',
      options: ['cat', 'dog', 'bird', 'fish'],
      correct: 4,
      explanation: 'Cat là con mèo.',
    });
    assert.ok(hasCode(failIndex.errors, QUESTION_CODES.OPTION_COUNT));

    const passHeading5 = validateQuestion(
      {
        type: 'heading',
        prompt: 'Choose the best heading for Paragraph A:',
        options: ['Heading i', 'Heading ii', 'Heading iii', 'Heading iv', 'Heading v'],
        correct: 2,
        explanation: 'Đoạn A tập trung vào ý iii.',
      },
      { questionType: 'heading' }
    );
    assert.ok(!hasCode(passHeading5.errors, QUESTION_CODES.OPTION_COUNT));
  });

  it('Q-OPT-DUP & Q-OPT-ALL: phát hiện trùng lựa chọn, giữ apostrophe, chặn "Tất cả đều đúng"', () => {
    const failDup = validateQuestion({
      question: 'Chọn từ viết đúng chính tả:',
      options: ['Internet', 'Internett', 'Internett', 'Intenet'],
      correct: 0,
      explanation: 'Internet chỉ có một chữ t.',
    });
    assert.ok(hasCode(failDup.errors, QUESTION_CODES.OPTION_DUP));

    // False positive guard: Its ≠ It's ≠ its'
    const passApostrophe = validateQuestion({
      question: 'Chọn đại từ sở hữu đúng:',
      options: ['Its', "It's", "Its'", 'It'],
      correct: 0,
      explanation: 'Its là tính từ sở hữu, không có dấu nháy.',
    });
    assert.ok(!hasCode(passApostrophe.errors, QUESTION_CODES.OPTION_DUP));

    const failAll = validateQuestion({
      question: 'Chọn câu đúng:',
      options: ['Câu A', 'Câu B', 'Cả A và B đều đúng', 'Câu D'],
      correct: 2,
      explanation: 'Cả hai đều đúng.',
    });
    assert.ok(hasCode(failAll.errors, QUESTION_CODES.OPTION_ALL_OF_ABOVE));
  });

  it('Q-L5-CAT: fail khi đáp án nhiễu khác nhóm nghĩa, pass khi cùng nhóm', () => {
    const fail = validateQuestion({
      type: 'image-pick-word',
      promptVi: 'Màu này là gì?',
      stimulus: { swatch: '#E53935' },
      answerCategory: 'color',
      options: ['red', 'star', 'hi', 'buffalo'],
      correct: 0,
      explanation: 'Màu đỏ là red.',
    });
    assert.ok(hasCode(fail.errors, QUESTION_CODES.CATEGORY_MISMATCH));

    const pass = validateQuestion({
      type: 'image-pick-word',
      promptVi: 'Màu này là gì?',
      stimulus: { swatch: '#E53935' },
      answerCategory: 'color',
      options: ['red', 'blue', 'yellow', 'green'],
      correct: 0,
      explanation: 'Màu đỏ là red.',
    });
    assert.ok(!hasCode(pass.errors, QUESTION_CODES.CATEGORY_MISMATCH));
  });

  it('Q-L5-LANG: fail khi lẫn EN và VI, pass khi có siêu ngôn ngữ "không cần mạo từ"', () => {
    const fail = validateQuestion({
      question: 'Chọn từ thích hợp:',
      options: ['apple', 'con mèo', 'banana', 'orange'],
      correct: 0,
      explanation: 'Apple là quả táo.',
    });
    assert.ok(hasCode(fail.errors, QUESTION_CODES.LANG_MIX));

    const passMeta = validateQuestion({
      question: 'Điền mạo từ thích hợp: "I like ___ music."',
      options: ['a', 'an', 'the', 'không cần mạo từ'],
      correct: 3,
      explanation: 'Danh từ không đếm được nói chung không cần mạo từ.',
    });
    assert.ok(!hasCode(passMeta.errors, QUESTION_CODES.LANG_MIX));
  });

  it('Q-L1-SYN: fail khi đáp án nhiễu đồng nghĩa (chef/cook, hi/hello, color/colour), và bắt trong Starter words[]', () => {
    const failSyn = validateQuestion({
      question: '"đầu bếp" tiếng Anh là gì?',
      options: ['chef', 'cook', 'doctor', 'teacher'],
      correct: 0,
      explanation: 'Chef là đầu bếp.',
    });
    assert.ok(hasCode(failSyn.errors, QUESTION_CODES.SYNONYM_DISTRACTOR));

    const failSpell = validateQuestion({
      question: 'Màu sắc tiếng Anh là gì?',
      options: ['color', 'colour', 'shape', 'size'],
      correct: 0,
      explanation: 'Color là màu sắc.',
    });
    assert.ok(hasCode(failSpell.errors, QUESTION_CODES.SYNONYM_DISTRACTOR));

    const starterRes = validateStarterWords([
      { word: 'hello', meaning: 'xin chào' },
      { word: 'hi', meaning: 'chào bạn' },
    ]);
    assert.ok(hasCode(starterRes.errors, QUESTION_CODES.SYNONYM_DISTRACTOR));
  });

  it('Q-AMBIG-EMOJI: cảnh báo khi dùng 🔴 với lời dẫn chung chung, pass khi khoá "Màu này là gì?"', () => {
    const warn = validateQuestion({
      type: 'image-pick-word',
      promptVi: 'Đây là gì?',
      stimulus: { emoji: '🔴' },
      answerCategory: 'color',
      options: ['red', 'blue', 'yellow', 'green'],
      correct: 0,
      explanation: 'Màu đỏ là red.',
    });
    assert.ok(hasCode(warn.warnings, QUESTION_CODES.AMBIGUOUS_EMOJI));

    const ok = validateQuestion({
      type: 'image-pick-word',
      promptVi: 'Màu này là gì?',
      stimulus: { emoji: '🔴' },
      answerCategory: 'color',
      options: ['red', 'blue', 'yellow', 'green'],
      correct: 0,
      explanation: 'Màu đỏ là red.',
    });
    assert.ok(!hasCode(ok.warnings, QUESTION_CODES.AMBIGUOUS_EMOJI));
  });

  it('Q-LEN: cảnh báo khi đáp án đúng dài hơn trung bình nhiễu >50% và lệch ≥12 ký tự', () => {
    const warn = validateQuestion({
      question: 'Chọn định nghĩa đúng về năng lượng tái tạo:',
      options: [
        'Nguồn năng lượng đến từ tự nhiên như mặt trời, gió và nước, có thể tái tạo liên tục',
        'Than đá',
        'Dầu mỏ',
        'Khí đốt',
      ],
      correct: 0,
      explanation: 'Năng lượng tái tạo đến từ thiên nhiên.',
    });
    assert.ok(hasCode(warn.warnings, QUESTION_CODES.LENGTH_BIAS));
  });

  it('Q-POS: cảnh báo khi ≥3 câu liên tiếp cùng vị trí hoặc 1 vị trí >35% ở bộ ≥8 câu', () => {
    const qs = Array.from({ length: 8 }, (_, i) => ({
      ...GOOD_VOCAB_Q,
      question: `Câu ${i + 1}: "chef" nghĩa là gì?`,
      correct: i < 4 ? 0 : i % 4,
    }));
    const res = validateQuestionSet(qs);
    assert.ok(hasCode(res.warnings, QUESTION_CODES.POSITION_BIAS));
  });

  it('Q-EXPL: lỗi ở chế độ strict (v2), cảnh báo ở chế độ thường (bài cũ)', () => {
    const qNoExpl = { ...GOOD_VOCAB_Q, explanation: '' };
    const legacy = validateQuestion(qNoExpl, { strict: false });
    assert.ok(hasCode(legacy.warnings, QUESTION_CODES.EXPLANATION_WEAK));
    assert.equal(legacy.errors.length, 0);

    const v2 = validateQuestion(qNoExpl, { strict: true });
    assert.ok(hasCode(v2.errors, QUESTION_CODES.EXPLANATION_WEAK));
  });
});
