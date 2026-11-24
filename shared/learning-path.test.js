// Kiểm tra GĐ A — Lộ trình 3 nhóm (Mới học · Trung bình · Luyện thi)
// Theo docs/04-design/SDD-LEARNING-GROUPS-v2.0.md §8 GĐ A
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALL_PATHS,
  getPathById,
  buildPathNodes,
  getLessonAccess,
  estimateLessonMilk,
  isAdvancedUnlocked,
  migrateLegacyProgress,
  suggestLegacyGroup,
} from '../src/data/path.js';
import { ALL_LESSONS } from '../src/data/lessons/index.js';
import { validateLesson } from '../src/data/lessons/schema.js';
import { GOLDEN_LESSONS } from '../src/data/lessons/_golden/index.js';
import { buildCheckpointQuestions, generateQuizFromLesson, gradeExamAnswer, countAnswerWords } from '../src/utils/quiz-gen.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emptyUser = { completedLessons: [], checkpointScores: {}, learnerGroup: null, activePath: null };

test('1. User rỗng, beginner: chỉ s1-hello là current, còn lại locked, unit comingSoon không chặn', () => {
  const pathObj = getPathById('beginner');
  const nodes = buildPathNodes(pathObj, emptyUser);
  const byKey = Object.fromEntries(nodes.map((n) => [n.key, n.status]));
  assert.equal(byKey['l:s1-hello'], 'current');
  assert.equal(byKey['l:s1-me'], 'locked');
  assert.equal(byKey['l:s1-num-1'], 'locked');
  assert.equal(byKey['l:s1-num-2'], 'locked');
  assert.equal(byKey['c:s1-u1'], 'locked');
  // Unit comingSoon không tạo node chặn
  assert.equal(nodes.filter((n) => n.unit.comingSoon).length, 0);
});

test('2. Intermediate: cả 4 bài int-u1 mở (1 current + 3 open), int-u2 khoá', () => {
  const pathObj = getPathById('intermediate');
  const nodes = buildPathNodes(pathObj, emptyUser);
  const byKey = Object.fromEntries(nodes.map((n) => [n.key, n.status]));
  assert.equal(byKey['l:greetings'], 'current');
  assert.equal(byKey['l:family'], 'open');
  assert.equal(byKey['l:colors'], 'open');
  assert.equal(byKey['l:numbers'], 'open');
  assert.equal(byKey['c:int-u1'], 'open'); // allowTestOut = true
  assert.equal(byKey['l:school'], 'locked');
  assert.equal(byKey['l:weather'], 'locked');
});

test('3. Exam: IELTS qua exam-intro chỉ mở exam-pron; qua exam-pron mở hết; TOEIC qua exam-intro mở hết', () => {
  const afterIntro = {
    ...emptyUser,
    checkpointScores: { 'exam-intro': { passed: true, source: 'checkpoint', score: 15, total: 15 } },
  };
  const ieltsNodes1 = buildPathNodes(getPathById('ielts'), afterIntro);
  const ieltsMap1 = Object.fromEntries(ieltsNodes1.map((n) => [n.key, n.status]));
  assert.equal(ieltsMap1['l:alphabet'], 'current');
  assert.equal(ieltsMap1['l:pronunciation-vowels'], 'open');
  assert.equal(ieltsMap1['l:ielts-foundation-vocab'], 'locked');

  const afterPron = {
    ...emptyUser,
    checkpointScores: {
      'exam-intro': { passed: true, source: 'checkpoint', score: 15, total: 15 },
      'exam-pron': { passed: true, source: 'checkpoint', score: 15, total: 15 },
    },
  };
  const ieltsNodes2 = buildPathNodes(getPathById('ielts'), afterPron);
  const ieltsMap2 = Object.fromEntries(ieltsNodes2.map((n) => [n.key, n.status]));
  assert.equal(ieltsMap2['l:ielts-foundation-vocab'], 'current');
  assert.equal(ieltsMap2['l:ielts-listening'], 'open');
  assert.equal(ieltsMap2['l:ielts-vocab-technology'], 'open');

  // TOEIC chỉ yêu cầu exam-intro -> qua exam-intro mở cả exam-pron lẫn các unit sau
  const toeicNodes = buildPathNodes(getPathById('toeic'), afterIntro);
  const toeicMap = Object.fromEntries(toeicNodes.map((n) => [n.key, n.status]));
  assert.notEqual(toeicMap['l:alphabet'], 'locked');
  assert.notEqual(toeicMap['l:toeic-basics-office'], 'locked');
  assert.notEqual(toeicMap['l:toeic-reading-part5'], 'locked');
});

test('4. Unit placed mở unit kế tiếp, bài chưa học trong unit placed mang trạng thái placed', () => {
  const placedUser = {
    ...emptyUser,
    checkpointScores: { 'int-u1': { passed: true, source: 'placement', score: 0, total: 0 } },
  };
  const nodes = buildPathNodes(getPathById('intermediate'), placedUser);
  const byKey = Object.fromEntries(nodes.map((n) => [n.key, n.status]));
  assert.equal(byKey['l:greetings'], 'placed');
  assert.equal(byKey['l:family'], 'placed');
  assert.equal(byKey['c:int-u1'], 'done');
  assert.equal(byKey['l:school'], 'current');
  assert.equal(byKey['l:weather'], 'open');
});

test('5. getLessonAccess("exam-strategies", u, "toeic") trả path toeic', () => {
  const access = getLessonAccess('exam-strategies', emptyUser, 'toeic');
  assert.equal(access.locked, false);
  assert.equal(access.path?.id, 'toeic');
  assert.equal(access.unit?.id, 'exam-intro');
});

test('4 bài Unit S1 Starter đều đạt chuẩn schema v2 (0 lỗi, 0 cảnh báo)', () => {
  const starterIds = ['s1-hello', 's1-me', 's1-num-1', 's1-num-2'];
  for (const id of starterIds) {
    const lesson = ALL_LESSONS.find((l) => l.id === id);
    assert.ok(lesson, `thiếu bài ${id}`);
    const r = validateLesson(lesson);
    assert.deepEqual(r.errors, [], `${id}: ${r.errors.join(' | ')}`);
    assert.deepEqual(r.warnings, [], `${id}: ${r.warnings.join(' | ')}`);
  }
});

test('Mọi bài học trong ALL_LESSONS đều thuộc ít nhất 1 unit (0 bài mồ côi) và units.json khử trùng đúng', () => {
  const covered = new Set(ALL_PATHS.flatMap((p) => p.units.flatMap((u) => u.lessons || [])));
  const orphans = ALL_LESSONS.filter((l) => !covered.has(l.id)).map((l) => l.id);
  assert.deepEqual(orphans, []);

  const unitsJsonPath = path.join(__dirname, 'units.json');
  if (fs.existsSync(unitsJsonPath)) {
    const units = JSON.parse(fs.readFileSync(unitsJsonPath, 'utf8'));
    assert.equal(units.filter((u) => u.unitId === 'exam-intro').length, 1);
    assert.equal(units.filter((u) => u.unitId === 'exam-pron').length, 1);
  }
});

test('estimateLessonMilk tính đúng H8 (quiz 5 câu lần đầu = 140, picture 6 câu = 150)', () => {
  assert.equal(estimateLessonMilk({ quiz: [1, 2, 3, 4, 5] }, { isRepeat: false }), 140);
  assert.equal(estimateLessonMilk({ quiz: [1, 2, 3, 4, 5] }, { isRepeat: true }), 27);
  assert.equal(estimateLessonMilk({ format: 'picture' }, { isRepeat: false }), 150);
});

test('migrateLegacyProgress + suggestLegacyGroup + isAdvancedUnlocked hoạt động đúng', () => {
  const legacyUser = {
    completedLessons: ['greetings', 'family', 'colors', 'numbers'],
    checkpointScores: { 'unit-3': { passed: true, score: 15, total: 15 } },
  };
  const { changed, userData } = migrateLegacyProgress(legacyUser);
  assert.equal(changed, true);
  assert.equal(userData.checkpointScores['int-u1']?.passed, true);
  assert.equal(userData.checkpointScores['int-u1']?.source, 'legacy');
  assert.ok(userData.checkpointScores['unit-3']); // giữ nguyên bản ghi cũ
  assert.deepEqual(suggestLegacyGroup(userData), { groupId: 'intermediate', pathId: 'intermediate' });

  // Chạy lần 2 idempotent
  const second = migrateLegacyProgress(userData);
  assert.equal(second.changed, false);

  // Advanced unlock
  assert.equal(isAdvancedUnlocked(userData), false);
  assert.equal(isAdvancedUnlocked({ checkpointScores: { 'int-u10': { passed: true } } }), true);
});

test('GĐ C: buildCheckpointQuestions cho int-u4 chỉ chứa câu từ 5 bài của unit (sửa H5)', () => {
  const intPath = getPathById('intermediate');
  const u4 = intPath.units.find((u) => u.id === 'int-u4');
  const allowedIds = new Set(u4.lessons);
  const qs = buildCheckpointQuestions(u4, 15, ALL_LESSONS, 'intermediate');
  assert.ok(qs.length >= 10 && qs.length <= 15);
  for (const q of qs) {
    assert.ok(allowedIds.has(q._lessonId), `Câu hỏi thuộc bài ngoài int-u4: ${q._lessonId}`);
  }
  // Rải đều: mọi bài trong int-u4 đều có ít nhất 1 câu
  const coveredLessons = new Set(qs.map((q) => q._lessonId));
  assert.equal(coveredLessons.size, u4.lessons.length);
});

test('GĐ C (U2): generateQuizFromLesson cho bài contentVersion 2 dùng toàn bộ câu soạn tay', () => {
  const greetingsV2 = GOLDEN_LESSONS.find((l) => l.id === 'greetings');
  const qs = generateQuizFromLesson(greetingsV2);
  const authoredCount = qs.filter((q) => q._type === 'original').length;
  assert.equal(authoredCount, greetingsV2.quiz.length);
  assert.ok(qs.length >= 10);
});

test('U8 (ExamReading): gradeExamAnswer chấm đúng TFNG, heading và sentence-completion (kể cả giới hạn maxWords)', () => {
  const ieltsGolden = GOLDEN_LESSONS.find((l) => l.id === 'ielts-read-rooftop-farms');
  const tfngQ = ieltsGolden.reading.examQuestions.find((q) => q.type === 'tfng');
  const headingQ = ieltsGolden.reading.examQuestions.find((q) => q.type === 'heading');
  const compQ = ieltsGolden.reading.examQuestions.find((q) => q.type === 'sentence-completion' && q.answer === 'social value');

  assert.equal(gradeExamAnswer(tfngQ, tfngQ.answer).isCorrect, true);
  assert.equal(gradeExamAnswer(tfngQ, 'NOT GIVEN').isCorrect, false);

  assert.equal(gradeExamAnswer(headingQ, headingQ.answer).isCorrect, true);
  assert.equal(gradeExamAnswer(headingQ, (headingQ.answer + 1) % headingQ.options.length).isCorrect, false);

  assert.equal(countAnswerWords('social value'), 2);
  assert.equal(gradeExamAnswer(compQ, '  Social Value. ').isCorrect, true);
  assert.equal(gradeExamAnswer(compQ, 'the social value').overWordLimit, true);
  assert.equal(gradeExamAnswer(compQ, 'the social value').isCorrect, false);
});
