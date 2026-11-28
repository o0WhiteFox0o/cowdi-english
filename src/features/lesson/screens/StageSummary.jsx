import { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/Icon';
import { SLOT_META } from '../../../data/config/screens';
import { getWordId, countSkillsHit, missingSkills, wordStatus } from '../../vocab/wordProgress';
import { nextStarHint } from '../../../../shared/lesson-stars';
import WordSkillDots from './friendly/WordSkillDots';
import './friendly/friendly.css';

const SKILL_LABEL_VI = {
  listen: 'Nghe',
  read: 'Đọc',
  write: 'Viết',
  speak: 'Nói',
};

function resultCircleColor(res) {
  if (!res || !res.total) return '#27AE60';
  const ratio = res.firstTryCorrect / res.total;
  if (ratio >= 0.8) return '#27AE60';
  if (ratio >= 0.5) return '#F2C94C';
  return '#E67E22';
}

/**
 * StageSummary — Màn Tổng kết mới (PHASE3 §7 & §7b).
 * 1. Kết quả qua/chưa qua + câu pet
 * 2. "Bây giờ con có thể": lesson.objectives
 * 3. "Từ đã vào đầu x / n" + 4 chấm kỹ năng + từ cần ôn / thiếu kỹ năng
 * 4. Sao ★ 1–3 hiện lần lượt kèm âm tăng dần + dòng điều kiện sao thiếu + Sữa / Gem / Đá
 * 5. Điểm kỹ năng pet vừa cộng
 * 6. Nút Tiếp / Làm lại / Xem ngữ pháp / Lộ trình
 */
export default function StageSummary({
  lesson,
  group = 'intermediate',
  rules,
  screens = [],
  summaryData,
  wordProgress = {},
  skillGains = {},
  sandbox = false,
  hasGrammar = false,
  pathNext = null,
  play,
  onNextLesson,
  onReplay,
  onOpenGrammar,
  onExit,
}) {
  const earnedStars = summaryData?.passed ? Math.max(0, Math.min(3, Number(summaryData.stars) || 0)) : 0;
  const [shownStars, setShownStars] = useState(0);

  // Hiện sao lần lượt kèm âm thanh tăng dần (star1 -> star2 -> star3)
  useEffect(() => {
    setShownStars(0);
    if (earnedStars <= 0) return undefined;
    const timers = [];
    for (let i = 1; i <= earnedStars; i++) {
      const t = setTimeout(() => {
        setShownStars(i);
        play?.(`star${i}`);
      }, i * 340);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, [earnedStars, play]);

  const vocabStats = useMemo(() => {
    const vocab = lesson?.vocabulary || [];
    const items = vocab.map((v) => {
      const wid = getWordId(v);
      const p = wordProgress[wid];
      const hits = countSkillsHit(p);
      const missing = missingSkills(p);
      const st = wordStatus(p, rules);
      return { word: v.word, meaning: v.meaning, wid, progress: p, hits, missing, status: st };
    });
    const masteredCount = items.filter((it) => it.hits >= 4).length;
    const needFollowUp = items.filter((it) => it.status === 'review' || it.hits < 4);
    return { items, masteredCount, total: items.length, needFollowUp };
  }, [lesson?.vocabulary, wordProgress, rules]);

  const starHint = summaryData?.passed
    ? nextStarHint({
        group,
        stars: earnedStars,
        accuracy: summaryData.accuracy ?? 0,
        bossPerfect: Boolean(summaryData.bossPerfect),
      })
    : `Đạt ≥${Math.round((rules?.lessonPassRate || 0.7) * 100)}% ở màn Boss để nhận ★ đầu tiên!`;

  const objectives = Array.isArray(lesson?.objectives) ? lesson.objectives.slice(0, 3) : [];
  const totalSkillGains = Object.values(skillGains || {}).reduce((a, b) => a + (Number(b) || 0), 0);

  return (
    <div className="ff-shell fade-in" style={{ gap: 12 }}>
      {/* 1. Kết quả + Sao 1–3 */}
      <div className="ff-card text-center">
        <div className="d-flex justify-content-center mb-1">
          <Icon name={summaryData.passed ? 'trophy' : 'muscle'} size={64} />
        </div>
        <h2 className="h4 fw-bold mb-1">
          {summaryData.passed
            ? 'Hoàn thành ải học!'
            : `Chưa giải được hết sương — cần ≥${Math.round((rules?.lessonPassRate || 0.7) * 100)}%`}
        </h2>
        <div className="small text-muted mb-2">
          Boss: <strong>{summaryData.bossScore}/{summaryData.bossTotal}</strong>
          {summaryData.accuracy != null && (
            <> · Chính xác lần đầu: <strong>{Math.round(summaryData.accuracy * 100)}%</strong></>
          )}
        </div>

        {/* Sao hiện lần lượt */}
        <div className="ff-star-row my-2" aria-label={`Đạt ${earnedStars} trên 3 sao`}>
          {[1, 2, 3].map((idx) => {
            const lit = idx <= shownStars;
            return (
              <span key={idx} className={`ff-star-item ${lit ? 'is-earned' : 'is-empty'}`}>
                {lit ? '★' : '☆'}
              </span>
            );
          })}
        </div>

        {starHint && (
          <div className="small fw-semibold mt-1" style={{ color: '#9A6324' }}>
            {starHint}
          </div>
        )}

        {/* Phần thưởng: Sữa theo sao + Gem + Đá */}
        {!sandbox && (
          <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap mt-3">
            <span className="badge bg-primary fs-6 px-3 py-2">🥛 +{summaryData.milk} Sữa</span>
            {summaryData.gem > 0 && <span className="badge bg-info text-dark fs-6 px-3 py-2">💎 +{summaryData.gem} Gem</span>}
            {summaryData.stone > 0 && <span className="badge bg-success fs-6 px-3 py-2">💠 +{summaryData.stone} Đá</span>}
          </div>
        )}

        {/* Vòng kết quả các màn */}
        <div className="ss-summary-circles mt-3" aria-label="Kết quả từng màn kỹ năng">
          {screens.map((sc, i) => {
            const res = summaryData.results?.[i];
            const meta = SLOT_META[sc.slot] || SLOT_META.intro;
            return (
              <div key={`${sc.slot}-${i}`} className="ss-summary-circle-item">
                <div
                  className="ss-summary-circle"
                  style={{ background: resultCircleColor(res) }}
                  title={`${meta.label} (${sc.code}): ${res?.firstTryCorrect ?? 0}/${res?.total ?? 0}`}
                >
                  <Icon name={meta.icon} size={15} />
                </div>
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>{meta.label}</small>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bây giờ con có thể */}
      {objectives.length > 0 && (
        <div className="ff-card py-2 px-3">
          <div className="small fw-bold mb-1" style={{ color: '#2E7D32' }}>✓ Bây giờ con có thể:</div>
          <ul className="mb-0 ps-3 small" style={{ lineHeight: 1.5 }}>
            {objectives.map((obj, idx) => <li key={idx}>{obj}</li>)}
          </ul>
        </div>
      )}

      {/* 3. Từ đã vào đầu x / n + 4 chấm từng từ */}
      {vocabStats.total > 0 && (
        <div className="ff-card py-2 px-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold small">Từ đã vào đầu (đủ 4 kỹ năng)</span>
            <span className="badge rounded-pill text-bg-success">
              {vocabStats.masteredCount} / {vocabStats.total}
            </span>
          </div>

          <div className="d-flex flex-column gap-1" style={{ maxHeight: 180, overflowY: 'auto' }}>
            {vocabStats.items.map((it) => (
              <div
                key={it.wid}
                className="d-flex align-items-center justify-content-between gap-2 px-2 py-1 rounded-3"
                style={{ background: it.status === 'review' ? '#FEF3C7' : '#FFFDF7', border: '1px solid #F0E2C4' }}
              >
                <div className="small">
                  <strong>{it.word}</strong> <span className="text-muted">— {it.meaning}</span>
                  {it.status === 'review' && <span className="badge text-bg-warning ms-1" style={{ fontSize: '0.65rem' }}>Cần ôn</span>}
                </div>
                <WordSkillDots progress={it.progress} compact />
              </div>
            ))}
          </div>

          {vocabStats.needFollowUp.length > 0 && (
            <div className="small text-muted mt-2">
              Sẽ gặp lại ở ải sau:{' '}
              {vocabStats.needFollowUp.slice(0, 4).map((w) => (
                <span key={w.wid} className="me-2">
                  <strong>{w.word}</strong> ({w.missing.map((m) => SKILL_LABEL_VI[m]).join(', ') || 'ôn lại'})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Điểm kỹ năng pet vừa cộng */}
      {totalSkillGains > 0 && (
        <div className="ff-card py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="small fw-bold">🐾 Điểm kỹ năng Pet vừa cộng:</span>
          <div className="d-flex gap-2 flex-wrap small">
            {Object.entries(skillGains).filter(([, v]) => v > 0).map(([sk, val]) => (
              <span key={sk} className="badge rounded-pill text-bg-light border">
                {SKILL_LABEL_VI[sk] || sk}: <strong>+{val}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Câu sai cần ôn (nếu có) */}
      {summaryData.wrongAnswers?.length > 0 && (
        <div className="ff-card py-2 px-3">
          <div className="small fw-bold text-danger mb-2">Câu sai cần nhớ ({summaryData.wrongAnswers.length})</div>
          <div className="d-flex flex-column gap-1">
            {summaryData.wrongAnswers.slice(0, 5).map((w, wi) => (
              <div key={wi} className="p-2 rounded bg-light small">
                <div className="fw-bold">{w.question}</div>
                <div className="text-success fw-bold">Đáp án đúng: {w.correct}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Nút hành động */}
      <div className="d-flex gap-2 justify-content-center flex-wrap mt-1">
        {summaryData.passed && pathNext?.type === 'lesson' && pathNext.lessonId !== lesson?.id && !sandbox ? (
          <button
            type="button"
            className="btn btn-cowdi-primary ff-tap-btn px-4 d-inline-flex align-items-center gap-2"
            onClick={onNextLesson}
          >
            <Icon name="play" size={18} /> Tiếp
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-cowdi-primary ff-tap-btn px-4 d-inline-flex align-items-center gap-2"
            onClick={onExit}
          >
            <Icon name="road" size={18} /> Về lộ trình
          </button>
        )}

        <button
          type="button"
          className="btn btn-warning ff-tap-btn px-3 d-inline-flex align-items-center gap-2"
          onClick={onReplay}
        >
          <Icon name="refresh" size={16} /> Làm lại (xáo mới)
        </button>

        {hasGrammar && (
          <button
            type="button"
            className="btn btn-outline-secondary ff-tap-btn px-3 d-inline-flex align-items-center gap-2"
            onClick={onOpenGrammar}
          >
            <Icon name="book" size={16} /> Xem ngữ pháp
          </button>
        )}
      </div>
    </div>
  );
}
