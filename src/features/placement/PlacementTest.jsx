// ════════════════════════════════════════════════════════════════
// PlacementTest — Kiểm tra đầu vào 5 phút (/placement, SDD-LEARNING-GROUPS §5.2)
// 3 tầng × 6 câu (A: Starter s1-*, B: int-u1..u4, C: int-u5..u10).
// Đạt ≥5/6 lên tầng tiếp; không hiện đáp án đúng lúc làm; không thưởng Sữa/Gem.
// ════════════════════════════════════════════════════════════════
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_LESSONS, BEGINNER_UNITS, INTERMEDIATE_UNITS } from '../../data/lessons';
import { useUser } from '../../hooks/useUser';
import { shuffleArray, generatePictureChallenge, generateAutoQuestions } from '../../utils/quiz-gen';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';

const TIERS = [
  { id: 'A', label: 'Tầng 1 · Nền tảng cơ bản', desc: 'Nhận diện hình ảnh & từ vựng khởi đầu' },
  { id: 'B', label: 'Tầng 2 · Sơ trung cấp', desc: 'Chào hỏi, đời sống & ngữ pháp nền (int-u1 → int-u4)' },
  { id: 'C', label: 'Tầng 3 · Giao tiếp & Ứng dụng', desc: 'Tình huống thực tế, xã hội & công việc (int-u5 → int-u10)' },
];

const LISTEN_PROMPT_RE = /^(?:hãy\s+|lắng\s+)?nghe\b/i;

export function getQuestionAudio(q) {
  return q?.audioText || q?.speak || null;
}

export function isListeningQuestion(q) {
  if (!q) return false;
  return Boolean(q.audioText || q.kind === 'listen-pick-image' || LISTEN_PROMPT_RE.test(String(q.question || '').trim()));
}

function hasSpeechSupport() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function isUsablePlacementQuestion(q, ttsAvailable) {
  if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 3) return false;
  if (q._type === 'grammar') return false;
  const audio = getQuestionAudio(q);
  const asksToListen = LISTEN_PROMPT_RE.test(String(q.question).trim());
  // Bỏ câu bảo "Nghe..." nhưng thiếu audioText/speak
  if (asksToListen && !audio) return false;
  // Trình duyệt không hỗ trợ Web Speech → bỏ câu hỏi nghe để không kẹt người học
  if (!ttsAvailable && isListeningQuestion(q)) return false;
  return true;
}

function sampleTierQuestions(tierId) {
  const ttsAvailable = hasSpeechSupport();

  if (tierId === 'A') {
    const starterUnits = BEGINNER_UNITS.filter((u) => !u.comingSoon && u.lessons.length > 0);
    const words = [];
    const seen = new Set();
    for (const u of starterUnits) {
      for (const lid of u.lessons) {
        const l = ALL_LESSONS.find((x) => x.id === lid);
        for (const w of l?.words || []) {
          const k = w.word.toLowerCase();
          if (!seen.has(k)) {
            seen.add(k);
            words.push({ ...w, category: w.category || l?.category });
          }
        }
      }
    }
    return generatePictureChallenge(words, null, 6, { allowListening: ttsAvailable });
  }

  const unitSlice = tierId === 'B'
    ? INTERMEDIATE_UNITS.slice(0, 4)   // int-u1 .. int-u4
    : INTERMEDIATE_UNITS.slice(4, 10); // int-u5 .. int-u10

  const picked = [];
  const seenQ = new Set();

  // Lấy tối thiểu 1 câu/unit trước để rải đều
  for (const unit of unitSlice) {
    const unitQs = [];
    for (const lid of unit.lessons) {
      const l = ALL_LESSONS.find((x) => x.id === lid);
      if (!l) continue;
      for (const q of l.quiz || []) unitQs.push({ ...q, _unitId: unit.id });
      if ((l.quiz || []).length === 0) {
        for (const q of generateAutoQuestions(l)) {
          if (q._type !== 'grammar') unitQs.push({ ...q, _unitId: unit.id });
        }
      }
    }
    const candidate = shuffleArray(unitQs).find(
      (q) => isUsablePlacementQuestion(q, ttsAvailable) && !seenQ.has(q.question)
    );
    if (candidate) {
      seenQ.add(candidate.question);
      picked.push(candidate);
    }
  }

  // Bù cho đủ 6 câu
  if (picked.length < 6) {
    const pool = [];
    for (const unit of unitSlice) {
      for (const lid of unit.lessons) {
        const l = ALL_LESSONS.find((x) => x.id === lid);
        if (!l) continue;
        for (const q of l.quiz || []) pool.push({ ...q, _unitId: unit.id });
      }
    }
    for (const q of shuffleArray(pool)) {
      if (picked.length >= 6) break;
      if (isUsablePlacementQuestion(q, ttsAvailable) && !seenQ.has(q.question)) {
        seenQ.add(q.question);
        picked.push(q);
      }
    }
  }

  return shuffleArray(picked).slice(0, 6);
}

export default function PlacementTest({ isNewUserOnboarding = false, onSkip }) {
  const navigate = useNavigate();
  const { userData, savePlacementResult, setLearningGroup } = useUser();

  const [started, setStarted] = useState(false);
  const [tierIdx, setTierIdx] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [tierCorrect, setTierCorrect] = useState(0);
  const [tierScores, setTierScores] = useState({ A: 0, B: 0, C: 0 });
  const [result, setResult] = useState(null);

  const handleSkipOrBack = () => {
    if (onSkip) {
      onSkip();
    } else if (!userData.learnerGroup) {
      navigate('/learning-path?pickGroup=1');
    } else {
      navigate('/learning-path');
    }
  };

  const speak = useCallback((text, rate = 0.85) => {
    if (!hasSpeechSupport() || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'en-US';
    u.rate = rate;
    window.speechSynthesis.speak(u);
  }, []);

  const currentQ = started && !result ? questions[qIdx] : null;
  const currentAudio = getQuestionAudio(currentQ);

  // Tự động phát 1 lần khi sang câu hỏi nghe mới; huỷ đọc khi thoát hoặc sang câu khác
  useEffect(() => {
    if (!currentAudio) {
      if (hasSpeechSupport()) window.speechSynthesis.cancel();
      return undefined;
    }
    const timer = setTimeout(() => speak(currentAudio, 0.85), 180);
    return () => {
      clearTimeout(timer);
      if (hasSpeechSupport()) window.speechSynthesis.cancel();
    };
  }, [started, tierIdx, qIdx, result, currentAudio, speak]);

  const playableStarterIds = useMemo(
    () => BEGINNER_UNITS.filter((u) => !u.comingSoon && u.lessons.length > 0).map((u) => u.id),
    []
  );

  const startTest = () => {
    const qsA = sampleTierQuestions('A');
    setStarted(true);
    setTierIdx(0);
    setQuestions(qsA);
    setQIdx(0);
    setTierCorrect(0);
    setTierScores({ A: 0, B: 0, C: 0 });
    setResult(null);
  };

  const finalizePlacement = (finalTierScores, passedA, passedB, passedC) => {
    let group = 'beginner';
    let activePath = 'beginner';
    let placedUnits = [];
    let summary = 'Bắt đầu từ nhóm Mới học (Starter) để xây nền vững chắc nhé!';

    if (passedC) {
      group = 'intermediate';
      activePath = 'intermediate';
      placedUnits = [...playableStarterIds, ...INTERMEDIATE_UNITS.map((u) => u.id)];
      summary = 'Xuất sắc! Bạn đã vượt toàn bộ lộ trình Trung bình, mở khoá Nâng cao C1–C2 và sẵn sàng cho nhóm Luyện thi!';
    } else if (passedB) {
      group = 'intermediate';
      activePath = 'intermediate';
      placedUnits = [...playableStarterIds, 'int-u1', 'int-u2', 'int-u3', 'int-u4'];
      summary = 'Rất tốt! Bạn vào nhóm Trung bình và bắt đầu ngay từ Unit 5 (Giao tiếp hằng ngày).';
    } else if (passedA) {
      group = 'intermediate';
      activePath = 'intermediate';
      placedUnits = [...playableStarterIds];
      summary = 'Bạn đã nắm phần khởi đầu! Bắt đầu từ nhóm Trung bình (Unit 1 · Làm quen).';
    }

    const placementRecord = {
      date: new Date().toISOString(),
      tierScores: finalTierScores,
      result: { group, activePath, placedUnits },
    };

    savePlacementResult(placementRecord, placedUnits, group, activePath);
    setResult({ group, activePath, placedUnits, summary, passedC, tierScores: finalTierScores });
  };

  const handlePick = (optIdx) => {
    const q = questions[qIdx];
    const nextCorrect = optIdx === q.correct ? tierCorrect + 1 : tierCorrect;

    if (qIdx + 1 < questions.length) {
      setTierCorrect(nextCorrect);
      setQIdx((i) => i + 1);
      return;
    }

    // Kết thúc tầng hiện tại
    const tierId = TIERS[tierIdx].id;
    const nextScores = { ...tierScores, [tierId]: nextCorrect };
    setTierScores(nextScores);

    const passedThisTier = nextCorrect >= 5;
    if (passedThisTier && tierIdx + 1 < TIERS.length) {
      const nextIdx = tierIdx + 1;
      setTierIdx(nextIdx);
      setQuestions(sampleTierQuestions(TIERS[nextIdx].id));
      setQIdx(0);
      setTierCorrect(0);
    } else {
      finalizePlacement(
        nextScores,
        nextScores.A >= 5,
        nextScores.A >= 5 && nextScores.B >= 5,
        nextScores.A >= 5 && nextScores.B >= 5 && nextScores.C >= 5
      );
    }
  };

  // ── Màn giới thiệu ──
  if (!started) {
    const showSkipToPicker = isNewUserOnboarding || !userData.learnerGroup;
    return (
      <div className="fade-in py-4 text-center" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
          <div style={{ fontSize: '3.5rem' }}>🧭</div>
          <h2 className="fw-bold mt-2">
            {showSkipToPicker ? 'Chào mừng bạn đến Cowdi! Kiểm tra đầu vào nhé' : 'Kiểm tra đầu vào (5 phút)'}
          </h2>
          <p className="text-muted">
            Chỉ mất khoảng 5 phút (tối đa 3 tầng × 6 câu) để Cowdi xếp đúng lộ trình phù hợp nhất với trình độ của bạn. Đạt ≥5/6 câu sẽ tự động lên tầng tiếp theo.
          </p>
          <ul className="list-unstyled small text-muted mb-4">
            <li>• Không trừ điểm, không áp lực — phù hợp cả người mới bắt đầu</li>
            <li>• Làm lại bất cứ lúc nào — chỉ mở thêm bài, không khoá lại tiến độ đã có</li>
          </ul>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button type="button" className="btn btn-cowdi-primary btn-lg px-4" onClick={startTest}>
              Bắt đầu kiểm tra (5 phút) →
            </button>
            <button type="button" className="btn btn-outline-secondary btn-lg" onClick={handleSkipOrBack}>
              {showSkipToPicker ? 'Bỏ qua, tự chọn nhóm học →' : 'Quay lại'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Màn kết quả ──
  if (result) {
    return (
      <div className="fade-in py-4 text-center" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
          <div style={{ fontSize: '4rem' }}><Icon name="trophy" size={76} /></div>
          <h2 className="fw-bold mt-2">Kết quả xếp lớp của bạn</h2>
          <p className="lead text-muted mb-3">{result.summary}</p>
          <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
            <span className="badge bg-light text-dark border px-3 py-2">Tầng 1: {result.tierScores.A}/6</span>
            {result.tierScores.A >= 5 && (
              <span className="badge bg-light text-dark border px-3 py-2">Tầng 2: {result.tierScores.B}/6</span>
            )}
            {result.tierScores.B >= 5 && (
              <span className="badge bg-light text-dark border px-3 py-2">Tầng 3: {result.tierScores.C}/6</span>
            )}
          </div>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg px-4"
              onClick={() => navigate(`/learning-path?tab=${result.activePath}`)}
            >
              Vào lộ trình ngay →
            </button>
            {result.passedC && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => {
                    setLearningGroup('intermediate', 'advanced');
                    navigate('/learning-path?tab=advanced');
                  }}
                >
                  Học Nâng cao C1–C2
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-lg"
                  onClick={() => {
                    setLearningGroup('exam', 'ielts');
                    navigate('/learning-path?tab=ielts');
                  }}
                >
                  Chuyển sang Luyện thi
                </button>
              </>
            )}
            <button type="button" className="btn btn-outline-secondary" onClick={startTest}>
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Đang làm bài ──
  const tier = TIERS[tierIdx];
  const q = questions[qIdx];
  if (!q) return null;
  const audioText = getQuestionAudio(q);

  return (
    <div className="fade-in quiz-viewport-stage">
      <div className="quiz-top-bar">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleSkipOrBack}>
          {isNewUserOnboarding || !userData.learnerGroup ? '✕ Bỏ qua & chọn nhóm' : '✕ Thoát'}
        </button>
        <span className="badge bg-primary-subtle text-primary">{tier.label}</span>
        <span className="text-muted small fw-bold">Câu {qIdx + 1}/{questions.length}</span>
      </div>

      <div className="progress" style={{ height: 6 }}>
        <div
          className="progress-bar progress-bar-cowdi"
          style={{ width: `${((qIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="card shadow-sm quiz-question-card">
        <div className="card-body text-center">
          {q.audioText && (
            <div className="mb-2">
              <span className="badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-1">
                🎧 Câu hỏi nghe
              </span>
            </div>
          )}
          {q.promptWord && q.kind !== 'listen-pick-image' && (
            <div className="mb-2 d-flex justify-content-center align-items-center" style={{ fontSize: '2.4rem' }}>
              {q.promptWord.swatch ? (
                <span
                  aria-label="Màu mẫu"
                  style={{
                    display: 'inline-block',
                    width: 68,
                    height: 68,
                    borderRadius: 16,
                    backgroundColor: q.promptWord.swatch,
                    border: '2px solid rgba(15, 23, 42, 0.16)',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                  }}
                />
              ) : (
                <Emoji e={q.promptWord.emoji || '🖼️'} size={48} />
              )}
            </div>
          )}
          <p className="fs-5 fw-bold mb-2">{q.question}</p>
          {audioText && (
            <div className="d-flex justify-content-center gap-2 flex-wrap mt-2">
              <button
                type="button"
                className="btn btn-cowdi-primary btn-sm rounded-pill px-3"
                onClick={() => speak(audioText, 0.85)}
              >
                <Icon name="sound" size={16} /> {q.audioText ? 'Nghe lại' : 'Nghe phát âm'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                onClick={() => speak(audioText, 0.55)}
              >
                🐢 Nghe chậm
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="row g-2">
        {q.options.map((opt, idx) => {
          const cw = q.kind === 'listen-pick-image' ? q.choiceWords?.[idx] : null;
          return (
            <div className="col-12 col-sm-6" key={idx}>
              <button
                type="button"
                className="btn btn-outline-primary w-100 quiz-option-btn fw-bold text-start d-flex align-items-center"
                onClick={() => handlePick(idx)}
              >
                <span className="me-2 text-muted">{String.fromCharCode(65 + idx)}.</span>
                {cw?.swatch && (
                  <span
                    className="me-2 flex-shrink-0"
                    style={{
                      display: 'inline-block',
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      backgroundColor: cw.swatch,
                      border: '1.5px solid rgba(15, 23, 42, 0.2)',
                    }}
                  />
                )}
                <span>{opt}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
