// Kiểm tra toàn bộ bài học theo src/data/lessons/schema.js & chuẩn câu hỏi STD-QUESTION-QUALITY v1.0
//   node scripts/validate-lessons.mjs                          → tóm tắt schema bài học, exit 1 nếu có lỗi
//   node scripts/validate-lessons.mjs --verbose                → in từng cảnh báo
//   node scripts/validate-lessons.mjs --only greetings,s1-pets
//   node scripts/validate-lessons.mjs --md report.md           → ghi báo cáo markdown
//   node scripts/validate-lessons.mjs --questions              → rà soát toàn bộ ngân hàng câu hỏi (14 mã)
//   node scripts/validate-lessons.mjs --questions --json out.json --md report.md
//   node scripts/validate-lessons.mjs --questions --fail-on-hard → exit 1 nếu còn lỗi cứng câu hỏi
// Bài v2 (contentVersion: 2): vi phạm chuẩn = lỗi. Bài cũ: chỉ lỗi cấu trúc mới là lỗi.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);

const { ALL_LESSONS, QUIZ_BANK } = await imp('src/data/lessons/index.js');
const { validateLesson, toLegacyShape } = await imp('src/data/lessons/schema.js');
const { validateQuestion, validateQuestionSet, validateStarterWords } = await imp('shared/question-rules.js');
let golden = [];
if (fs.existsSync(path.join(root, 'src/data/lessons/_golden/index.js'))) {
  ({ GOLDEN_LESSONS: golden } = await imp('src/data/lessons/_golden/index.js'));
}

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const questionsMode = args.includes('--questions');
const failOnHard = args.includes('--fail-on-hard');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const mdOut = args.includes('--md') ? args[args.indexOf('--md') + 1] : null;
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

// ── Chế độ --questions: rà soát toàn kho câu hỏi theo STD-QUESTION-QUALITY v1.0 ──
if (questionsMode) {
  let quizExtra = {};
  if (fs.existsSync(path.join(root, 'src/data/quiz/quiz-bank-extra.js'))) {
    quizExtra = await imp('src/data/quiz/quiz-bank-extra.js');
  }

  const findings = []; // { source, group, index, severity, code, message, prompt, v2 }
  let totalQuestions = 0;
  let totalStarterLessons = 0;
  const groupStats = new Map();

  const touchGroup = (g) => {
    if (!groupStats.has(g)) groupStats.set(g, { questions: 0, errors: 0, warnings: 0 });
    return groupStats.get(g);
  };

  const recordList = (list, severity, source, group, v2, getPromptByIdx) => {
    const st = touchGroup(group);
    for (const item of list) {
      if (severity === 'error') st.errors++;
      else st.warnings++;
      findings.push({
        source,
        group,
        index: item.index ?? -1,
        severity,
        code: item.code,
        message: item.message,
        prompt: item.index >= 0 ? getPromptByIdx(item.index) : '(cả bộ câu hỏi)',
        v2,
      });
    }
  };

  for (const lesson of ALL_LESSONS) {
    if (only && !only.includes(lesson.id)) continue;
    const v2 = lesson.contentVersion === 2;
    const group = lesson.unit || lesson.track || 'other';
    const st = touchGroup(group);

    if (lesson.format === 'picture' && Array.isArray(lesson.words)) {
      totalStarterLessons++;
      const sRes = validateStarterWords(lesson.words);
      recordList(sRes.errors, 'error', `${lesson.id}:words`, group, v2, () => lesson.words.map((w) => w.word).join(', '));
      recordList(sRes.warnings, 'warning', `${lesson.id}:words`, group, v2, () => lesson.words.map((w) => w.word).join(', '));
    }

    if (Array.isArray(lesson.quiz) && lesson.quiz.length > 0) {
      totalQuestions += lesson.quiz.length;
      st.questions += lesson.quiz.length;
      const res = validateQuestionSet(lesson.quiz, { strict: v2 });
      recordList(res.errors, 'error', `${lesson.id}:quiz`, group, v2, (i) => lesson.quiz[i]?.question || '');
      recordList(res.warnings, 'warning', `${lesson.id}:quiz`, group, v2, (i) => lesson.quiz[i]?.question || '');
    }

    const rqs = lesson.reading?.questions || [];
    if (rqs.length > 0) {
      totalQuestions += rqs.length;
      st.questions += rqs.length;
      const res = validateQuestionSet(rqs, { strict: v2 });
      recordList(res.errors, 'error', `${lesson.id}:reading.questions`, group, v2, (i) => rqs[i]?.question || '');
      recordList(res.warnings, 'warning', `${lesson.id}:reading.questions`, group, v2, (i) => rqs[i]?.question || '');
    }

    const eqs = (lesson.reading?.examQuestions || []).filter((q) => q.type === 'mcq' || q.type === 'heading');
    if (eqs.length > 0) {
      totalQuestions += eqs.length;
      st.questions += eqs.length;
      eqs.forEach((eq, i) => {
        const res = validateQuestion(
          { ...eq, question: eq.prompt, correct: eq.answer },
          { strict: v2, questionType: eq.type }
        );
        recordList(res.errors.map((e) => ({ index: i, ...e })), 'error', `${lesson.id}:examQuestions`, group, v2, () => eq.prompt || '');
        recordList(res.warnings.map((w) => ({ index: i, ...w })), 'warning', `${lesson.id}:examQuestions`, group, v2, () => eq.prompt || '');
      });
    }
  }

  if (!only) {
    for (const [bankKey, arr] of Object.entries(QUIZ_BANK || {})) {
      if (!Array.isArray(arr)) continue;
      const group = `QUIZ_BANK.${bankKey}`;
      const st = touchGroup(group);
      totalQuestions += arr.length;
      st.questions += arr.length;
      const res = validateQuestionSet(arr, { strict: false });
      recordList(res.errors, 'error', group, group, false, (i) => arr[i]?.question || '');
      recordList(res.warnings, 'warning', group, group, false, (i) => arr[i]?.question || '');
    }

    for (const [extraKey, arr] of Object.entries(quizExtra || {})) {
      if (!Array.isArray(arr)) continue;
      const group = `QUIZ_EXTRA.${extraKey}`;
      const st = touchGroup(group);
      totalQuestions += arr.length;
      st.questions += arr.length;
      const res = validateQuestionSet(arr, { strict: false });
      recordList(res.errors, 'error', group, group, false, (i) => arr[i]?.question || '');
      recordList(res.warnings, 'warning', group, group, false, (i) => arr[i]?.question || '');
    }
  }

  const hardErrors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warning');
  const byCode = {};
  for (const f of findings) {
    const key = `${f.severity}:${f.code}`;
    byCode[key] = (byCode[key] || 0) + 1;
  }

  console.log(`Rà soát ngân hàng câu hỏi (STD-QUESTION-QUALITY v1.0):`);
  console.log(`  Tổng số câu kiểm tra: ${totalQuestions} (+ ${totalStarterLessons} bài Starter words[])`);
  console.log(`  Lỗi cứng (ERROR):     ${hardErrors.length}`);
  console.log(`  Cảnh báo (WARNING):   ${warnings.length}`);
  console.log(`Thống kê theo mã:`);
  for (const [k, n] of Object.entries(byCode).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)} × ${k}`);
  }
  if (hardErrors.length > 0) {
    console.log(`\nDanh sách lỗi cứng (${hardErrors.length}):`);
    for (const e of hardErrors) {
      console.log(`  ✗ [${e.code}] ${e.source}${e.index >= 0 ? `#${e.index}` : ''}: ${e.message}`);
    }
  }

  if (jsonOut) {
    const payload = {
      generatedAt: new Date().toISOString(),
      totalQuestions,
      totalStarterLessons,
      errorCount: hardErrors.length,
      warningCount: warnings.length,
      byCode,
      groupStats: Object.fromEntries(groupStats.entries()),
      errors: hardErrors,
      warnings,
    };
    fs.mkdirSync(path.dirname(path.resolve(jsonOut)), { recursive: true });
    fs.writeFileSync(jsonOut, JSON.stringify(payload, null, 2));
  }

  if (mdOut) {
    const today = new Date().toISOString().slice(0, 10);
    const md = [
      `# Báo cáo rà soát chất lượng ngân hàng câu hỏi (${today})`,
      '',
      '| Mục | Giá trị |',
      '|---|---|',
      '| Chuẩn áp dụng | `STD-QUESTION-QUALITY v1.0` |',
      `| Công cụ | \`node scripts/validate-lessons.mjs --questions\` |`,
      `| Tổng số câu hỏi kiểm tra | **${totalQuestions}** (+ ${totalStarterLessons} bài Starter \`words[]\`) |`,
      `| Tổng lỗi cứng (ERROR) | **${hardErrors.length}** |`,
      `| Tổng cảnh báo (WARNING) | **${warnings.length}** |`,
      '',
      '---',
      '',
      '## 1. Thống kê theo mã lỗi & cảnh báo',
      '',
      '| Mức | Mã | Số lượng |',
      '|---|---|---:|',
      ...Object.entries(byCode)
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => {
          const [sev, code] = k.split(':');
          return `| ${sev === 'error' ? '❌ Lỗi cứng' : '⚠️ Cảnh báo'} | \`${code}\` | ${n} |`;
        }),
      '',
      '## 2. Chi tiết toàn bộ lỗi cứng (ưu tiên sửa ngay Đợt 1)',
      '',
      ...(hardErrors.length === 0
        ? ['✅ Không còn lỗi cứng nào trong toàn bộ ngân hàng câu hỏi.']
        : [
            '| # | Nguồn | Mã | Mô tả |',
            '|---:|---|---|---|',
            ...hardErrors.map((e, i) => `| ${i + 1} | \`${e.source}${e.index >= 0 ? `#${e.index}` : ''}\` | \`${e.code}\` | ${e.message.replace(/\|/g, '\\|')} |`),
          ]),
      '',
      '## 3. Thống kê theo nhóm / Unit',
      '',
      '| Nhóm / Unit | Số câu | Lỗi cứng | Cảnh báo |',
      '|---|---:|---:|---:|',
      ...[...groupStats.entries()]
        .filter(([, s]) => s.errors > 0 || s.warnings > 0)
        .sort((a, b) => b[1].errors - a[1].errors || b[1].warnings - a[1].warnings)
        .map(([g, s]) => `| \`${g}\` | ${s.questions} | ${s.errors} | ${s.warnings} |`),
      '',
      '## 4. Cần Sonny xem (Đợt sau)',
      '',
      '- **Cảnh báo `Q-LEN` & `Q-POS` trên bài cũ (legacy):** không chặn người học; tiếp tục cân chỉnh cuốn chiếu khi nâng cấp bài cũ lên v2.',
      '- **Cảnh báo `Q-EXPL` trên bài cũ (legacy):** hiện chỉ bài v2 mới bắt buộc `explanation`; bài cũ sẽ bổ sung theo lộ trình nâng cấp bài v2 (`SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0`).',
    ];
    fs.mkdirSync(path.dirname(path.resolve(mdOut)), { recursive: true });
    fs.writeFileSync(mdOut, md.join('\n') + '\n');
  }

  process.exitCode = failOnHard && hardErrors.length > 0 ? 1 : 0;
  process.exit(process.exitCode);
}

// Bài golden thay thế bài cùng id trong kho (ví dụ greetings v2).
const byId = new Map(ALL_LESSONS.map((l) => [l.id, { lesson: l, source: 'repo' }]));
for (const g of golden) byId.set(g.id, { lesson: g, source: 'golden' });

const rows = [];
for (const [id, { lesson, source }] of byId) {
  if (only && !only.includes(id)) continue;
  const res = validateLesson(lesson);
  // Bài v2 phải chạy được trên UI hiện tại sau khi qua lớp tương thích.
  if (lesson.contentVersion === 2) {
    const legacy = toLegacyShape(lesson);
    for (const k of ['vocabulary', 'grammar', 'quiz']) {
      if (!Array.isArray(legacy[k])) res.errors.push(`tương thích: thiếu ${k}[] sau toLegacyShape`);
    }
    if (!legacy.quiz?.length) res.errors.push('tương thích: quiz rỗng → bước Quiz bị ẩn, bài không bao giờ hoàn thành');
  }
  rows.push({ id, source, v2: lesson.contentVersion === 2, ...res });
}

const total = rows.length;
const bad = rows.filter((r) => r.errors.length);
const byLevel = {};
for (const r of rows) {
  const b = (byLevel[r.level] ||= { n: 0, clean: 0, warn: 0 });
  b.n++;
  if (!r.errors.length && !r.warnings.length) b.clean++;
  b.warn += r.warnings.length;
}
// Gom cảnh báo theo loại (bỏ phần số/tên riêng) để biết việc nào tốn công nhất
const kinds = {};
for (const r of rows) for (const w of r.warnings) {
  const k = w.replace(/\[\d+\]/g, '[]').replace(/"[^"]*"/g, '"…"').replace(/đang có \d+/g, '').replace(/\d+\/\d+/g, 'x/y').replace(/\s+/g, ' ').trim();
  kinds[k] = (kinds[k] || 0) + 1;
}

const lines = [];
lines.push(`Kiểm tra ${total} bài (${golden.length} bài mẫu golden).`);
for (const [lv, b] of Object.entries(byLevel)) lines.push(`  ${lv.padEnd(13)} ${b.n} bài · đạt chuẩn ${b.clean} · ${b.warn} cảnh báo`);
lines.push(`Bài có LỖI: ${bad.length}`);
for (const r of bad) lines.push(`  ✗ ${r.id}${r.v2 ? ' (v2)' : ''}: ${r.errors.join(' | ')}`);
lines.push('Cảnh báo phổ biến nhất:');
for (const [k, n] of Object.entries(kinds).sort((a, b) => b[1] - a[1]).slice(0, 15)) lines.push(`  ${String(n).padStart(4)} × ${k}`);
if (verbose) for (const r of rows) if (r.warnings.length) lines.push(`\n• ${r.id} [${r.level}]\n  - ${r.warnings.join('\n  - ')}`);
console.log(lines.join('\n'));

if (mdOut) {
  const md = [`# Báo cáo kiểm tra nội dung bài học`, '', `Sinh bởi \`scripts/validate-lessons.mjs\` lúc ${new Date().toISOString()}.`, '',
    '| Cấp | Số bài | Đạt chuẩn | Cảnh báo |', '|---|---|---|---|',
    ...Object.entries(byLevel).map(([lv, b]) => `| ${lv} | ${b.n} | ${b.clean} | ${b.warn} |`), '',
    '## Cảnh báo phổ biến', '', '| Số lần | Loại |', '|---|---|',
    ...Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, n]) => `| ${n} | ${k.replace(/\|/g, '\\|')} |`), '',
    '## Chi tiết từng bài', '',
    ...rows.filter((r) => r.errors.length || r.warnings.length).map((r) => `### ${r.id} · ${r.level}${r.v2 ? ' · v2' : ''}\n${[...r.errors.map((e) => `- ❌ ${e}`), ...r.warnings.map((w) => `- ⚠️ ${w}`)].join('\n')}\n`)];
  fs.writeFileSync(mdOut, md.join('\n'));
}
process.exitCode = bad.length ? 1 : 0; // không gọi process.exit(): tránh cắt mất output khi pipe
